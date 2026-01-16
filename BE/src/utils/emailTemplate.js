const generateRFPEmailHTML = (vendorName, rfpData) => {
  const { items, budget, deadline, paymentTerms, warranty } = rfpData || {};

  // Handle null or undefined items array
  const itemsArray = Array.isArray(items) ? items : [];

  const itemsList = itemsArray.length > 0
    ? itemsArray
        .map(
          (item) =>
            `<li><strong>${item.name}</strong>${
              item.specs ? ` - ${item.specs}` : ''
            } (Quantity: ${item.quantity})</li>`
        )
        .join('')
    : '<li>No specific items listed</li>';

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 0 0 5px 5px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
          font-size: 16px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        .info-box {
          background-color: white;
          padding: 15px;
          border-left: 4px solid #4CAF50;
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Request for Proposal (RFP)</h1>
      </div>

      <div class="content">
        <p>Dear ${vendorName},</p>

        <p>We are pleased to invite you to submit a proposal for the following procurement requirement:</p>

        <div class="section">
          <div class="section-title">Required Items:</div>
          <ul>
            ${itemsList}
          </ul>
        </div>

        <div class="info-box">
          <div class="section">
            <div class="section-title">Budget:</div>
            <p>${budget ? `$${budget.toLocaleString()}` : 'Not specified'}</p>
          </div>

          <div class="section">
            <div class="section-title">Deadline for Submission:</div>
            <p>${formatDate(deadline)}</p>
          </div>

          ${
            paymentTerms
              ? `
          <div class="section">
            <div class="section-title">Payment Terms:</div>
            <p>${paymentTerms}</p>
          </div>
          `
              : ''
          }

          ${
            warranty
              ? `
          <div class="section">
            <div class="section-title">Warranty Requirements:</div>
            <p>${warranty}</p>
          </div>
          `
              : ''
          }
        </div>

        <div class="footer">
          <p><strong>How to Respond:</strong></p>
          <p>Please reply to this email with your proposal including pricing, delivery timeline, and any relevant product/service details.</p>
          <p>We look forward to your competitive proposal.</p>
          <p>Best regards,<br>Procurement Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generateRFPEmailHTML,
};
