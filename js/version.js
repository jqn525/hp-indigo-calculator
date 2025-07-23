// Application Version Information
// Updated automatically when changes are made

const APP_VERSION = {
  cacheVersion: 'v33',
  timestamp: 'July 20, 2025 - 12:30 AM',
  buildDate: '2025-07-20',
  lastUpdate: 'Bootstrap navbar implementation: Converted bottom navigation to Bootstrap navbar component'
};

// Display version info in the page
function displayVersionInfo() {
  // Create version display element
  const versionDiv = document.createElement('div');
  versionDiv.className = 'version-display';
  versionDiv.innerHTML = `${APP_VERSION.cacheVersion} - ${APP_VERSION.timestamp}`;
  
  // Add to page
  document.body.appendChild(versionDiv);
  
  // Log to console for debugging
  console.log('HP Indigo Calculator Version:', APP_VERSION);
}

// Initialize version display when DOM is ready
document.addEventListener('DOMContentLoaded', displayVersionInfo);