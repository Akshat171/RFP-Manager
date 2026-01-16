# Gmail API Setup Guide - Real-time Push Notifications

This guide will help you set up Gmail API with **Google Cloud Pub/Sub** to receive vendor email responses **in real-time** (< 5 seconds) using push notifications.

## Prerequisites
- Google account (Gmail)
- Google Cloud Console access
- Your backend server must be publicly accessible (use ngrok for local testing)

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it: `RFP Procurement System`
4. Click **"Create"**
5. **Copy your Project ID** (you'll need this later)

---

## Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services" → "Library"**
2. Search for and enable:
   - **Gmail API**
   - **Cloud Pub/Sub API**

---

## Step 3: Create Pub/Sub Topic

1. Go to **"Pub/Sub" → "Topics"** in Cloud Console
2. Click **"Create Topic"**
3. Name it: `gmail-push-notifications`
4. Click **"Create"**
5. **Important:** Grant Gmail permission to publish to this topic:
   - Click on the topic you just created
   - Go to **"Permissions"** tab
   - Click **"Add Principal"**
   - Principal: `serviceAccount:gmail-api-push@system.gserviceaccount.com`
   - Role: **"Pub/Sub Publisher"**
   - Click **"Save"**

6. **Copy the full topic name** (format: `projects/YOUR_PROJECT_ID/topics/gmail-push-notifications`)

---

## Step 4: Create Pub/Sub Subscription (Optional - for testing)

1. Go to **"Pub/Sub" → "Subscriptions"**
2. Click **"Create Subscription"**
3. Name it: `gmail-push-sub`
4. Select topic: `gmail-push-notifications`
5. Delivery type: **Pull** (for testing) or **Push** (for production)
6. If using Push:
   - Endpoint URL: `https://your-domain.com/api/proposals/gmail-webhook`
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/proposals/gmail-webhook`
7. Click **"Create"**

---

## Step 5: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. If prompted, configure **OAuth consent screen**:
   - User Type: **External**
   - App name: `RFP System`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Scopes: Skip for now
   - Test users: Add your Gmail address
   - Click **"Save and Continue"**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `RFP Backend`
   - Authorized redirect URIs: `http://localhost:3000/oauth2callback`
   - Click **"Create"**

5. **Copy the credentials:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

---

## Step 6: Get Refresh Token

### Option A: Using OAuth Playground (Easiest)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **⚙️ Settings icon** (top right)
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret**
5. In left sidebar, find **"Gmail API v1"**
6. Select: `https://www.googleapis.com/auth/gmail.readonly`
7. Click **"Authorize APIs"**
8. Sign in with your Gmail account
9. Click **"Allow"**
10. Click **"Exchange authorization code for tokens"**
11. **Copy the Refresh Token** (starts with `1//...`)

### Option B: Manual Code (Advanced)

Create a temporary file `getToken.js`:

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting:', url);
```

Run: `node getToken.js` and follow the URL.

---

## Step 7: Add Credentials to .env

Add to your `.env` file:

```env
# Gmail API Configuration (Real-time Push Notifications)
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=1//xxxxx
GMAIL_REDIRECT_URI=http://localhost:3000
GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-push-notifications
```

**Important:** Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID.

---

## Step 8: Set Up Public Webhook Endpoint

For **local development**, use ngrok to make your localhost accessible:

1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update your Pub/Sub subscription endpoint to: `https://abc123.ngrok.io/api/proposals/gmail-webhook`

For **production**, use your actual domain: `https://yourdomain.com/api/proposals/gmail-webhook`

---

## Step 9: Test Gmail Integration

### Option 1: Manual Testing (Quick)

Use the manual submission endpoint to test without Gmail API:

```bash
POST http://localhost:3000/api/proposals/manual
Content-Type: application/json

{
  "rfpId": "your-rfp-id",
  "vendorId": "vendor-id",
  "emailBody": "Hi, we can provide 20 laptops for $48,500. Delivery in 10 days. 2 year warranty included."
}
```

### Option 2: Test Real-time Push Notifications

Once all credentials are configured, the system will automatically:

1. **Start server:** `npm run dev`
2. **Server initializes Gmail Push Service** and sets up watch
3. **Send a test email** to your Gmail from a vendor email
4. **Email arrives in < 5 seconds** and is processed automatically

Server will log:
```
Gmail Push Service initialized successfully
Gmail watch set up successfully. Expires: [date]
Received Gmail push notification
Processing email from: vendor@example.com
✅ Proposal created/updated in REAL-TIME for vendor: Vendor Name
```

---

## API Endpoints Created

### 1. Gmail Push Webhook (Receives real-time notifications)
```
POST /api/proposals/gmail-webhook
Body: Pub/Sub message from Google Cloud
```

### 2. Manual Proposal Submission (No Gmail API needed)
```
POST /api/proposals/manual
Body: { rfpId, vendorId, emailBody }
```

### 3. Get Proposals for RFP
```
GET /api/proposals/rfp/:rfpId
```

### 4. Get All Proposals
```
GET /api/proposals
```

---

## How It Works (Real-time Push Notifications)

1. **Send RFP Email** → Vendor receives email
2. **Vendor Replies** → Email arrives in your Gmail
3. **Gmail Triggers Pub/Sub** → Instant notification sent to your webhook (< 5 seconds)
4. **Webhook Receives Event** → `/api/proposals/gmail-webhook` is called
5. **Fetch & Parse Email** → Gmail API retrieves email content
6. **AI Extracts Data** → Parses price, delivery, warranty using OpenAI
7. **Save to Database** → Proposal created/updated in real-time
8. **Shows on Platform** → Immediately available in frontend

---

## Troubleshooting

**Error: "Gmail API credentials not configured"**
- Make sure all env variables are set: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, PUBSUB_TOPIC

**Error: "invalid_grant"**
- Your refresh token expired
- Generate a new one using OAuth Playground

**Error: "Failed to set up Gmail watch"**
- Make sure Cloud Pub/Sub API is enabled
- Verify the Pub/Sub topic exists
- Check that `gmail-api-push@system.gserviceaccount.com` has Publisher permissions

**Webhook not receiving notifications:**
- Verify your webhook URL is publicly accessible (use ngrok for local testing)
- Check Pub/Sub subscription is configured with correct endpoint
- Make sure subject contains "RE:", "RFP", or "proposal"
- Check server logs for errors

**No emails being processed:**
- Verify vendor email is registered in the Vendors collection
- Check that vendor has an existing proposal/RFP
- Review email subject line - must match filter criteria

**For immediate testing:**
- Use `/api/proposals/manual` endpoint
- Paste vendor email responses manually
- AI will still parse and extract data

---

## Next Steps

Once Gmail Push Notifications are configured:
- **Real-time processing** - Vendor emails processed in < 5 seconds
- **No polling overhead** - Zero server resources wasted
- **Automatic renewal** - Watch automatically renews every 6 days
- **Zero manual intervention** - All vendor responses appear instantly on your platform

## Key Benefits of Push Notifications vs Polling

| Feature | Push Notifications ✅ | Polling ❌ |
|---------|---------------------|-----------|
| Response Time | < 5 seconds | Up to 2 minutes |
| Server Load | Minimal (event-driven) | Continuous API calls |
| API Quota Usage | Low | High |
| Scalability | Excellent | Poor |
| Cost | Free (within limits) | Free (within limits) |

For immediate testing without setup, use the **manual submission endpoint**: `/api/proposals/manual`
