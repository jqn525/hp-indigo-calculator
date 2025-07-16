let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const installPrompt = document.getElementById('installPrompt');
const installPromptBtn = document.getElementById('installPromptBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (installBtn) {
    installBtn.style.display = 'block';
  }
  
  setTimeout(() => {
    if (installPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
      installPrompt.classList.add('show');
    }
  }, 5000);
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
      if (installPrompt) installPrompt.classList.remove('show');
    });
  }
}

if (installBtn) {
  installBtn.addEventListener('click', installApp);
}

if (installPromptBtn) {
  installPromptBtn.addEventListener('click', installApp);
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  if (installBtn) installBtn.style.display = 'none';
  if (installPrompt) installPrompt.classList.remove('show');
});

function setActiveNav() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    const fullPath = new URL(href, window.location.href).pathname;
    
    if (fullPath === currentPath) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);