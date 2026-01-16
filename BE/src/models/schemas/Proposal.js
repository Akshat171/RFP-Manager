const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    rfpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFP',
      required: [true, 'RFP reference is required'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor reference is required'],
    },
    rawEmailBody: {
      type: String,
      trim: true,
      default: '',
    },
    vendorResponseEmail: {
      type: String,
      trim: true,
      default: '',
    },
    extractedData: {
      totalPrice: {
        type: Number,
        min: 0,
      },
      deliveryDate: {
        type: Date,
      },
      warrantyProvided: {
        type: String,
      },
      notes: {
        type: String,
      },
    },
    aiEvaluation: {
      score: {
        type: Number,
        min: 0,
        max: 10,
      },
      summary: {
        type: String,
      },
      recommendation: {
        type: String,
        enum: ['Highly Recommended', 'Recommended', 'Not Recommended', 'Consider'],
      },
    },
    complianceStatus: {
      fulfilled: {
        type: Boolean,
        default: null,
      },
      reasons: {
        type: [String],
        default: [],
      },
      summary: {
        type: String,
        default: '',
      },
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Proposal', proposalSchema);
