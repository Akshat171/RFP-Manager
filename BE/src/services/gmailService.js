const { google } = require('googleapis');
const { parseProposalEmail } = require('./aiService');
const { Proposal, Vendor } = require('../models');

class GmailService {
  constructor() {
    this.gmail = null;
    this.lastCheckTime = new Date();
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
        console.warn('Gmail API credentials not configured. Email monitoring disabled.');
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
      console.log('Gmail Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail Service:', error.message);
      return false;
    }
  }

  async checkNewEmails() {
    if (!this.initialized) {
      console.log('Gmail service not initialized, skipping email check');
      return [];
    }

    try {
      // Search for emails received after last check
      const query = `after:${Math.floor(this.lastCheckTime.getTime() / 1000)} subject:(RE: Request for Proposal OR RFP OR proposal)`;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 10,
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        console.log('No new vendor emails found');
        return [];
      }

      console.log(`Found ${messages.length} new email(s)`);

      const processedProposals = [];

      for (const message of messages) {
        try {
          const proposal = await this.processEmail(message.id);
          if (proposal) {
            processedProposals.push(proposal);
          }
        } catch (error) {
          console.error(`Error processing email ${message.id}:`, error.message);
        }
      }

      this.lastCheckTime = new Date();
      return processedProposals;
    } catch (error) {
      console.error('Error checking emails:', error.message);
      return [];
    }
  }

  async processEmail(messageId) {
    try {
      const message = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = message.data.payload.headers;
      const fromHeader = headers.find((h) => h.name === 'From');
      const subjectHeader = headers.find((h) => h.name === 'Subject');

      if (!fromHeader) {
        console.log('No From header found, skipping');
        return null;
      }

      // Extract email address from "Name <email@domain.com>" format
      const emailMatch = fromHeader.value.match(/<(.+?)>/) || [null, fromHeader.value];
      const vendorEmail = emailMatch[1].trim();

      console.log('Processing email from:', vendorEmail);

      // Find vendor by email
      const vendor = await Vendor.findOne({ email: vendorEmail });
      if (!vendor) {
        console.log('Vendor not found for email:', vendorEmail);
        return null;
      }

      // Extract email body
      const emailBody = this.extractEmailBody(message.data.payload);

      if (!emailBody) {
        console.log('Could not extract email body');
        return null;
      }

      // Find the most recent proposal for this vendor to get RFP ID
      const existingProposal = await Proposal.findOne({ vendorId: vendor._id })
        .sort({ createdAt: -1 })
        .populate('rfpId');

      if (!existingProposal) {
        console.log('No RFP found for vendor:', vendorEmail);
        return null;
      }

      const rfpId = existingProposal.rfpId._id;

      // Parse email with AI
      const extractedData = await parseProposalEmail(emailBody);

      // Create or update proposal
      const proposal = await Proposal.findOneAndUpdate(
        { rfpId: rfpId, vendorId: vendor._id },
        {
          rfpId: rfpId,
          vendorId: vendor._id,
          rawEmailBody: emailBody,
          extractedData: extractedData,
          receivedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('Proposal created/updated for vendor:', vendor.name);
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

module.exports = new GmailService();
