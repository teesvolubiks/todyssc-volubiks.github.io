# Social Media Posting for Volubiks

This document explains the social media features and how to set up automated posting.

## Features Implemented

### 1. Product Modal Sharing
The product modal now includes social media share buttons:
- **WhatsApp** - Share product link via WhatsApp
- **WhatsApp Status** - Download product image to share on WhatsApp Status
- **Facebook** - Share on Facebook
- **Twitter/X** - Tweet about the product
- **Instagram** - Copy link for Instagram story
- **Copy Link** - Copy product link to clipboard

### 2. Social Media Poster Tool
A dedicated poster creation page (`/poster`) that allows you to:
- Select products from your catalog
- Preview product images
- Customize captions
- Style the poster (colors, fonts)
- Download posters in multiple formats:
  - Square (1:1) - for Instagram/Facebook posts
  - Portrait (9:16) - for WhatsApp Status
- Share directly to WhatsApp, Twitter, Facebook

## How Automated Posting Works

### Current Implementation (Frontend-Only)
The current implementation is **client-side only**, meaning:
- You can generate shareable content (posters, links)
- Users can manually share to their social networks
- Content is NOT automatically posted to your business accounts

### Setting Up Automated Posting (Backend Required)

To achieve fully automated posting to your social media accounts, you need a backend server. Here's how to set it up:

#### 1. Meta Business API (Facebook & Instagram)

```javascript
// Example: Server-side posting to Instagram
const fetch = require('node-fetch');

async function postToInstagram(imagePath, caption) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ID;
  
  // Step 1: Create container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${businessAccountId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imagePath,
        caption: caption,
        access_token: accessToken,
      }),
    }
  );
  
  const container = await containerResponse.json();
  
  // Step 2: Publish the content
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${businessAccountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    }
  );
  
  return publishResponse.json();
}
```

**Setup Steps:**
1. Create a Facebook Developer account
2. Create a Meta App with Instagram Basic Features
3. Connect your Instagram Business Account
4. Get the Access Token and Business Account ID
5. Store them securely in environment variables

#### 2. Twitter/X API

```javascript
// Example: Server-side posting to Twitter
const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function postToTwitter(text, imagePath) {
  // Upload image first
  const mediaResponse = await client.post('media/upload', {
    media: imagePath,
  });
  
  const mediaId = mediaResponse.media_id_string;
  
  // Post tweet with media
  const tweetResponse = await client.post('statuses/update', {
    status: text,
    media_ids: mediaId,
  });
  
  return tweetResponse;
}
```

**Setup Steps:**
1. Create a Twitter Developer account
2. Create a Project and App
3. Generate API Keys and Access Tokens
4. Enable "Read and Write" permissions

#### 3. WhatsApp Business API

```javascript
// Example: Send product catalog via WhatsApp
const axios = require('axios');

async function sendWhatsAppMessage(phoneNumber, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}
```

**Setup Steps:**
1. Apply for WhatsApp Business API through Meta
2. Create a Business Account
3. Set up a WhatsApp Phone Number
4. Get the Access Token

### Recommended Automation Setup

For the most reliable automation, consider using a scheduling service:

#### Option A: Zapier/Make.com (No Code)
1. Connect your email/webhook to trigger on new product
2. Use their built-in integrations for social platforms
3. Schedule posts for optimal engagement times

#### Option B: Custom Backend with Node.js

```javascript
// server/scheduler.js
const cron = require('node-cron');
const { postToInstagram, postToTwitter } = require('./social');

cron.schedule('0 9 * * *', async () => {
  // Post at 9 AM daily
  const products = await getFeaturedProducts();
  
  for (const product of products) {
    const poster = await generatePoster(product);
    await postToInstagram(poster.url, poster.caption);
    await postToTwitter(poster.caption, poster.url);
  }
});
```

## Environment Variables Required

Create a `.env` file in your server root:

```env
# Meta (Facebook/Instagram)
META_ACCESS_TOKEN=your_meta_access_token
INSTAGRAM_BUSINESS_ID=your_instagram_business_id

# Twitter
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# WhatsApp
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_id
```

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables** for all secrets
3. **Implement rate limiting** to avoid API throttling
4. **Store tokens securely** (use a secrets manager in production)
5. **Implement OAuth refresh** for long-lived tokens

## Cost Considerations

- **Meta Business API**: Free for small businesses (limits apply)
- **Twitter API**: Free tier available, paid plans for higher limits
- **WhatsApp Business**: Per-message costs apply

## Next Steps

1. Deploy a Node.js/Express backend
2. Set up the social media APIs
3. Implement webhook triggers for new products
4. Add scheduled posting functionality
5. Monitor and optimize posting times

## Support

For issues or questions about:
- API setup: Contact respective platform support
- Implementation: Check the code in `components/SocialMediaPoster.jsx`

