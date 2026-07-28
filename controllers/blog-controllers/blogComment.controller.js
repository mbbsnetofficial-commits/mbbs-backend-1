"use strict";

const service = require("../../services/blog-services/blogComment.service");

const input = (req, source) => req.validated?.[source] || req[source];
const sendError = (res, error) => {
    res.setHeader("Cache-Control", "no-store");
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
    });
};

exports.list = async (req, res) => {
    try {
        const params = input(req, "params");
        const query = input(req, "query");
        const data = await service.list(
            params.slug,
            query.page,
            query.limit,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: "Blog comments loaded successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.create = async (req, res) => {
    try {
        const data = await service.create(
            input(req, "params").slug,
            input(req, "body"),
            req.user
        );
        return res.status(201).json({
            success: true,
            message: "Comment posted successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.update = async (req, res) => {
    try {
        const params = input(req, "params");
        const data = await service.update(
            params.slug,
            params.commentId,
            input(req, "body"),
            req.user
        );
        return res.status(200).json({
            success: true,
            message: "Comment updated successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.remove = async (req, res) => {
    try {
        const params = input(req, "params");
        await service.remove(params.slug, params.commentId, req.user);
        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully."
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.like = async (req, res) => {
    try {
        const params = input(req, "params");
        const data = await service.like(params.slug, params.commentId, req.user);
        return res.status(200).json({
            success: true,
            message: "Comment liked successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.unlike = async (req, res) => {
    try {
        const params = input(req, "params");
        const data = await service.unlike(params.slug, params.commentId, req.user);
        return res.status(200).json({
            success: true,
            message: "Comment unliked successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};
