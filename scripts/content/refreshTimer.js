window.addEventListener("click", notifyExtension);

function notifyExtension(e) {
  browser.runtime.sendMessage({ type: "pageClick" });
}