const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const mediaSchema = new mongoose.Schema(

    {

        /*
        ===========================================
        BASIC INFORMATION
        ===========================================
        */

        originalName: {

            type: String,

            required: true,

            trim: true

        },

        displayName: {

            type: String,

            default: ""

        },

        fileName: {

            type: String,

            required: true,

            unique: true

        },



        /*
        ===========================================
        CLOUDINARY
        ===========================================
        */

        publicId: {

            type: String,

            required: true,

            unique: true

        },

        assetId: {

            type: String,

            required: true,

            unique: true

        },

        version: {

            type: Number

        },



        /*
        ===========================================
        URLS
        ===========================================
        */

        url: {

            type: String,

            required: true

        },

        secureUrl: {

            type: String,

            required: true

        },



        /*
        ===========================================
        FILE DETAILS
        ===========================================
        */

        folder: {

            type: String,

            required: true,

            index: true

        },

        format: {

            type: String,

            required: true

        },

        extension: {

            type: String,

            required: true

        },

        mimeType: {

            type: String,

            required: true

        },

        resourceType: {

            type: String,

            enum: [

                "image",

                "video",

                "raw"

            ],

            default: "image"

        },



        /*
        ===========================================
        IMAGE / VIDEO
        ===========================================
        */

        width: {

            type: Number,

            default: 0

        },

        height: {

            type: Number,

            default: 0

        },

        duration: {

            type: Number,

            default: 0

        },



        /*
        ===========================================
        FILE SIZE
        ===========================================
        */

        bytes: {

            type: Number,

            default: 0

        },

        readableSize: {

            type: String,

            default: ""

        },



        /*
        ===========================================
        IMAGE DETAILS
        ===========================================
        */

        altText: {

            type: String,

            default: ""

        },

        caption: {

            type: String,

            default: ""

        },



        /*
        ===========================================
        TAGS
        ===========================================
        */

        tags: [

            {

                type: String

            }

        ],



        /*
        ===========================================
        WHERE THIS FILE IS USED
        ===========================================
        */

        usedIn: [

            {

                module: {

                    type: String

                },

                documentId: {

                    type: mongoose.Schema.Types.ObjectId

                },

                field: {

                    type: String

                }

            }

        ],



        /*
        ===========================================
        UPLOADER
        ===========================================
        */

        uploadedBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        },



        /*
        ===========================================
        STATUS
        ===========================================
        */

        status: {

            type: String,

            enum: [

                "ACTIVE",

                "DELETED"

            ],

            default: "ACTIVE"

        },



        /*
        ===========================================
        SOFT DELETE
        ===========================================
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

        collection: "blog-media"

    }

);

mediaSchema.index({ status: 1, createdAt: -1 });
mediaSchema.index({ resourceType: 1, isDeleted: 1 });
mediaSchema.index({ tags: 1 });

module.exports = blogConnection.model("BlogMedia", mediaSchema);
