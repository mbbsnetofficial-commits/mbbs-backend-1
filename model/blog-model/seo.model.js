const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

/*
=========================================================
Open Graph Schema
=========================================================
*/

const openGraphSchema = new mongoose.Schema(

    {

        title: {

            type: String,

            trim: true,

            default: ""

        },

        description: {

            type: String,

            trim: true,

            default: ""

        },

        image: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogMedia",

            default: null

        },

        imageAlt: {

            type: String,

            default: ""

        },

        type: {

            type: String,

            default: "website"

        }

    },

    {

        _id: false

    }

);

/*
=========================================================
Twitter Schema
=========================================================
*/

const twitterSchema = new mongoose.Schema(

    {

        card: {

            type: String,

            default: "summary_large_image"

        },

        title: {

            type: String,

            default: ""

        },

        description: {

            type: String,

            default: ""

        },

        image: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogMedia",

            default: null

        }

    },

    {

        _id: false

    }

);

/*
=========================================================
SEO Schema
=========================================================
*/

const seoSchema = new mongoose.Schema(

    {

        /*
        =========================================================
        Reference
        =========================================================
        */

        module: {

            type: String,

            required: true,

            enum: [

                "BLOG",

                "PAGE",

                "AUTHOR",

                "CATEGORY",

                "TAG",

                "COUNTRY",

                "UNIVERSITY",

                "HOME",

                "SERVICE"

            ],

            index: true

        },

        referenceId: {

            type: mongoose.Schema.Types.ObjectId,

            required: true,

            index: true

        },

        /*
        =========================================================
        URL
        =========================================================
        */

        slug: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            lowercase: true

        },

        canonicalUrl: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        Meta
        =========================================================
        */

        metaTitle: {

            type: String,

            required: true,

            trim: true

        },

        metaDescription: {

            type: String,

            required: true,

            trim: true

        },

        metaKeywords: [

            {

                type: String,

                trim: true

            }

        ],

        /*
        =========================================================
        Robots
        =========================================================
        */

        robots: {

            type: String,

            default: "index,follow"

        },

        /*
        =========================================================
        Open Graph
        =========================================================
        */

        openGraph: {

            type: openGraphSchema,

            default: () => ({})

        },

        /*
        =========================================================
        Twitter
        =========================================================
        */

        twitter: {

            type: twitterSchema,

            default: () => ({})

        },

        /*
        =========================================================
        Sitemap
        =========================================================
        */

        sitemap: {

            priority: {

                type: Number,

                default: 0.8

            },

            changeFrequency: {

                type: String,

                default: "weekly"

            }

        },

        /*
        =========================================================
        Schema.org
        =========================================================
        */

        schemaType: {

            type: String,

            default: "Article"

        },

        schemaData: {

            type: mongoose.Schema.Types.Mixed,

            default: {}

        },

        /*
        =========================================================
        Redirect
        =========================================================
        */

        redirectUrl: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        Status
        =========================================================
        */

        isActive: {

            type: Boolean,

            default: true

        },

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

        collection: "blog-seo"

    }

);

/*
=========================================================
Indexes
=========================================================
*/

seoSchema.index({

    module: 1,

    referenceId: 1

}, { unique: true });

seoSchema.index({

    metaTitle: "text",

    metaDescription: "text",

    metaKeywords: "text"

});

/*
=========================================================
Virtual
=========================================================
*/

seoSchema.virtual("url").get(function () {

    return `/${this.slug}`;

});

/*
=========================================================
Export
=========================================================
*/

module.exports = blogConnection.model(

    "SEO",

    seoSchema

);
