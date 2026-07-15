(() => {
  const body = document.body;
  const property = body.dataset.tawkProperty;
  const widget = body.dataset.tawkWidget || 'default';
  if (!property) return;
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://embed.tawk.to/${property}/${widget}`;
  script.charset = 'UTF-8';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
})();
