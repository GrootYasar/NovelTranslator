import axios from 'axios';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const BASE_URL = 'https://www.69shuba.com';

export async function POST(req) {
  const { url } = await req.json();
  console.log('Received request for URL:', url);
  if (!url || !url.includes('69shuba')) {
    return new Response(JSON.stringify({ error: 'Invalid or missing URL' }), { status: 400 });
  }

  try {
    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('translations')
      .select('*')
      .eq('chapter_url', url)
      .single();

    if (cached && !cacheError) {
      console.log('Returning cached data for:', url);
      return new Response(JSON.stringify({
        chapterTitle: cached.chapter_title,
        translatedContent: cached.translated_content,
        prevChapter: cached.prev_chapter,
        nextChapter: cached.nextChapter,
        isCached: true,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Fetching HTML for:', url);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = iconv.decode(Buffer.from(response.data), 'gbk');
    const $ = load(html);

    const chapterTitle = $('.txtnav h1').text().trim() || 'Chapter';
    let content = $('.txtnav').html() || '';
    if (!content) {
      return new Response(JSON.stringify({ error: 'No content found' }), { status: 404 });
    }

    // Remove ads and scripts while preserving structure
    $('.txtnav .contentadv, .txtnav .bottom-ad, .txtnav script').remove();
    content = $('.txtnav').html() || '';

    // Extract original paragraphs
    const $content = load(content);
    const paragraphs = $content.root().find('p').length
      ? $content.root().find('p')
      : $content.root().contents().filter((i, el) => el.type === 'text' && $(el).text().trim());
    const originalSegments = [];
    paragraphs.each((i, el) => {
      const text = $(el).text().trim();
      if (text) originalSegments.push(text);
    });
    if (originalSegments.length === 0) {
      const textContent = $content.text().trim();
      originalSegments.push(...textContent.split('\n\n').map(t => t.trim()).filter(t => t)); // Use double newlines for paragraphs
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Translate the entire chapter at once
    console.log('Translating full chapter...');
    const result = await model.generateContent(`Translate the following Chinese text to English naturally and fluently:\n\n${originalSegments.join('\n\n')}`);
    const translatedText = result.response.text();

    // Split translated text into paragraphs based on original structure
    const translatedSegments = translatedText.split('\n\n').map(t => t.trim()).filter(t => t);
    let translatedContent = '';
    for (let i = 0; i < Math.min(originalSegments.length, translatedSegments.length); i++) {
      translatedContent += `<p>${translatedSegments[i] || ''}</p>\n`;
    }
    if (translatedSegments.length < originalSegments.length) {
      for (let i = translatedSegments.length; i < originalSegments.length; i++) {
        translatedContent += `<p>${originalSegments[i]}</p>\n`; // Fallback to original if translation is short
      }
    }

    // Cache the translation
    const prevLink = $('.page1 a').filter((i, el) => $(el).text().includes('上一章'));
    const nextLink = $('.page1 a').filter((i, el) => $(el).text().includes('下一章'));
    const prevChapter = prevLink.length ? new URL(prevLink.attr('href'), BASE_URL).href : '';
    const nextChapter = nextLink.length ? new URL(nextLink.attr('href'), BASE_URL).href : '';
    console.log('Extracted prevChapter:', prevChapter, 'nextChapter:', nextChapter);

    await supabase.from('translations').upsert({
      chapter_url: url,
      chapter_title: chapterTitle,
      translated_content: translatedContent,
      prev_chapter: prevChapter,
      next_chapter: nextChapter,
    });

    return new Response(JSON.stringify({
      chapterTitle,
      translatedContent,
      prevChapter,
      nextChapter,
      isCached: false,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error processing chapter:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chapter' }), { status: 500 });
  }
}