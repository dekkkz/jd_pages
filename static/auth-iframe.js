// JWT Authentication för iframe media-requests
let authToken = null;

// Lyssna på token från parent
window.addEventListener('message', function(event) {
  if (event.data.type === 'auth-token') {
    authToken = event.data.token;
  }
});

// Lägg till Authorization-header för media-requests
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  if ((url.includes('/media/') || url.includes('/iframe-media/')) && authToken) {
    options.headers = {
      ...options.headers,
      'Authorization': 'Bearer ' + authToken
    };
  }
  return originalFetch(url, options);
}; 