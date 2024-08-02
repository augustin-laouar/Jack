window.addEventListener("click", notifyExtension);

function notifyExtension(e) {
  browser.runtime.sendMessage({ endpoint: 'session', type: 'update' });
}