const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const tagSchema = new mongoose.Schema(
    {

        // ===============================
        // Basic Information
        // ===============================

        tagName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minlength: 2,
            maxlength: 100
        },

        tagCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        description: {
            type: String,
            default: "",
            maxlength: 500
        },

        // ===============================
        // Tag Type
        // ===============================

        tagType: {
            type: String,
            enum: [
                "COUNTRY",
                "EXAM",
                "UNIVERSITY",
                "COURSE",
                "SCHOLARSHIP",
                "HOSTEL",
                "VISA",
                "NEWS",
                "GENERAL"
            ],
            default: "GENERAL"
        },

        // ===============================
        // UI
        // ===============================

        color: {
            type: String,
            default: "#2196F3"
        },

        icon: {
            type: String,
            default: ""
        },

        bannerImage: {
            type: String,
            default: ""
        },

        // ===============================
        // Display
        // ===============================

        displayOrder: {
            type: Number,
            default: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        status: {
            type: Boolean,
            default: true
        },

        // ===============================
        // Statistics
        // ===============================

        totalBlogs: {
            type: Number,
            default: 0
        },

        totalViews: {
            type: Number,
            default: 0
        },

        // ===============================
        // SEO
        // ===============================

        seo: {

            metaTitle: {
                type: String,
                default: ""
            },

            metaDescription: {
                type: String,
                default: ""
            },

            keywords: [
                {
                    type: String
                }
            ],

            canonicalUrl: {
                type: String,
                default: ""
            }

        },

        // ===============================
        // Future Metadata
        // ===============================

        metadata: {
            type: Object,
            default: () => ({})
        },

        // ===============================
        // Audit
        // ===============================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ===============================
        // Soft Delete
        // ===============================

        isDeleted: {
            type: Boolean,
            default: false
        },

        deletedAt: {
            type: Date,
            default: null
        }

    },
    {

        timestamps: true,

        collection: "blog_tags"

    }
);

// ======================================
// Indexes
// ======================================

tagSchema.index({ tagType: 1 });

tagSchema.index({ status: 1 });

tagSchema.index({ isFeatured: 1 });

tagSchema.index({ displayOrder: 1 });

tagSchema.index({ totalBlogs: -1 });

tagSchema.index({ isDeleted: 1 });


// ======================================
// Virtual Field
// ======================================

tagSchema.virtual("blogCount").get(function () {

    return this.totalBlogs;

});


// ======================================
// Export
// ======================================

module.exports = blogConnection.model(
    "BlogTag",
    tagSchema
);
