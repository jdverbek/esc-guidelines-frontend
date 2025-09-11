# API Connection Debug Guide

## Current Issue
The frontend is showing "API Disconnected" because it cannot connect to the backend API.

## Debugging Steps

### 1. Check Backend URL
The frontend is trying to connect to:
```
https://cardiovascular-guidelines-api.onrender.com
```

**Action Needed**: Check your Render dashboard and verify the exact URL of your backend service.

### 2. Common Backend URLs on Render
Your backend might be at one of these URLs:
- `https://cardiovascular-guidelines-api-[random].onrender.com`
- `https://esc-guidelines-api.onrender.com`
- `https://[your-service-name].onrender.com`

### 3. Wake Up Sleeping Service
If using Render's free tier, services sleep after 15 minutes of inactivity.

**To wake up the service:**
1. Visit your backend URL directly in a browser
2. Wait 30-60 seconds for it to start up
3. You should see: `{"message":"Cardiovascular Guidelines Compliance System API",...}`

### 4. Update Frontend API URL
If your backend URL is different:

1. **In Render Dashboard**:
   - Go to your frontend service settings
   - Update environment variable `VITE_API_URL` to the correct backend URL
   - Redeploy

2. **Or update the .env file**:
   ```
   VITE_API_URL=https://your-actual-backend-url.onrender.com
   ```

### 5. Test API Connection
Open browser developer tools (F12) and check:
1. **Console tab** - Look for API_BASE_URL log
2. **Network tab** - Check if requests to `/health` are failing
3. **Error messages** - Look for CORS or connection errors

### 6. Manual Test
Try visiting these URLs directly:
- `https://your-backend-url.onrender.com/` (should show API info)
- `https://your-backend-url.onrender.com/health` (should show health status)
- `https://your-backend-url.onrender.com/docs` (should show API documentation)

## Expected Working State
When working correctly, you should see:
- ✅ "API Connected" badge in the frontend
- ✅ "System Ready" or "Not Initialized" status
- ✅ No connection error messages

## Quick Fix
1. Find your actual backend URL in Render dashboard
2. Update the `VITE_API_URL` environment variable
3. Redeploy the frontend
4. Visit the backend URL to wake it up if needed

