const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const blogSchema = new mongoose.Schema(

    {

        /*
        ============================================
        BASIC INFORMATION
        ============================================
        */

        title: {

            type: String,

            required: true,

            trim: true,

            maxlength: 250

        },

        blogCode: {
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

        shortDescription: {

            type: String,

            default: "",

            maxlength: 500

        },

        excerpt: {

            type: String,

            default: ""

        },

        content: {

            type: Object,

            required: true

        },

        blogType: {
            type: String,
            enum: ["BLOG", "NEWS", "ARTICLE", "GUIDE", "FAQ", "CASE_STUDY"],
            default: "BLOG"
        },



        /*
        ============================================
        TEMPLATE
        ============================================
        */

        template: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogTemplate",

            required: true

        },



        /*
        ============================================
        CATEGORY
        ============================================
        */

        category: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogCategory",

            required: true

        },



        /*
        ============================================
        TAGS
        ============================================
        */

        tags: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "BlogTag"

            }

        ],



        /*
        ============================================
        AUTHOR
        ============================================
        */

        author: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogAuthor",

            required: true

        },



        /*
        ============================================
        FEATURED IMAGE
        ============================================
        */

        featuredImage: {

            url: String,

            alt: String,

            caption: String

        },



        /*
        ============================================
        GALLERY
        ============================================
        */

        gallery: [

            {

                url: String,

                alt: String

            }

        ],



        /*
        ============================================
        VIDEOS
        ============================================
        */

        videos: [

            {

                title: String,

                url: String

            }

        ],



        /*
        ============================================
        BLOG STATUS
        ============================================
        */

        status: {

            type: String,

            enum: [

                "DRAFT",

                "REVIEW",

                "SCHEDULED",

                "PUBLISHED",

                "ARCHIVED"

            ],

            default: "DRAFT"

        },



        visibility: {

            type: String,

            enum: [

                "PUBLIC",

                "PRIVATE",

                "PASSWORD"

            ],

            default: "PUBLIC"

        },



        password: {

            type: String,

            default: ""

        },



        /*
        ============================================
        PUBLISH DETAILS
        ============================================
        */

        publishedAt: Date,

        scheduledAt: Date,



        /*
        ============================================
        FLAGS
        ============================================
        */

        isFeatured: {

            type: Boolean,

            default: false

        },

        isTrending: {

            type: Boolean,

            default: false

        },

        isPinned: {

            type: Boolean,

            default: false

        },



        /*
        ============================================
        ANALYTICS
        ============================================
        */

        readingTime: {

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

        totalShares: {

            type: Number,

            default: 0

        },

        totalComments: {

            type: Number,

            default: 0

        },



        /*
        ============================================
        SEO
        ============================================
        */

        seo: {

            metaTitle: String,

            metaDescription: String,

            keywords: [

                String

            ],

            canonicalUrl: String,

            robots: {

                type: String,

                default: "index,follow"

            }

        },



        /*
        ============================================
        FAQ
        ============================================
        */

        faqs: [

            {

                question: String,

                answer: String

            }

        ],



        /*
        ============================================
        RELATED BLOGS
        ============================================
        */

        relatedBlogs: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "Blog"

            }

        ],



        /*
        ============================================
        CUSTOM METADATA
        ============================================
        */

        metadata: {

            type: Object,

            default: {}

        },



        /*
        ============================================
        AUDIT
        ============================================
        */

        createdBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        },

        updatedBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        },



        /*
        ============================================
        SOFT DELETE
        ============================================
        */

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

        collection: "blogs"

    }

);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ isTrending: 1, status: 1 });
blogSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = blogConnection.model("Blog", blogSchema);
