import { debugLog } from './auditLogger';

// Browser detection utility for handling browser-specific issues
export interface BrowserInfo {
  name: string;
  version: string;
  isBrave: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isMobile: boolean;
}

export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor || '';
  
  let browserName = 'Unknown';
  let version = '';
  let isBrave = false;
  let isChrome = false;
  let isFirefox = false;
  let isSafari = false;
  let isEdge = false;
  
  // Detect Brave specifically (it masquerades as Chrome)
  if ((navigator as any).brave && (navigator as any).brave.isBrave) {
    isBrave = true;
    browserName = 'Brave';
  }
  // Alternative Brave detection method
  else if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && vendor.includes('Google')) {
    // Check for Brave-specific features
    try {
      if ('webkitResolveLocalFileSystemURL' in window || 'webkitRequestFileSystem' in window) {
        // This is a heuristic - Brave often blocks these APIs
        isBrave = true;
        browserName = 'Brave (detected)';
      } else {
        isChrome = true;
        browserName = 'Chrome';
      }
    } catch {
      isChrome = true;
      browserName = 'Chrome';
    }
  }
  // Firefox
  else if (userAgent.includes('Firefox')) {
    isFirefox = true;
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  }
  // Safari
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    isSafari = true;
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  }
  // Edge
  else if (userAgent.includes('Edg')) {
    isEdge = true;
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  }
  
  // Chrome version detection
  if (isChrome || isBrave) {
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  }
  
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return {
    name: browserName,
    version,
    isBrave,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile
  };
}

// Brave-specific file upload handling
export function handleBraveFileUpload(input: HTMLInputElement, callback: (files: FileList) => void) {
  const browser = detectBrowser();
  
  if (browser.isBrave) {
    debugLog('general', 'log_statement', 'Detected Brave browser - applying compatibility fixes')
    
    // Add event listeners for Brave-specific issues
    const originalOnChange = input.onchange;
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        // Validate files for Brave browser issues
        const validFiles: File[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Check for common Brave browser upload issues
          if (file.size === 0) {
            console.warn(`Brave browser detected empty file: ${file.name} - retrying...`);
            continue;
          }
          
          if (file.name === '' || file.name === 'undefined') {
            console.warn('Brave browser detected invalid filename - skipping');
            continue;
          }
          
          validFiles.push(file);
        }
        
        if (validFiles.length > 0) {
          // Create new FileList with valid files
          const dataTransfer = new DataTransfer();
          validFiles.forEach(file => dataTransfer.items.add(file));
          callback(dataTransfer.files);
        } else {
          console.error('No valid files after Brave browser validation');
        }
      }
      
      // Reset input for next upload
      target.value = '';
    };
    
    // Handle click events for Brave
    const originalClick = input.click;
    input.click = function() {
      try {
        originalClick.call(this);
      } catch (error) {
        console.warn('Brave browser click failed, using fallback method');
        // Fallback method for Brave
        setTimeout(() => {
          this.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }, 10);
      }
    };
  }
}

// Check if current browser has known file upload issues
export function hasFileUploadIssues(): boolean {
  const browser = detectBrowser();
  return browser.isBrave; // Add other browsers with issues here
}

// Get browser-specific file upload recommendations
export function getFileUploadRecommendations(): string[] {
  const browser = detectBrowser();
  const recommendations: string[] = [];
  
  if (browser.isBrave) {
    recommendations.push('Brave browser detected: If uploads fail, try disabling Shields temporarily');
    recommendations.push('For best experience with file uploads, consider using Chrome or Firefox');
    recommendations.push('Ensure files are not empty and have valid names');
  }
  
  if (browser.isMobile) {
    recommendations.push('Mobile device detected: Large file uploads may be slower');
    recommendations.push('Ensure stable internet connection for uploads');
  }
  
  return recommendations;
}

// First load navigation fix for browsers
export function applyFirstLoadNavigationFix(): void {
  const browser = detectBrowser();
  
  if (browser.isBrave || browser.isChrome) {
    // Check if this is the first load
    const isFirstLoad = sessionStorage.getItem('eva_first_load') === null;
    
    if (isFirstLoad) {
      sessionStorage.setItem('eva_first_load', 'false');
      
      // Add global click handler for first navigation
      const handleFirstNavigation = (event: Event) => {
        const target = event.target as HTMLElement;
        
        // Check if this is a navigation link
        if (target.tagName === 'A' || target.closest('a') || 
            target.classList.contains('nav-link') || 
            target.closest('.nav-link')) {
          
          debugLog('general', 'log_statement', 'First navigation detected - applying browser fix')
          
          // Force a small delay and refresh to fix routing
          setTimeout(() => {
            window.location.reload();
          }, 100);
          
          // Remove this listener after first use
          document.removeEventListener('click', handleFirstNavigation);
        }
      };
      
      document.addEventListener('click', handleFirstNavigation);
    }
  }
} 