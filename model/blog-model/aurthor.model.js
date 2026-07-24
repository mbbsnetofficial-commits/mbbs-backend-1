const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const authorSchema = new mongoose.Schema(
    {

        // =====================================
        // Basic Information
        // =====================================

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        authorCode: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: ""
        },

        designation: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            maxlength: 3000
        },

        // =====================================
        // Author Type
        // =====================================

        authorType: {
            type: String,
            enum: [
                "ADMIN",
                "EDITOR",
                "COUNSELOR",
                "DOCTOR",
                "UNIVERSITY_REPRESENTATIVE",
                "GUEST_AUTHOR"
            ],
            default: "EDITOR"
        },

        // =====================================
        // Profile Images
        // =====================================

        profileImage: {
            type: String,
            default: ""
        },

        coverImage: {
            type: String,
            default: ""
        },

        // =====================================
        // Professional Information
        // =====================================

        experience: {
            type: Number,
            default: 0
        },

        qualifications: [{
            type: String
        }],

        specializations: [{
            type: String
        }],

        languages: [{
            type: String
        }],

        country: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        // =====================================
        // Social Links
        // =====================================

        socialLinks: {

            website: {
                type: String,
                default: ""
            },

            linkedin: {
                type: String,
                default: ""
            },

            twitter: {
                type: String,
                default: ""
            },

            facebook: {
                type: String,
                default: ""
            },

            instagram: {
                type: String,
                default: ""
            },

            youtube: {
                type: String,
                default: ""
            }

        },

        // =====================================
        // Statistics
        // =====================================

        totalBlogs: {
            type: Number,
            default: 0
        },

        totalViews: {
            type: Number,
            default: 0
        },

        totalLikes: {
            type: Number,
            default: 0
        },

        totalComments: {
            type: Number,
            default: 0
        },

        // =====================================
        // Display
        // =====================================

        isFeatured: {
            type: Boolean,
            default: false
        },

        status: {
            type: Boolean,
            default: true
        },

        displayOrder: {
            type: Number,
            default: 0
        },

        // =====================================
        // SEO
        // =====================================

        seo: {

            metaTitle: {
                type: String,
                default: ""
            },

            metaDescription: {
                type: String,
                default: ""
            },

            keywords: [{
                type: String
            }],

            canonicalUrl: {
                type: String,
                default: ""
            }

        },

        // =====================================
        // Metadata
        // =====================================

        metadata: {
            type: Object,
            default: {}
        },

        // =====================================
        // Audit
        // =====================================

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

        // =====================================
        // Soft Delete
        // =====================================

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

        collection: "blog_authors"

    }
);

/**
 * =====================================
 * Indexes
 * =====================================
 */

authorSchema.index({ fullName: 1 });

authorSchema.index({ authorType: 1 });

authorSchema.index({ status: 1 });

authorSchema.index({ isFeatured: 1 });

authorSchema.index({ totalBlogs: -1 });

authorSchema.index({ displayOrder: 1 });

authorSchema.index({ isDeleted: 1 });

/**
 * =====================================
 * Virtual
 * =====================================
 */

authorSchema.virtual("blogCount").get(function () {

    return this.totalBlogs;

});

/**
 * =====================================
 * Export
 * =====================================
 */

module.exports = blogConnection.model(
    "BlogAuthor",
    authorSchema
);
