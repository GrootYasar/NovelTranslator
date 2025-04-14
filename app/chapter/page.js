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
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

          body {
            background: #000000;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          header {
            background: linear-gradient(90deg, #1e3c72, #2a5298);
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .input-form {
            background: #1a1a1a;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            margin: 2rem auto;
            max-width: 800px;
            display: flex;
            gap: 1rem;
          }
          .input-form input {
            flex: 1;
            padding: 0.75rem;
            background: #2d2d2d;
            border: 1px solid #444444;
            border-radius: 5px;
            color: #ffffff;
            font-size: 1rem;
            outline: none;
          }
          .input-form input:focus {
            border-color: #4dabf7;
            box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.3);
          }
          .input-form button {
            padding: 0.75rem 1.5rem;
            background: #4dabf7;
            color: #000000;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s;
          }
          .input-form button:hover {
            background: #339af0;
          }
          .input-form button:disabled {
            background: #666666;
            cursor: not-allowed;
          }
          .error {
            color: #ff4444;
            text-align: center;
            margin: 1rem 0;
            font-size: 1.1rem;
          }
          .chapter-container {
            background: #1a1a1a;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            margin: 0 auto 2rem;
            max-width: 800px;
          }
          .chapter-title {
            font-size: 2.25rem;
            font-weight: 700;
            color: #4dabf7;
            margin-bottom: 1.5rem;
            text-align: center;
          }
          .chapter-content p {
            font-size: 1.15rem;
            line-height: 1.8;
            color: #e0e0e0;
            margin-bottom: 1.25rem;
            text-align: justify;
          }
          .nav-buttons {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          .nav-buttons button {
            padding: 0.75rem 1.5rem;
            background: #4dabf7;
            color: #000000;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s;
          }
          .nav-buttons button:hover {
            background: #339af0;
          }
          .nav-buttons .prev-btn {
            background: #666666;
            color: #ffffff;
          }
          .nav-buttons .prev-btn:hover {
            background: #888888;
          }
          @media (max-width: 600px) {
            .input-form, .chapter-container {
              margin: 1rem;
              padding: 1rem;
            }
            .input-form {
              flex-direction: column;
              gap: 0.5rem;
            }
            .input-form input, .input-form button {
              width: 100%;
            }
            .chapter-title {
              font-size: 1.75rem;
            }
            .chapter-content p {
              font-size: 1rem;
            }
          }
        `}
      </style>
      <header>
        <h1>Novel Translator</h1>
      </header>
      <main>
        <div className="input-form">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter chapter URL (e.g., https://www.69shuba.com/txt/84418/40150610)"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Load Chapter'}
              </button>
            </div>
          </form>
        </div>
        {error && <p className="error">{error}</p>}
        {chapter.chapterTitle && (
          <div className="chapter-container">
            <h1 className="chapter-title">{chapter.chapterTitle}</h1>
            <div className="chapter-content" dangerouslySetInnerHTML={{ __html: chapter.translatedContent }} />
            <div className="nav-buttons">
              {chapter.prevChapter && (
                <button onClick={() => handleNavigation(chapter.prevChapter)} className="prev-btn">
                  Previous Chapter
                </button>
              )}
              {chapter.nextChapter && (
                <button onClick={() => handleNavigation(chapter.nextChapter)} className="next-btn">
                  Next Chapter
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}