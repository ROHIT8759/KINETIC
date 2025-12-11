# World ID Configuration Guide

## Issue: "Something went wrong" when scanning QR code

This happens when the World ID app configuration doesn't match between your app and the Worldcoin Developer Portal.

## Solution

### 1. Check Your Worldcoin Developer Portal Settings

Go to: https://developer.worldcoin.org/

1. **Select your app** (or create one if you haven't)
2. **Verify these settings match your .env file:**

   ```
   App ID: app_c61a9d20e6cba2371ae2b366bba642a6
   Action: verify-human
   ```

3. **Add the action if it doesn't exist:**
   - Click "Actions" in the sidebar
   - Click "Create Action"
   - Action Name: `verify-human`
   - Description: "Verify user is human before uploading skill video"
   - Click "Create"

4. **Configure allowed origins:**
   - Go to "Settings" → "App Settings"
   - Add these to "Allowed Origins":
     - `http://localhost:3000`
     - `http://192.168.137.1:3000`
     - Your production domain (when deploying)

5. **Set Verification Level:**
   - The app now uses `Device` level (works with World App on any phone)
   - If you want `Orb` level (requires Orb verification), change in `WorldIDVerify.tsx`:
     ```tsx
     verification_level={VerificationLevel.Orb}
     ```

### 2. Key Changes Made

1. **Added error handling** - You'll now see specific error messages
2. **Changed verification level to Device** - No Orb required, works with any World App user
3. **Added signal parameter** - Binds verification to current page URL
4. **Added backend verification** - New `/api/verify-worldid` endpoint validates proofs
5. **Added onError callback** - Catches widget errors

### 3. Testing

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Try World ID verification:**
   - Click "Verify with World ID"
   - Scan QR code with World App
   - If error occurs, check browser console for details

3. **Use Mock Verification for testing:**
   - Click "[DEV] Mock Verification" button
   - This bypasses World ID for local testing

### 4. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Something went wrong" | Action not registered | Add `verify-human` action in Developer Portal |
| "Invalid app_id" | Wrong App ID | Check `.env` matches Developer Portal |
| "Origin not allowed" | Domain not whitelisted | Add `localhost:3000` to allowed origins |
| "Invalid verification level" | Orb required but user has Device | Changed to `Device` level (already done) |

### 5. Environment Variables

Check your `.env` file:

```env
# Worldcoin
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_c61a9d20e6cba2371ae2b366bba642a6
NEXT_PUBLIC_WORLDCOIN_ACTION=verify-human
```

### 6. For Production Deployment

1. **Update allowed origins** in Developer Portal to include your production domain
2. **Store verified nullifier hashes** in database to prevent duplicate verifications
3. **Add rate limiting** to `/api/verify-worldid` endpoint

## Support

- Worldcoin Docs: https://docs.worldcoin.org/
- Developer Portal: https://developer.worldcoin.org/
- Discord: https://discord.gg/worldcoin
