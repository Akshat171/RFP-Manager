const { google } = require('googleapis');
const { parseProposalEmail } = require('./aiService');
const { Proposal, Vendor } = require('../models');
const socketConfig = require('../config/socket');

class GmailPushService {
  constructor() {
    this.gmail = null;
    this.initialized = false;
    this.watchExpiration = null;
    this.lastHistoryId = null;
  }

  async initialize() {
    try {
      if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
        console.warn('Gmail API credentials not configured. Push notifications disabled.');
        return false;
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      this.initialized = true;

      // Get initial history ID
      const profile = await this.gmail.users.getProfile({ userId: 'me' });
      this.lastHistoryId = profile.data.historyId;
      console.log('Initial history ID:', this.lastHistoryId);

      // Set up Gmail watch
      await this.setupWatch();

      console.log('Gmail Push Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail Push Service:', error.message);
      return false;
    }
  }

  async setupWatch() {
    try {
      if (!process.env.GMAIL_PUBSUB_TOPIC) {
        console.warn('GMAIL_PUBSUB_TOPIC not configured. Push notifications will not work.');
        return;
      }

      // Set up Gmail watch with Pub/Sub
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GMAIL_PUBSUB_TOPIC,
          labelIds: ['INBOX'],
        },
      });

      this.watchExpiration = response.data.expiration;
      console.log('Gmail watch set up successfully. Expires:', new Date(parseInt(this.watchExpiration)));

      // Schedule watch renewal (expires in 7 days, renew after 6 days)
      const renewTime = 6 * 24 * 60 * 60 * 1000; // 6 days
      setTimeout(() => this.setupWatch(), renewTime);

    } catch (error) {
      console.error('Failed to set up Gmail watch:', error.message);
    }
  }

  async handlePushNotification(notification) {
    try {
      if (!this.initialized) {
        console.log('Gmail Push Service not initialized, skipping notification');
        return;
      }

      console.log('📧 Received Gmail push notification');
      console.log('Notification data:', JSON.stringify(notification, null, 2));

      // Decode the Pub/Sub message
      const messageData = Buffer.from(notification.message.data, 'base64').toString('utf-8');
      const data = JSON.parse(messageData);
      console.log('Decoded message data:', data);

      const currentHistoryId = data.historyId;

      // If we don't have a previous history ID, fetch recent messages directly
      if (!this.lastHistoryId) {
        console.log('⚠️ No previous history ID, fetching recent messages directly...');
        await this.fetchRecentMessages();
        this.lastHistoryId = currentHistoryId;
        return;
      }

      console.log('Fetching history from ID:', this.lastHistoryId, 'to', currentHistoryId);

      // List history to get new messages
      const historyResponse = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId: this.lastHistoryId,
        historyTypes: ['messageAdded'],
      });

      const history = historyResponse.data.history || [];
      console.log(`Found ${history.length} history record(s)`);

      for (const record of history) {
        if (record.messagesAdded) {
          console.log(`Processing ${record.messagesAdded.length} new message(s)`);
          for (const messageAdded of record.messagesAdded) {
            const messageId = messageAdded.message.id;
            await this.processEmail(messageId);
          }
        }
      }

      // Update last history ID
      this.lastHistoryId = currentHistoryId;

      console.log('✅ Processed push notification successfully');
    } catch (error) {
      console.error('❌ Error handling push notification:', error.message);
      console.error('Full error:', error);
    }
  }

  async fetchRecentMessages() {
    try {
      console.log('🔍 Fetching recent messages...');

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        q: 'is:unread', // Only fetch unread messages
      });

      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} recent unread message(s)`);

      for (const message of messages) {
        await this.processEmail(message.id);
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error.message);
    }
  }

  async processEmail(messageId) {
    try {
      console.log('📨 Fetching email with ID:', messageId);

      const message = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = message.data.payload.headers;
      const fromHeader = headers.find((h) => h.name === 'From');
      const subjectHeader = headers.find((h) => h.name === 'Subject');

      console.log('📬 Email Details:');
      console.log('  From:', fromHeader?.value);
      console.log('  Subject:', subjectHeader?.value);

      if (!fromHeader) {
        console.log('⚠️ No From header found, skipping');
        return null;
      }

      // Check if subject contains RFP-related keywords
      const subject = subjectHeader?.value || '';
      if (!subject.match(/RE:|RFP|proposal/i)) {
        console.log('⚠️ Email not related to RFP (subject doesn\'t match), skipping');
        console.log('  Subject was:', subject);
        return null;
      }

      // Extract email address from "Name <email@domain.com>" format
      const emailMatch = fromHeader.value.match(/<(.+?)>/) || [null, fromHeader.value];
      const vendorEmail = emailMatch[1].trim();

      console.log('🔍 Processing email from vendor:', vendorEmail);

      // Find vendor by email
      const vendor = await Vendor.findOne({ email: vendorEmail });
      if (!vendor) {
        console.log('❌ Vendor not found for email:', vendorEmail);
        console.log('💡 Make sure this vendor is registered in the database');
        return null;
      }

      console.log('✓ Found vendor:', vendor.name);

      // Extract email body
      const emailBody = this.extractEmailBody(message.data.payload);

      if (!emailBody) {
        console.log('❌ Could not extract email body');
        return null;
      }

      console.log('📄 Email body extracted (first 200 chars):', emailBody.substring(0, 200));

      // Find the most recent proposal for this vendor to get RFP ID
      const existingProposal = await Proposal.findOne({ vendorId: vendor._id })
        .sort({ createdAt: -1 })
        .populate('rfpId');

      if (!existingProposal) {
        console.log('❌ No RFP found for vendor:', vendorEmail);
        console.log('💡 Send an RFP to this vendor first before they can reply');
        return null;
      }

      const rfpId = existingProposal.rfpId._id;
      console.log('✓ Found RFP ID:', rfpId);

      // Parse email with AI
      console.log('🤖 Parsing email with AI...');
      const extractedData = await parseProposalEmail(emailBody);
      console.log('✓ AI extracted data:', JSON.stringify(extractedData, null, 2));

      // Create or update proposal
      const proposal = await Proposal.findOneAndUpdate(
        { rfpId: rfpId, vendorId: vendor._id },
        {
          rfpId: rfpId,
          vendorId: vendor._id,
          vendorResponseEmail: emailBody,  // Store vendor's response in separate field
          extractedData: extractedData,
          receivedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('✅ Proposal created/updated in REAL-TIME for vendor:', vendor.name);
      console.log('📊 Proposal details:', {
        vendor: vendor.name,
        price: extractedData.totalPrice,
        delivery: extractedData.deliveryDate,
        warranty: extractedData.warrantyProvided
      });

      // Update RFP's respondedVendors array
      const RFP = require('../models/schemas/RFP');
      await RFP.findByIdAndUpdate(
        rfpId,
        { $addToSet: { respondedVendors: vendor._id } }, // $addToSet prevents duplicates
        { new: true }
      );
      console.log('✓ Updated RFP respondedVendors list');

      // Emit WebSocket event to notify frontend
      const io = socketConfig.getIO();
      if (io) {
        // Get RFP details with updated response stats
        const rfpDetails = await RFP.findById(rfpId);

        // Use respondedVendors array length for total responses (more efficient)
        const totalResponses = rfpDetails?.respondedVendors?.length || 0;
        const totalVendorsContacted = rfpDetails?.sentToVendors?.length || 0;

        const proposalData = {
          _id: proposal._id,
          rfpId: proposal.rfpId,
          vendorId: {
            _id: vendor._id,
            name: vendor.name,
            email: vendor.email,
            category: vendor.category,
          },
          vendorResponseEmail: proposal.vendorResponseEmail,
          extractedData: proposal.extractedData,
          receivedAt: proposal.receivedAt,
          // Response statistics
          responseStats: {
            totalResponses: totalResponses,
            totalVendorsContacted: totalVendorsContacted,
            responseRate: totalVendorsContacted > 0
              ? Math.round((totalResponses / totalVendorsContacted) * 100)
              : 0,
          },
        };

        // Emit to specific RFP room
        io.to(`rfp-${rfpId}`).emit('new-proposal', proposalData);

        // Also emit to all connected clients
        io.emit('proposal-update', proposalData);

        console.log('📡 WebSocket event emitted for RFP:', rfpId);
        console.log(`📊 Response stats: ${totalResponses}/${totalVendorsContacted} vendors responded`);
      } else {
        console.warn('⚠️ Socket.IO not available, skipping WebSocket notification');
      }

      return proposal;
    } catch (error) {
      console.error('Error processing email:', error.message);
      return null;
    }
  }

  extractEmailBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            break;
          }
        }
        // Check nested parts
        if (part.parts) {
          const nestedBody = this.extractEmailBody(part);
          if (nestedBody) {
            body = nestedBody;
            break;
          }
        }
      }
    }

    return body;
  }
}

module.exports = new GmailPushService();
