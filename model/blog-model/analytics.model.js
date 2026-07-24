const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

/*
=========================================================
Dashboard Statistics Schema
=========================================================
*/

const dashboardSchema = new mongoose.Schema({

    totalBlogs: {
        type: Number,
        default: 0
    },

    publishedBlogs: {
        type: Number,
        default: 0
    },

    draftBlogs: {
        type: Number,
        default: 0
    },

    totalCategories: {
        type: Number,
        default: 0
    },

    totalTags: {
        type: Number,
        default: 0
    },

    totalAuthors: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});
/*
=========================================================
Review Statistics
=========================================================
*/

const reviewSchema = new mongoose.Schema({

    totalReviews: {
        type: Number,
        default: 0
    },

    approvedReviews: {
        type: Number,
        default: 0
    },

    pendingReviews: {
        type: Number,
        default: 0
    },

    rejectedReviews: {
        type: Number,
        default: 0
    },

    averageRating: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});

/*
=========================================================
Search Statistics
=========================================================
*/

const searchSchema = new mongoose.Schema({

    totalSearches: {
        type: Number,
        default: 0
    },

    uniqueKeywords: {
        type: Number,
        default: 0
    },

    noResultSearches: {
        type: Number,
        default: 0
    },

    averageSearchTime: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});
/*
=========================================================
Media Statistics
=========================================================
*/

const mediaSchema = new mongoose.Schema({

    totalFiles: {
        type: Number,
        default: 0
    },

    totalImages: {
        type: Number,
        default: 0
    },

    totalVideos: {
        type: Number,
        default: 0
    },

    storageUsed: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});

/*
=========================================================
SEO Statistics
=========================================================
*/

const seoSchema = new mongoose.Schema({

    indexedPages: {
        type: Number,
        default: 0
    },

    missingMetaTitles: {
        type: Number,
        default: 0
    },

    missingMetaDescriptions: {
        type: Number,
        default: 0
    },

    averageSeoScore: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});
/*
=========================================================
Traffic Statistics
=========================================================
*/

const trafficSchema = new mongoose.Schema({

    totalVisitors: {
        type: Number,
        default: 0
    },

    uniqueVisitors: {
        type: Number,
        default: 0
    },

    pageViews: {
        type: Number,
        default: 0
    },

    bounceRate: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});

/*
=========================================================
Growth Statistics
=========================================================
*/

const growthSchema = new mongoose.Schema({

    blogGrowth: {
        type: Number,
        default: 0
    },

    reviewGrowth: {
        type: Number,
        default: 0
    },

    searchGrowth: {
        type: Number,
        default: 0
    },

    visitorGrowth: {
        type: Number,
        default: 0
    }

}, {
    _id: false
});
/*
=========================================================
Analytics Schema
=========================================================
*/

const analyticsSchema = new mongoose.Schema({

    date: {
        type: Date,
        required: true,
        index: true
    },

    period: {

        type: String,

        enum: [

            "DAILY",

            "WEEKLY",

            "MONTHLY",

            "YEARLY"

        ],

        required: true,

        index: true

    },

    dashboard: dashboardSchema,

    reviews: reviewSchema,

    searches: searchSchema,

    media: mediaSchema,

    seo: seoSchema,

    traffic: trafficSchema,

    growth: growthSchema,

    generatedAt: {

        type: Date,

        default: Date.now

    }

}, {

    timestamps: true,

        collection: "blog-analytics"

});

analyticsSchema.index({

    period: 1,

    date: -1

});

analyticsSchema.index({ period: 1, date: 1 }, { unique: true });

module.exports = blogConnection.model(

    "Analytics",

    analyticsSchema

);
