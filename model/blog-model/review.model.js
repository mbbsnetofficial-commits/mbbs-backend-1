const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");


const mediaSchema = new mongoose.Schema(

    {

        mediaId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "BlogMedia"

        },

        mediaType: {

            type: String,

            enum: [

                "IMAGE",

                "VIDEO"

            ],

            default: "IMAGE"

        }

    },

    {

        _id: false

    }

);

/*
=========================================================
Review Schema
=========================================================
*/

const reviewSchema = new mongoose.Schema(

    {

        /*
        =========================================================
        REVIEW TYPE
        =========================================================
        */

        reviewType: {

            type: String,

            required: true,

            enum: [

                "UNIVERSITY",

                "COUNTRY",

                "BLOG",

                "CONSULTANT",

                "AUTHOR",

                "WEBSITE"

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
        REVIEWER
        =========================================================
        */

        studentId: {

            type: mongoose.Schema.Types.ObjectId,

            default: null

        },

        reviewerName: {

            type: String,

            required: true,

            trim: true

        },

        email: {

            type: String,

            trim: true,

            lowercase: true

        },

        phone: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        LOCATION
        =========================================================
        */

        country: {

            type: String,

            default: ""

        },

        city: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        REVIEW
        =========================================================
        */

        title: {

            type: String,

            required: true,

            trim: true

        },

        review: {

            type: String,

            required: true,

            trim: true

        },

        rating: {

            type: Number,

            required: true,

            min: 1,

            max: 5,

            index: true

        },

        /*
        =========================================================
        MEDIA
        =========================================================
        */

        media: {

            type: [

                mediaSchema

            ],

            default: []

        },

        /*
        =========================================================
        VERIFICATION
        =========================================================
        */

        isVerified: {

            type: Boolean,

            default: false

        },

        verifiedAt: {

            type: Date,

            default: null

        },

        /*
        =========================================================
        FEATURED
        =========================================================
        */

        isFeatured: {

            type: Boolean,

            default: false

        },

        featuredAt: {

            type: Date,

            default: null

        },

        /*
        =========================================================
        APPROVAL
        =========================================================
        */

        status: {

            type: String,

            enum: [

                "PENDING",

                "APPROVED",

                "REJECTED",

                "SPAM"

            ],

            default: "PENDING",

            index: true

        },

        approvedBy: {

            type: mongoose.Schema.Types.ObjectId,

            default: null

        },

        approvedAt: {

            type: Date,

            default: null

        },

        rejectionReason: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        LIKE / HELPFUL
        =========================================================
        */

        helpfulCount: {

            type: Number,

            default: 0

        },

        reportCount: {

            type: Number,

            default: 0

        },

        /*
        =========================================================
        SEO
        =========================================================
        */

        slug: {

            type: String,

            default: ""

        },

        /*
        =========================================================
        SOFT DELETE
        =========================================================
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

        collection: "blog-reviews"

    }

);

/*
=========================================================
Indexes
=========================================================
*/

reviewSchema.index({

    reviewType: 1,

    referenceId: 1

});

reviewSchema.index({

    isFeatured: 1

});

reviewSchema.index(
    { studentId: 1, reviewType: 1, referenceId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            studentId: { $type: "objectId" },
            isDeleted: false
        }
    }
);

reviewSchema.index({

    isVerified: 1

});

reviewSchema.index({

    createdAt: -1

});

reviewSchema.index({

    reviewerName: "text",

    title: "text",

    review: "text"

});

/*
=========================================================
Virtual
=========================================================
*/

reviewSchema.virtual(

    "shortReview"

).get(function () {

    if (!this.review) {

        return "";

    }

    return this.review.length > 120

        ? this.review.substring(0, 120) + "..."

        : this.review;

});

/*
=========================================================
Export
=========================================================
*/

module.exports = blogConnection.model(

    "Review",

    reviewSchema

);
