if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the correct service worker path
    let swPath;
    if (window.location.hostname === 'localhost') {
      // For local development, always use absolute path from root
      swPath = '/sw.js';
    } else {
      // For GitHub Pages
      swPath = '/hp-indigo-calculator/sw.js';
    }
    
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}