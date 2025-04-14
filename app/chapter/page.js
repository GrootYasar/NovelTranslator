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
    console.log('Submitting URL:', url);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/translate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (data.error) throw new Error(data.error);
      setChapter(data);
    } catch (err) {
      console.log('API Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNavigation = (newUrl) => {
    console.log('Navigating to:', newUrl);
    setUrl(newUrl);
  };

  useEffect(() => {
    if (url) {
      console.log('URL changed, fetching:', url);
      handleSubmit({ preventDefault: () => {} });
    }
  }, [url]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold">Novel Translator</h1>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-lg shadow-md">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter chapter URL (e.g., https://www.69shuba.com/txt/84418/40150610)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-200"
            >
              {loading ? 'Loading...' : 'Load Chapter'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {chapter.chapterTitle && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">{chapter.chapterTitle}</h1>
            <div
              className="prose max-w-none text-gray-800 leading-relaxed text-justify"
              style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
              dangerouslySetInnerHTML={{ __html: chapter.translatedContent }}
            />
            <div className="mt-8 flex gap-4 justify-center">
              {chapter.prevChapter && (
                <button
                  onClick={() => handleNavigation(chapter.prevChapter)}
                  className="bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Previous Chapter
                </button>
              )}
              {chapter.nextChapter && (
                <button
                  onClick={() => handleNavigation(chapter.nextChapter)}
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Next Chapter
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}