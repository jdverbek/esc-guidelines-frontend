# Render Deployment Fix

## Issue
The build is failing because the project uses `pnpm` but the build command is set to `npm ci && npm run build`.

## Solution
Update the build command in your Render dashboard to use pnpm:

### Correct Build Command:
```bash
pnpm install && pnpm run build
```

## Steps to Fix:

1. **Go to your Render Dashboard**
2. **Find your static site**: `cardiovascular-guidelines-frontend`
3. **Go to Settings**
4. **Update Build Command** to: `pnpm install && pnpm run build`
5. **Save Changes**
6. **Trigger a new deployment**

## Alternative Build Commands (if pnpm doesn't work):
```bash
# Option 1: Use npm with force
npm install --force && npm run build

# Option 2: Use yarn
yarn install && yarn build
```

## Environment Variables
Make sure you have:
- **VITE_API_URL**: `https://cardiovascular-guidelines-api.onrender.com`

## Expected Result
After fixing the build command, your frontend will be available at:
`https://cardiovascular-guidelines-frontend.onrender.com`

