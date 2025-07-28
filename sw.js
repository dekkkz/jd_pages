const CACHE_NAME = 'judgement-day-v1';
const KATEX_FILES = [
  '/katex/katex.min.css',
  '/katex/katex.min.js',
  '/katex/auto-render.min.js',
  '/katex/fonts/KaTeX_Main-Regular.woff2',
  '/katex/fonts/KaTeX_Main-Bold.woff2',
  '/katex/fonts/KaTeX_Main-Italic.woff2',
  '/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  '/katex/fonts/KaTeX_Math-Italic.woff2',
  '/katex/fonts/KaTeX_Caligraphic-Regular.woff2'
];

// Install event - cache KaTeX files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching KaTeX files for offline use');
        return cache.addAll(KATEX_FILES);
      })
      .catch((error) => {
        console.warn('Failed to cache KaTeX files:', error);
      })
  );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
  // Only handle KaTeX files
  if (KATEX_FILES.some(file => event.request.url.includes(file))) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available, otherwise fetch from network
          return response || fetch(event.request);
        })
        .catch(() => {
          // If both cache and network fail, return a basic response
          console.warn('KaTeX file not available offline:', event.request.url);
          return new Response('', { status: 404 });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 