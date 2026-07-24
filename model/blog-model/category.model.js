const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const categorySchema = new mongoose.Schema(
    {
        // Category Name
        categoryName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
            unique: true
        },

        categoryCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        categoryType: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        // URL Slug
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            index: true
        },

        // Short Description
        description: {
            type: String,
            default: "",
            maxlength: 500
        },

        // Category Icon
        icon: {
            type: String,
            default: ""
        },

        // Category Banner Image
        bannerImage: {
            type: String,
            default: ""
        },

        // Parent Category
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BlogCategory",
            default: null
        },

        // Category Level
        level: {
            type: Number,
            default: 1
        },

        // Display Order
        displayOrder: {
            type: Number,
            default: 0
        },

        // Featured Category
        isFeatured: {
            type: Boolean,
            default: false
        },

        // Active / Inactive
        status: {
            type: Boolean,
            default: true
        },

        // Number of Blogs
        totalBlogs: {
            type: Number,
            default: 0
        },

        // SEO Information
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

        // Future Metadata
        metadata: {
            type: Object,
            default: () => ({})
        },

        // Created By
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Updated By
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Soft Delete
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
        collection: "blog_categories"
    }
);

// ================================
// Indexes
// ================================

categorySchema.index({ parentCategory: 1 });

categorySchema.index({ status: 1 });

categorySchema.index({ isFeatured: 1 });

categorySchema.index({ displayOrder: 1 });

categorySchema.index({ isDeleted: 1 });

// ================================
// Virtual Field
// ================================

categorySchema.virtual("children", {
    ref: "BlogCategory",
    localField: "_id",
    foreignField: "parentCategory"
});

// ================================
// Export
// ================================

module.exports = blogConnection.model(
    "BlogCategory",
    categorySchema
);
