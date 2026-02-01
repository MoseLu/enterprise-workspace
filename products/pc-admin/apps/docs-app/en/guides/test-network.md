---
title: Network Access Testing
type: guide
project: network
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - network
  - test
sidebar_label: Network Testing
sidebar_order: 2
sidebar_group: guides
---

# Network Access Testing

## Problem Resolution

### Problem Cause
The iframe component in the main application hardcoded `http://localhost:8085`, causing other devices on the LAN to be unable to access it.

### Solution
1. **Modify iframe Component**: Enable dynamic detection of current page's host address
2. **Support Environment Variables**: Can customize documentation server address via `VITE_DOCS_URL` environment variable
3. **Auto IP Detection**: When accessing localhost, automatically use current page's IP address

### Modification Content

#### 1. Dynamic URL Detection Function
```javascript
const getDocsUrl = () => {
  if (!import.meta.env.DEV) {
    return '/';
  }

  // Prioritize environment variable
  const envUrl = import.meta.env.VITE_DOCS_URL;
  if (envUrl) {
    return envUrl;
  }

  // Auto-detect current page's host address
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return `${protocol}//${hostname}:8085`;
};
```

#### 2. Server Configuration
VitePress configuration is correctly set:
```javascript
server: {
  port: 8085,
  host: '0.0.0.0', // Allow all network interfaces to access
  strictPort: true,
  cors: true // Allow cross-origin
}
```

### Testing Methods

#### Method 1: Direct Access to Documentation Server
Access from other devices on LAN:
```
http://10.80.8.199:8085/
```

#### Method 2: Access via Main Application
Access main application from other devices on LAN:
```
http://10.80.8.199:8080/
```
Then click "Documentation Center" menu

#### Method 3: Environment Variable Configuration (Optional)
Create `.env` file in main application root directory:
```bash
VITE_DOCS_URL=http://10.80.8.199:8085
```

### Verification Steps
1. Confirm documentation server is running: `http://10.80.8.199:8085/`
2. Confirm main application is running: `http://10.80.8.199:8080/`
3. Test access from other devices on LAN
4. Check browser developer tools network panel, confirm request address is correct

### Troubleshooting
If still cannot access, please check:
1. Whether Windows Firewall blocks port 8085
2. Whether router blocks port forwarding
3. Whether other devices are on the same network segment
4. Whether browser blocks cross-origin requests

Run firewall rule script (requires administrator privileges):
```bash
# Run as administrator
enable-network-access.bat
```
