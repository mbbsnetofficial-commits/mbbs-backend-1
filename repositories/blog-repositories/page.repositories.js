"use strict";

const Blog = require("../../model/blog-model/blog.model");
const Category = require("../../model/blog-model/category.model");
const Tag = require("../../model/blog-model/tag.model");
const Author = require("../../model/blog-model/aurthor.model");
const SEO = require("../../model/blog-model/seo.model");
const Review = require("../../model/blog-model/review.model");

const publishedFilter = { isDeleted: false, status: "PUBLISHED", visibility: "PUBLIC" };
const populateBlog = query => query
    .populate("author", "fullName slug designation profileImage bio")
    .populate("category", "categoryName slug description icon bannerImage")
    .populate("tags", "tagName slug color icon");
const seoFor = (module, referenceId) =>
    SEO.findOne({ module, referenceId, isDeleted: false, isActive: true }).lean();
const paginateBlogs = async (filter, page, limit) => {
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
        populateBlog(Blog.find({ ...publishedFilter, ...filter })
            .select("-password")
            .sort({ isPinned: -1, publishedAt: -1 })
            .skip(skip).limit(limit)).lean(),
        Blog.countDocuments({ ...publishedFilter, ...filter })
    ]);
    return { blogs, total };
};

exports.getHomePageData = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [featuredBlogs, publishedBlogs, total, seo] =
        await Promise.all([
            populateBlog(Blog.find({ ...publishedFilter, isFeatured: true })
                .select("-password").sort({ publishedAt: -1 }).limit(6)).lean(),
            populateBlog(Blog.find(publishedFilter)
                .select("-password")
                .sort({ isPinned: -1, publishedAt: -1 })
                .skip(skip)
                .limit(limit)).lean(),
            Blog.countDocuments(publishedFilter),
            SEO.findOne({ module: "HOME", isDeleted: false, isActive: true }).lean()
        ]);
    return { featuredBlogs, publishedBlogs, total, seo };
};

exports.getBlogs = async (page, limit) => {
    return paginateBlogs({}, page, limit);
};

exports.getAuthors = async (page, limit) => {
    const filter = { isDeleted: false, status: true };
    const skip = (page - 1) * limit;
    const [authors, total] = await Promise.all([
        Author.find(filter)
            .select("fullName slug designation bio authorType profileImage coverImage experience qualifications specializations languages country city socialLinks totalBlogs totalViews totalLikes totalComments isFeatured")
            .sort({ isFeatured: -1, displayOrder: 1, fullName: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Author.countDocuments(filter)
    ]);
    return { authors, total };
};

exports.getCategories = async (page, limit) => {
    const filter = { isDeleted: false, status: true };
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
        Category.find(filter)
            .select("categoryName categoryCode categoryType slug description icon bannerImage parentCategory level displayOrder isFeatured totalBlogs")
            .sort({ displayOrder: 1, categoryName: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Category.countDocuments(filter)
    ]);
    return { categories, total };
};

exports.getBlogPageData = async slug => {
    const blog = await populateBlog(Blog.findOne({ ...publishedFilter, slug }).select("-password")).lean();
    if (!blog) return null;
    const [seo, relatedBlogs, reviews] = await Promise.all([
        seoFor("BLOG", blog._id),
        populateBlog(Blog.find({
            ...publishedFilter,
            category: blog.category?._id || blog.category,
            _id: { $ne: blog._id }
        }).select("-password").sort({ publishedAt: -1 }).limit(6)).lean(),
        Review.find({
            reviewType: "BLOG",
            referenceId: blog._id,
            status: "APPROVED",
            isDeleted: false
        }).select("reviewerName title review rating isVerified createdAt").sort({ createdAt: -1 }).lean()
    ]);
    return { blog, seo, relatedBlogs, reviews };
};

exports.getCategoryPageData = async (slug, page, limit) => {
    const category = await Category.findOne({ slug, isDeleted: false, status: true }).lean();
    if (!category) return null;
    const [{ blogs, total }, seo] = await Promise.all([
        paginateBlogs({ category: category._id }, page, limit),
        seoFor("CATEGORY", category._id)
    ]);
    return { category, blogs, total, seo };
};

exports.getTagPageData = async (slug, page, limit) => {
    const tag = await Tag.findOne({ slug, isDeleted: false, status: true }).lean();
    if (!tag) return null;
    const [{ blogs, total }, seo] = await Promise.all([
        paginateBlogs({ tags: tag._id }, page, limit),
        seoFor("TAG", tag._id)
    ]);
    return { tag, blogs, total, seo };
};

exports.getAuthorPageData = async (slug, page, limit) => {
    const author = await Author.findOne({ slug, isDeleted: false, status: true }).lean();
    if (!author) return null;
    const [{ blogs, total }, seo] = await Promise.all([
        paginateBlogs({ author: author._id }, page, limit),
        seoFor("AUTHOR", author._id)
    ]);
    return { author, blogs, total, seo };
};

exports.searchPage = async (keyword, page, limit) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    return paginateBlogs({
        $or: [
            { title: regex },
            { slug: regex },
            { excerpt: regex },
            { shortDescription: regex }
        ]
    }, page, limit);
};
