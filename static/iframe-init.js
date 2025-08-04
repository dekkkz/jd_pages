// iframe-init.js - Central postMessage-hantering för iframe-problem-kort

// KaTeX-konfiguration
const katexOpts = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\\\[', right: '\\\\]', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\\\(', right: '\\)', display: false }
  ],
  throwOnError: false,
  strict: "ignore"
};

const PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// Observera bilder och begär blobar vid behov
const imgObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const orig = img.getAttribute('data-orig');
    if (orig) {
      window.parent.postMessage({ type: 'request-img', url: orig }, '*');
      imgObserver.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

function interceptImageLoading() {
  const images = document.querySelectorAll('img[data-orig]');
  images.forEach((img, index) => {
    // Ensure placeholder src
    img.src = PLACEHOLDER_SRC;
    img.style.opacity = '1';
    img.style.transition = 'opacity 0.3s ease-in-out';
    imgObserver.observe(img);
  });
}

// Hantera meddelanden från parent (html + blob)
window.addEventListener('message', (event) => {
  if (event.data?.type === 'html') {
    updateContent(event.data.payload, event.data.mode, event.data.resetScroll);
    return;
  }
  if (event.data?.type === 'img-blob') {
    const { orig, blob } = event.data;
    const objUrl = URL.createObjectURL(blob);
    document.querySelectorAll(`img[data-orig="${orig}"]`).forEach((img) => {
      img.src = objUrl;
      img.removeAttribute('data-orig');
      img.onload = () => URL.revokeObjectURL(objUrl);
    });
  }
});

// -------------------------------------------------------------
// Knapp-event-hantering
function attachButtonHandlers(root) {
  const addButtons = root.querySelectorAll('.add-btn-1, .add-btn-2, .remove-btn, .edit-btn');
  
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const problemId = btn.getAttribute('data-problem-id');
      
      if (problemId) {
        const event = {
          type: btn.classList.contains('add-btn-1') ? 'add-to-memory-1' :
                 btn.classList.contains('add-btn-2') ? 'add-to-memory-2' :
                 btn.classList.contains('remove-btn') ? 'remove-from-memory' :
                 'edit',
          problemId: parseInt(problemId)
        };
        window.parent.postMessage(event, '*');
      }
    });
  });
}

// HTML-uppdatering via postMessage
function updateContent(html, mode = 'list', resetScroll = false) {
  const root = document.getElementById('content');
  if (root) {
    // Omedelbar uppdatering utan fade-effekter
    root.innerHTML = html;
    // Reset scroll if parent says so
    if (resetScroll) window.scrollTo(0, 0);
    
    // Rendera matematik med KaTeX
    if (window.renderMathInElement) {
      renderMathInElement(root, katexOpts);
    }

    // Event handling för list-läge
    if (mode === 'list') {
      attachButtonHandlers(root);
    } else {
      // Preview-läge: tvinga bedömning att vara expanderad
      const detailsElement = root.querySelector('details.assessment-details');
      if (detailsElement) {
        detailsElement.open = true;
      }
    }

    // Intercept & observera bilder efter HTML-uppdatering
    interceptImageLoading();
  }
}

// Vänta på att DOM är redo innan vi skickar iframe-ready
document.addEventListener('DOMContentLoaded', () => {
  // Skicka bekräftelse till parent att iframe är redo
  window.parent.postMessage({ type: 'iframe-ready' }, '*');
}); 