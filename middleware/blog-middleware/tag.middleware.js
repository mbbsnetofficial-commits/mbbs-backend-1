const mongoose = require("mongoose");

const Tag = require("../../model/blog-model/tag.model");

/**
 * ==========================================
 * Validate MongoDB ObjectId
 * ==========================================
 */

const validateTagId = (req, res, next) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid Tag ID."

            });

        }

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Check Duplicate Tag Name
 * ==========================================
 */

const checkDuplicateTagName = async (req, res, next) => {

    try {

        const { tagName } = req.body;

        if (!tagName) {

            return next();

        }

        const existingTag = await Tag.findOne({

            tagName: tagName.trim(),

            isDeleted: false

        });

        if (existingTag) {

            return res.status(409).json({

                success: false,

                message: "Tag name already exists."

            });

        }

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Check Duplicate Slug
 * ==========================================
 */

const checkDuplicateSlug = async (req, res, next) => {

    try {

        const { slug } = req.body;

        if (!slug) {

            return next();

        }

        const existingSlug = await Tag.findOne({

            slug: slug.trim().toLowerCase(),

            isDeleted: false

        });

        if (existingSlug) {

            return res.status(409).json({

                success: false,

                message: "Tag slug already exists."

            });

        }

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Check Tag Exists
 * ==========================================
 */

const checkTagExists = async (req, res, next) => {

    try {

        const { id } = req.params;

        const tag = await Tag.findOne({

            _id: id,

            isDeleted: false

        });

        if (!tag) {

            return res.status(404).json({

                success: false,

                message: "Tag not found."

            });

        }

        req.tag = tag;

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Validate Status
 * ==========================================
 */

const validateStatus = (req, res, next) => {

    try {

        const { status } = req.body;

        if (status !== undefined && typeof status !== "boolean") {

            return res.status(400).json({

                success: false,

                message: "Status must be true or false."

            });

        }

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Sanitize Request Body
 * ==========================================
 */

const sanitizeRequest = (req, res, next) => {

    try {

        if (req.body.tagName) {

            req.body.tagName = req.body.tagName.trim();

        }

        if (req.body.description) {

            req.body.description = req.body.description.trim();

        }

        if (req.body.slug) {

            req.body.slug = req.body.slug
                .trim()
                .toLowerCase();

        }

        next();

    } catch (error) {

        next(error);

    }

};


/**
 * ==========================================
 * Export
 * ==========================================
 */

module.exports = {

    validateTagId,

    checkDuplicateTagName,

    checkDuplicateSlug,

    checkTagExists,

    validateStatus,

    sanitizeRequest

};
