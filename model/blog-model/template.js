const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const templateSchema = new mongoose.Schema(
  {
    // Display name
    templateName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Unique code used by frontend
    templateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // Short description
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    // Preview thumbnail
    thumbnail: {
      type: String,
      default: "",
    },

    // Multiple preview screenshots
    previewImages: [
      {
        type: String,
      },
    ],

    // Sections that can be used by this template
    allowedSections: {
      type: [String],
      default: [],
    },

    // Is template active?
    status: {
      type: Boolean,
      default: true,
    },

    // Template version
    version: {
      type: Number,
      default: 1,
    },

    // Default template
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Sort order in CMS
    displayOrder: {
      type: Number,
      default: 0,
    },

    // Future compatible
    metadata: {
      type: Object,
      default: () => ({}),
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "blog_templates",
  }
);

templateSchema.index({ isDeleted: 1, status: 1, displayOrder: 1 });
templateSchema.index({ templateName: 1, isDeleted: 1 });

module.exports = blogConnection.model("BlogTemplate", templateSchema);
