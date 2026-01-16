const mongoose = require('mongoose');

const rfpItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specs: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const rfpSchema = new mongoose.Schema(
  {
    originalDescription: {
      type: String,
      required: [true, 'Original description is required'],
      trim: true,
    },
    structuredData: {
      items: {
        type: [rfpItemSchema],
        default: [],
      },
      budget: {
        type: Number,
        min: 0,
      },
      deadline: {
        type: Date,
      },
      paymentTerms: {
        type: String,
      },
      warranty: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    sentToVendors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Vendor',
      default: [],
    },
    respondedVendors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Vendor',
      default: [],
    },
    selectedVendors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Vendor',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RFP', rfpSchema);
