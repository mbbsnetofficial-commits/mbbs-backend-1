"use strict";



/**
 * Remove null/undefined values from an object.
 *
 * @param {Object} data
 * @returns {Object}
 */
const cleanObject = (data = {}) => {
    return Object.fromEntries(
        Object.entries(data).filter(
            ([, value]) => value !== null && value !== undefined
        )
    );
};

/**
 * Build breadcrumb data.
 *
 * @param {Array} items
 * @returns {Array}
 */
const buildBreadcrumb = (items = []) => {
    return items.map(item => ({
        title: item.title,
        slug: item.slug,
        url: item.url
    }));
};

/**
 * Create a standard page response.
 *
 * @param {Object} options
 * @returns {Object}
 */
const buildPageResponse = ({
    page = "",
    seo = {},
    hero = null,
    content = null,
    related = [],
    breadcrumbs = [],
    extras = {}
}) => {

    return cleanObject({

        page,

        seo,

        hero,

        content,

        related,

        breadcrumbs,

        ...extras

    });

};

/**
 * Build pagination metadata.
 *
 * @param {Number} page
 * @param {Number} limit
 * @param {Number} total
 * @returns {Object}
 */
const buildPagination = (
    page = 1,
    limit = 10,
    total = 0
) => {

    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);
    const totalPages = Math.ceil(total / limit);

    return {

        currentPage: page,

        perPage: limit,

        totalItems: total,

        totalPages,

        hasPrevious: page > 1,

        hasNext: page < totalPages

    };

};

/**
 * Format API success response.
 *
 * @param {String} message
 * @param {*} data
 * @returns {Object}
 */
const successResponse = (
    message,
    data
) => {

    return {

        success: true,

        message,

        data

    };

};

/**
 * Format API error response.
 *
 * @param {String} message
 * @returns {Object}
 */
const errorResponse = (message) => {

    return {

        success: false,

        message

    };

};

module.exports = {

    cleanObject,

    buildBreadcrumb,

    buildPageResponse,

    buildPagination,

    successResponse,

    errorResponse

};
