// Application Version Information
// Updated automatically when changes are made

const APP_VERSION = {
  cacheVersion: 'v30.3',
  timestamp: 'July 18, 2025 - 00:45:00',
  buildDate: '2025-07-18',
  lastUpdate: 'Updated apparel with 6 specific garment types, DTF-only decoration, 2-column layout'
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