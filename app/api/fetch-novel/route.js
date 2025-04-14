// import axios from 'axios';
// import { load } from 'cheerio';
// import iconv from 'iconv-lite';

// export async function POST(req) {
//   const { url } = await req.json();
//   if (!url || !url.includes('69shuba')) {
//     return new Response(JSON.stringify({ error: 'Invalid or missing URL' }), { status: 400 });
//   }

//   try {
//     const response = await axios.get(url, {
//       responseType: 'arraybuffer',
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//       }
//     });
//     const html = iconv.decode(Buffer.from(response.data), 'gbk');
//     const $ = load(html);

//     const chapters = [];
//     $('#catalog ul li a').each((i, el) => {
//       const title = $(el).text().trim();
//       const chapterUrl = $(el).attr('href');
//       if (title && chapterUrl) {
//         chapters.push({ title, url: chapterUrl });
//       }
//     });

//     if (chapters.length === 0) {
//       return new Response(JSON.stringify({ error: 'No chapters found' }), { status: 404 });
//     }

//     chapters.sort((a, b) => {
//       const numA = parseInt(a.title.replace('第', '').replace('章', '').split(' ')[0]);
//       const numB = parseInt(b.title.replace('第', '').replace('章', '').split(' ')[0]);
//       return numA - numB;
//     });

//     return new Response(JSON.stringify({ chapters }), {
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ error: 'Failed to fetch novel data' }), { status: 500 });
//   }
// }