# 🌐 DNS Setup Guide - demo.eva.ai

## 🎯 **Objective**
Configure `demo.eva.ai` to point to the EVA Platform on Cloudflare Pages

## ✅ **Current Status**
- **✅ EVA AI Auto-Popup:** REMOVED (no more double windows)
- **✅ Latest Deployment:** https://d8b65f8f.eva-ai-platform.pages.dev
- **🔧 Pending:** Custom domain configuration

---

## 🛠️ **Step 1: Cloudflare Pages Custom Domain Setup**

### **A. Via Cloudflare Dashboard:**
1. **Login to Cloudflare:** https://dash.cloudflare.com
2. **Navigate to:** `Workers & Pages` → `eva-ai-platform`
3. **Go to:** `Custom domains` tab
4. **Click:** `Set up a custom domain`
5. **Enter:** `demo.eva.ai`
6. **Click:** `Continue` → `Activate domain`

### **B. Expected Result:**
```
✅ Domain: demo.eva.ai
✅ Status: Active
✅ SSL: Automatic (Universal SSL)
✅ Target: eva-ai-platform.pages.dev
```

---

## 🌍 **Step 2: DNS Records Configuration**

### **Required DNS Record:**
```dns
Type:   CNAME
Name:   demo
Target: eva-ai-platform.pages.dev
TTL:    Auto (or 300 seconds for testing)
Proxy:  🟠 Proxied (recommended)
```

### **Alternative A Record (if needed):**
```dns
Type:   A  
Name:   demo
IPv4:   [Get from: dig eva-ai-platform.pages.dev]
TTL:    Auto
Proxy:  🟠 Proxied
```

### **Where to Add DNS Records:**
- **Domain Registrar:** Where `eva.ai` is registered
- **DNS Provider:** If using external DNS (Cloudflare, Route53, etc.)
- **Control Panel:** Domain management interface

---

## 🔍 **Step 3: Verification Commands**

### **DNS Propagation Check:**
```bash
# Check DNS resolution
dig demo.eva.ai

# Check with different DNS servers
dig @8.8.8.8 demo.eva.ai
dig @1.1.1.1 demo.eva.ai

# Check CNAME specifically  
dig CNAME demo.eva.ai
```

### **HTTP Response Check:**
```bash
# Test HTTP response
curl -I https://demo.eva.ai

# Test specific routes
curl -I https://demo.eva.ai/dashboard
curl -I https://demo.eva.ai/ai-assistant
```

### **SSL Certificate Check:**
```bash
# Test SSL certificate
openssl s_client -connect demo.eva.ai:443 -servername demo.eva.ai

# Or use online tool
# https://www.ssllabs.com/ssltest/analyze.html?d=demo.eva.ai
```

---

## ⏱️ **Step 4: Timeline Expectations**

### **DNS Propagation:**
- **Local/ISP:** 5-30 minutes
- **Global:** 2-24 hours (typically < 2 hours)
- **TTL Impact:** Lower TTL = faster updates

### **SSL Certificate:**
- **Issuance:** 5-15 minutes after domain activation
- **Type:** Cloudflare Universal SSL (Let's Encrypt)
- **Coverage:** `demo.eva.ai` and `*.demo.eva.ai`

### **Cloudflare Activation:**
- **Domain Validation:** 1-5 minutes
- **Route Configuration:** Immediate
- **Cache Setup:** Immediate

---

## 🧪 **Step 5: Testing Checklist**

### **✅ Basic Functionality:**
- [ ] `https://demo.eva.ai` loads homepage
- [ ] `https://demo.eva.ai/dashboard` shows dashboard
- [ ] `https://demo.eva.ai/ai-assistant` shows AI chat (single window)
- [ ] Navigation works properly on first click
- [ ] No EVA AI auto-popup on page load

### **✅ Performance:**
- [ ] Page load time < 3 seconds
- [ ] First paint < 1 second  
- [ ] CSS and JS load correctly
- [ ] Images and assets load properly

### **✅ Security:**
- [ ] HTTPS redirect works
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] No mixed content warnings

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: DNS Not Resolving**
```bash
# Check current DNS settings
nslookup demo.eva.ai

# Flush local DNS cache (macOS)
sudo dscacheutil -flushcache

# Flush local DNS cache (Windows)
ipconfig /flushdns
```

### **Issue 2: SSL Certificate Error**
- **Cause:** Domain not fully activated
- **Solution:** Wait 15 minutes, try again
- **Alternative:** Use `http://demo.eva.ai` temporarily

### **Issue 3: 404 Errors**
- **Cause:** Domain routing not configured
- **Solution:** Re-add domain in Cloudflare Pages dashboard

### **Issue 4: Mixed Content Warnings**
- **Cause:** HTTP resources on HTTPS page
- **Solution:** Already fixed in latest deployment

---

## 📋 **Current Configuration Summary**

### **✅ Completed:**
- React app built and deployed
- EVA AI auto-popup removed (fixed double window issue)
- Cloudflare Pages project active: `eva-ai-platform`
- SPA routing working correctly
- Security headers configured
- SSL ready for activation

### **🔧 Pending Manual Steps:**
1. **Add custom domain** in Cloudflare Pages dashboard
2. **Configure DNS record** for `demo.eva.ai`  
3. **Wait for propagation** (5-30 minutes)
4. **Test final URLs** and functionality

---

## 🎯 **Success Criteria**

When setup is complete, you should have:

### **✅ Working URLs:**
- **Primary:** https://demo.eva.ai
- **Dashboard:** https://demo.eva.ai/dashboard  
- **AI Assistant:** https://demo.eva.ai/ai-assistant

### **✅ Fixed Issues:**
- ❌ EVA AI auto-popup removed
- ✅ Single AI chat window (not double)
- ✅ Navigation works on first click
- ✅ Fast loading times
- ✅ Professional domain name

### **✅ Performance Metrics:**
- **Load Time:** < 3 seconds
- **First Paint:** < 1 second
- **SSL Grade:** A+ (SSLLabs)
- **Security Score:** High

---

## 📞 **Next Steps After DNS Setup**

1. **Update Documentation:** Change all references to use `demo.eva.ai`
2. **Update Bookmarks:** Replace temporary URLs
3. **Share New URL:** Distribute `https://demo.eva.ai` to stakeholders
4. **Monitor Performance:** Set up analytics and monitoring
5. **Test Thoroughly:** Comprehensive QA on the new domain

## 🎉 **Final Result**

Once DNS is configured, users will access:
**https://demo.eva.ai** - Professional, fast-loading EVA Platform with single AI assistant window and smooth navigation! 🚀 