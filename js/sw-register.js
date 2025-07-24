if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the correct service worker path
    let swPath;
    if (window.location.hostname === 'localhost') {
      // For local development, always use absolute path from root
      swPath = '/sw.js';
    } else if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'docsol.ca') {
      // For Vercel deployment (both vercel.app and custom domains)
      swPath = '/sw.js';
    } else {
      // For GitHub Pages or other hosting
      swPath = '/hp-indigo-calculator/sw.js';
    }
    
    console.log('Registering service worker at:', swPath);
    
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}