const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { generateRFPEmailHTML } = require('../utils/emailTemplate');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'nodemailer';
    console.log('Email Service initialized with provider:', this.provider);
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'brevo':
        if (!process.env.BREVO_API_KEY) {
          console.warn('BREVO_API_KEY not set, email sending will fail');
        }
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
        break;

      case 'resend':
        if (!process.env.RESEND_API_KEY) {
          console.warn('RESEND_API_KEY not set, email sending will fail');
        }
        this.resend = new Resend(process.env.RESEND_API_KEY);
        break;

      case 'sendgrid':
        if (!process.env.SENDGRID_API_KEY) {
          console.warn('SENDGRID_API_KEY not set, email sending will fail');
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgrid = sgMail;
        break;

      case 'nodemailer':
      default:
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        break;
    }
  }

  async sendRFP(to, vendorName, rfpData) {
    const subject = 'Request for Proposal - Your Expertise Needed';
    const htmlBody = generateRFPEmailHTML(vendorName, rfpData);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@procurement.com';
    const fromName = process.env.FROM_NAME || 'Procurement Team';

    try {
      switch (this.provider) {
        case 'brevo':
          return await this.sendWithBrevo(to, subject, htmlBody, fromEmail, fromName);

        case 'resend':
          return await this.sendWithResend(to, subject, htmlBody, fromEmail, fromName);

        case 'sendgrid':
          return await this.sendWithSendGrid(to, subject, htmlBody, fromEmail, fromName);

        case 'nodemailer':
        default:
          return await this.sendWithNodemailer(to, subject, htmlBody, fromEmail, fromName);
      }
    } catch (error) {
      console.error(`Email sending failed with ${this.provider}:`, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWithBrevo(to, subject, htmlBody, fromEmail, fromName) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlBody;

    const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent via Brevo:', result.messageId);
    return result;
  }

  async sendWithResend(to, subject, htmlBody, fromEmail, fromName) {
    const { data, error } = await this.resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
    }

    console.log('✅ Email sent via Resend successfully!');
    console.log('   Message ID:', data.id);
    console.log('   To:', to);
    return data;
  }

  async sendWithSendGrid(to, subject, htmlBody, fromEmail, fromName) {
    const msg = {
      to: to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: subject,
      html: htmlBody,
    };

    const result = await this.sendgrid.send(msg);
    console.log('Email sent via SendGrid:', result[0].statusCode);
    return result;
  }

  async sendWithNodemailer(to, subject, htmlBody, fromEmail, fromName) {
    const info = await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });

    console.log('Email sent via Nodemailer:', info.messageId);
    return info;
  }
}

module.exports = new EmailService();
