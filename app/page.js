'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [chapter, setChapter] = useState({ chapterTitle: '', translatedContent: '', prevChapter: '', nextChapter: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a chapter URL');
      return;
    }
    console.log('Submitting URL:', url); // Log the URL being submitted
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/translate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      console.log('API Response:', data); // Log the API response
      if (data.error) throw new Error(data.error);
      setChapter(data);
    } catch (err) {
      console.log('API Error:', err.message); // Log any errors
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNavigation = (newUrl) => {
    console.log('Navigating to:', newUrl); // Log navigation attempt
    setUrl(newUrl);
  };

  useEffect(() => {
    if (url) {
      console.log('URL changed, fetching:', url); // Log when URL changes
      handleSubmit({ preventDefault: () => {} }); // Trigger fetch with new URL
    }
  }, [url]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter chapter URL (e.g., https://www.69shuba.com/txt/84418/40150610)"
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '5px 10px' }}>
          {loading ? 'Loading...' : 'Load Chapter'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {chapter.chapterTitle && (
        <div style={{ marginTop: '20px' }}>
          <h1>{chapter.chapterTitle}</h1>
          <div dangerouslySetInnerHTML={{ __html: chapter.translatedContent }}></div>
          <div style={{ marginTop: '20px' }}>
            {chapter.prevChapter && (
              <button onClick={() => handleNavigation(chapter.prevChapter)}>Previous Chapter</button>
            )}
            {chapter.nextChapter && (
              <button onClick={() => handleNavigation(chapter.nextChapter)} style={{ marginLeft: '10px' }}>
                Next Chapter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
