"use strict";

const service = require("../../services/blog-services/page.service");
const { PAGE_MESSAGES } = require("../../constants/blog-constants/page.const");

const input = (req, source) => req.validated?.[source] || req[source];

const handler = action => async (req, res) => {
    try {
        const data = await action(req);
        return res.status(200).json({
            success: true,
            message: PAGE_MESSAGES.PAGE_FOUND,
            data
        });
    } catch (error) {
        res.setHeader("Cache-Control", "no-store");
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getHomePage = handler(req => {
    const query = input(req, "query");
    return service.getHomePage(query.page, query.limit);
});
exports.getBlogs = handler(req => {
    const query = input(req, "query");
    return service.getBlogs(query.page, query.limit);
});
exports.getAuthors = handler(req => {
    const query = input(req, "query");
    return service.getAuthors(query.page, query.limit);
});
exports.getCategories = handler(req => {
    const query = input(req, "query");
    return service.getCategories(query.page, query.limit);
});
exports.getBlogPage = handler(req => {
    const params = input(req, "params");
    return service.getBlogPage(params.slug);
});
exports.getCategoryPage = handler(req => {
    const params = input(req, "params");
    const query = input(req, "query");
    return service.getCategoryPage(params.slug, query.page, query.limit);
});
exports.getTagPage = handler(req => {
    const params = input(req, "params");
    const query = input(req, "query");
    return service.getTagPage(params.slug, query.page, query.limit);
});
exports.getAuthorPage = handler(req => {
    const params = input(req, "params");
    const query = input(req, "query");
    return service.getAuthorPage(params.slug, query.page, query.limit);
});
exports.searchPage = handler(req => {
    const query = input(req, "query");
    return service.searchPage(query.q, query.page, query.limit);
});
