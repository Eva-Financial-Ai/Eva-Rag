# 🔐 DNS API Permissions Guide

## 🎯 **Required API Permissions for DNS Management**

### **Cloudflare API Token Setup**

#### **Minimal Permissions for DNS Management:**
```yaml
Token Permissions:
  Zone:
    - Zone:Read          # View zone information
    - Zone:Edit          # Modify zone settings
  
  DNS Records:
    - Zone:DNS:Read      # List existing DNS records
    - Zone:DNS:Edit      # Create, modify, delete DNS records

Zone Resources:
  - Include: Specific zones (e.g., evafi.ai)
  - OR Include: All zones from account

Client IP Filtering:
  - Optional: Restrict to specific IP addresses
  - Recommended: Add your server/development IPs
```

#### **Step-by-Step Token Creation:**
1. **Go to:** https://dash.cloudflare.com/profile/api-tokens
2. **Click:** Create Token
3. **Choose:** Custom token
4. **Configure:**
   ```yaml
   Token Name: EVA DNS Management
   
   Permissions:
     - Zone:Zone:Read
     - Zone:Zone Settings:Edit  
     - Zone:DNS:Read
     - Zone:DNS:Edit
   
   Zone Resources:
     - Include: evafi.ai
   
   Client IP Address Filtering:
     - [Optional] Your IP addresses
   
   TTL: 
     - End date: [Choose appropriate date]
   ```

### **Enhanced Permissions (Full Zone Management):**
```yaml
Extended Permissions:
  Zone:
    - Zone:Read
    - Zone:Edit
    - Zone Settings:Edit
    - Zone:Zone:Edit
  
  DNS:
    - Zone:DNS:Read
    - Zone:DNS:Edit
  
  Analytics:
    - Zone:Analytics:Read    # Optional: For DNS analytics
  
  Logs:
    - Zone:Logs:Read         # Optional: For DNS query logs
```

---

## 🛠️ **API Usage Examples**

### **Create DNS A Record:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "evafi.ai",
    "content": "76.76.21.21",
    "ttl": 1,
    "proxied": true
  }'
```

### **List All DNS Records:**
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

### **Update DNS Record:**
```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "content": "76.76.21.21",
    "proxied": true
  }'
```

### **Delete DNS Record:**
```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

---

## 🔑 **Alternative DNS Providers API Permissions**

### **AWS Route 53:**
```yaml
IAM Policy Permissions:
  - route53:ListHostedZones
  - route53:GetChange
  - route53:ChangeResourceRecordSets
  - route53:ListResourceRecordSets
  - route53:GetHostedZone
```

### **Google Cloud DNS:**
```yaml
Cloud DNS Permissions:
  - dns.zones.get
  - dns.zones.list
  - dns.resourceRecordSets.create
  - dns.resourceRecordSets.delete
  - dns.resourceRecordSets.list
  - dns.resourceRecordSets.update
```

### **Azure DNS:**
```yaml
Azure Role Permissions:
  - Microsoft.Network/dnszones/read
  - Microsoft.Network/dnszones/write
  - Microsoft.Network/dnszones/recordsets/*
```

---

## 🧪 **Testing API Permissions**

### **Verify Token Permissions:**
```bash
# Test token validity
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# List accessible zones
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### **Expected Response:**
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "token_id",
    "status": "active"
  }
}
```

---

## 🛡️ **Security Best Practices**

### **Token Security:**
- ✅ **Minimal Permissions:** Only grant necessary permissions
- ✅ **IP Restrictions:** Limit to known IP addresses
- ✅ **Expiration Dates:** Set reasonable expiration periods
- ✅ **Regular Rotation:** Rotate tokens periodically
- ✅ **Environment Variables:** Store tokens securely

### **Monitoring:**
- ✅ **API Logs:** Monitor API usage in Cloudflare dashboard
- ✅ **Rate Limiting:** Be aware of API rate limits
- ✅ **Error Handling:** Implement proper error handling

---

## 📋 **Permission Troubleshooting**

### **Common Permission Errors:**

#### **Error: "Invalid API Token"**
```yaml
Cause: Token not found or expired
Solution: Regenerate token with correct permissions
```

#### **Error: "Insufficient Permissions"**
```yaml
Cause: Missing required zone or DNS permissions
Solution: Add Zone:DNS:Edit permission to token
```

#### **Error: "Zone Not Found"**
```yaml
Cause: Token doesn't have access to the zone
Solution: Add zone to token's Zone Resources
```

#### **Error: "Rate Limit Exceeded"**
```yaml
Cause: Too many API requests
Solution: Implement backoff/retry logic
```

---

## 🎯 **For Your EVA Platform Setup**

### **Recommended Token Configuration:**
```yaml
Token Name: EVA Platform DNS Management

Permissions:
  - Zone:Zone:Read
  - Zone:DNS:Read  
  - Zone:DNS:Edit

Zone Resources:
  - Include: evafi.ai

Use Case:
  - Add demo.evafi.ai to Cloudflare Pages
  - Manage DNS records programmatically
  - Automate domain configuration
```

### **Immediate Need:**
To fix the missing A record for `evafi.ai`, you can either:
1. **Manual:** Use Cloudflare dashboard (no API needed)
2. **API:** Create token with above permissions and use API

**For urgent fix, manual dashboard approach is fastest! 🚀** 