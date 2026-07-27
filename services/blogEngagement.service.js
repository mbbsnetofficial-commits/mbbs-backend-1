const mongoose = require("mongoose");
const blogRepository = require("../repositories/blog-repositories/blog.respositories");
const engagementRepository = require("../repositories/blogEngagement.repository");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pagination = query => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    return { page, limit, skip: (page - 1) * limit };
};

const blogIds = blogs => blogs.map(blog => String(blog._id));

const stateForBlogs = async (userId, blogs) => {
    const states = await engagementRepository.findStates(userId, blogIds(blogs));
    return {
        likedAt: new Map(states.likes.map(item => [String(item.blog_id), item.liked_at])),
        savedAt: new Map(states.saves.map(item => [String(item.blog_id), item.saved_at]))
    };
};

const formatBlogCard = (blog, state, { includeContent = false } = {}) => {
    const id = String(blog._id);
    const likedAt = state.likedAt.get(id) || null;
    const savedAt = state.savedAt.get(id) || null;

    const response = {
        id,
        blogCode: blog.blogCode,
        title: blog.title,
        slug: blog.slug,
        shortDescription: blog.shortDescription,
        excerpt: blog.excerpt,
        blogType: blog.blogType,
        featuredImage: blog.featuredImage,
        author: blog.author,
        category: blog.category,
        tags: blog.tags,
        readingTime: blog.readingTime,
        totalViews: blog.totalViews,
        totalLikes: blog.totalLikes,
        totalShares: blog.totalShares,
        publishedAt: blog.publishedAt,
        isFeatured: blog.isFeatured,
        isTrending: blog.isTrending,
        isLiked: Boolean(likedAt),
        likedAt,
        isSaved: Boolean(savedAt),
        savedAt
    };
    if (includeContent) response.content = blog.content;
    return response;
};

const formatBlogs = async (userId, blogs) => {
    const state = await stateForBlogs(userId, blogs);
    return blogs.map(blog => formatBlogCard(blog, state));
};

const getPublishedBlog = async blogId => {
    if (!mongoose.isValidObjectId(blogId)) throw createError("Invalid blogId.", 400);
    const blog = await blogRepository.findPublishedById(blogId);
    if (!blog) throw createError("Published blog not found.", 404);
    return blog;
};

const buildFilter = query => {
    const filter = {};
    ["author", "category"].forEach(field => {
        if (query[field]) filter[field] = query[field];
    });
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
        const search = new RegExp(escapeRegex(query.search), "i");
        filter.$or = [
            { title: search },
            { excerpt: search },
            { shortDescription: search }
        ];
    }
    return filter;
};

exports.listBlogs = async (userId, query) => {
    const { page, limit, skip } = pagination(query);
    const filter = buildFilter(query);
    const [blogs, total] = await Promise.all([
        blogRepository.findPublished({ filter, skip, limit }),
        blogRepository.countPublished(filter)
    ]);
    return {
        blogs: await formatBlogs(userId, blogs),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.listSavedBlogs = async (userId, query) => {
    const { page, limit, skip } = pagination(query);
    const saves = await engagementRepository.findSavedForUser(userId);
    const savedAt = new Map(saves.map(item => [String(item.blog_id), item.saved_at]));
    const filter = {
        ...buildFilter(query),
        _id: { $in: saves.map(item => item.blog_id) }
    };
    const [blogs, total] = await Promise.all([
        blogRepository.findPublished({ filter, skip, limit }),
        blogRepository.countPublished(filter)
    ]);
    const state = await stateForBlogs(userId, blogs);
    savedAt.forEach((value, key) => state.savedAt.set(key, value));
    return {
        blogs: blogs.map(blog => formatBlogCard(blog, state)),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getBlog = async (userId, blogId) => {
    const blog = await getPublishedBlog(blogId);
    const state = await stateForBlogs(userId, [blog]);
    return formatBlogCard(blog, state, { includeContent: true });
};

exports.likeBlog = async ({ userId, studentId, blogId }) => {
    await getPublishedBlog(blogId);
    const result = await engagementRepository.like({ userId, studentId, blogId });
    const blog = result.created
        ? await blogRepository.updateLikeCount(blogId, 1)
        : await blogRepository.findPublishedById(blogId);
    return { blogId, isLiked: true, totalLikes: blog.totalLikes };
};

exports.unlikeBlog = async ({ userId, blogId }) => {
    await getPublishedBlog(blogId);
    const result = await engagementRepository.unlike({ userId, blogId });
    const blog = result.deletedCount
        ? await blogRepository.updateLikeCount(blogId, -1)
        : await blogRepository.findPublishedById(blogId);
    return { blogId, isLiked: false, totalLikes: blog.totalLikes };
};

exports.saveBlog = async ({ userId, studentId, blogId }) => {
    await getPublishedBlog(blogId);
    await engagementRepository.save({ userId, studentId, blogId });
    return { blogId, isSaved: true };
};

exports.unsaveBlog = async ({ userId, blogId }) => {
    await getPublishedBlog(blogId);
    await engagementRepository.unsave({ userId, blogId });
    return { blogId, isSaved: false };
};
