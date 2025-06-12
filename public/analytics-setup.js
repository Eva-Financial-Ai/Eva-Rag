// Cloudflare Web Analytics
(function() {
  // Analytics configuration
  const analyticsConfig = {
    beacon: 'https://static.cloudflareinsights.com/beacon.min.js',
    token: 'AWEX5XQzH6VA-B0TzyEZSvIz5E6_m3PfQ400g2bp'
  };

  // Load Cloudflare Analytics
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = analyticsConfig.beacon;
    script.defer = true;
    script.setAttribute('data-cf-beacon', JSON.stringify({
      token: analyticsConfig.token
    }));
    document.head.appendChild(script);
    
    console.log('🔍 Cloudflare Web Analytics initialized');
  }
})(); 