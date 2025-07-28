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

// Inget tema-hantering behövs

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
function updateContent(html, mode = 'list') {
  const root = document.getElementById('content');
  if (root) {
    // Omedelbar uppdatering utan fade-effekter
    root.innerHTML = html;
    
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
  }
}

// Lyssna på postMessage från parent
window.addEventListener('message', (event) => {
  if (event.data?.type === 'html') {
    updateContent(event.data.payload, event.data.mode);
  }
});

// Vänta på att DOM är redo innan vi skickar iframe-ready
document.addEventListener('DOMContentLoaded', () => {
  // Skicka bekräftelse till parent att iframe är redo
  window.parent.postMessage({ type: 'iframe-ready' }, '*');
}); 