# Fix API Connection Issue

## Problem
The frontend shows "API Disconnected" and cannot connect to the backend API.

## Solution
The issue is likely with the environment variable configuration in Render.

## Steps to Fix:

### 1. Check Environment Variables in Render
1. Go to your Render Dashboard
2. Find your static site: `cardiovascular-guidelines-frontend`
3. Go to **Settings** → **Environment**
4. Add/Update this environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cardiovascular-guidelines-api.onrender.com`

### 2. Verify Backend API URL
First, let's confirm your backend API is working:
- Visit: `https://cardiovascular-guidelines-api.onrender.com/health`
- You should see a JSON response with system information

### 3. Check Frontend API Configuration
The frontend should automatically use the environment variable. If it's not working, the fallback URL in the code is:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cardiovascular-guidelines-api.onrender.com'
```

### 4. Trigger Redeploy
After adding the environment variable:
1. Go to **Deploys** tab
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for the build to complete

### 5. Test Connection
After redeployment:
1. Visit your frontend URL
2. The "API Disconnected" message should disappear
3. You should see "API Connected" in green

## Alternative Solutions

### If Environment Variable Doesn't Work:
1. **Check the exact backend URL** - Make sure it matches your actual Render service name
2. **Try HTTPS** - Ensure you're using `https://` not `http://`
3. **Check CORS** - The backend is already configured to allow all origins

### Manual Test:
Open browser developer tools on your frontend and check:
1. **Console tab** - Look for any error messages
2. **Network tab** - See if API requests are being made and what responses they get

## Expected Result
After fixing the environment variable, your frontend should:
- Show "API Connected" status
- Allow you to initialize the system
- Enable all search and validation features

## Need Help?
If the issue persists:
1. Check the browser console for error messages
2. Verify the backend API is responding at `/health` endpoint
3. Ensure the environment variable is exactly: `VITE_API_URL`

