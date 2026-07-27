const bcrypt = require("bcryptjs");
const repository = require("../../repositories/blog-repositories/blog.respositories");
const mediaService = require("./media.service");
const {
    MIME_TYPES,
    CLOUDINARY_FOLDERS
} = require("../../constants/blog-constants/media.const");
const {
    BLOG_STATUS,
    BLOG_VISIBILITY,
    MESSAGES,
    SEARCH_FIELDS
} = require("../../constants/blog-constants/blog.const");
const {
    generateSlug,
    generateBlogCode,
    generateExcerpt,
    calculateReadingTime,
    getPagination,
    buildSort,
    buildSearchRegex,
    uniqueIds,
    getDefaultSeo,
    formatBlogResponse
} = require("../../utilities/blog");

const error = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const actorId = actor => actor?.id || actor?._id || null;
const contentText = content => typeof content === "string" ? content : JSON.stringify(content);

const ensureSlug = async (slug, excludeId) => {
    if (await repository.findBySlug(slug, excludeId)) throw error(MESSAGES.SLUG_EXISTS, 409);
};

const getDocument = async id => {
    const blog = await repository.findActiveDocumentById(id);
    if (!blog) throw error(MESSAGES.NOT_FOUND, 404);
    return blog;
};

const ensureRelations = async data => {
    const result = await repository.validateRelations(data);
    const invalid = Object.entries(result).filter(([, valid]) => !valid).map(([name]) => name);
    if (invalid.length) throw error(`Invalid or inactive blog relation: ${invalid.join(", ")}.`, 400);
};

const normalize = async (payload, existing = null) => {
    const data = { ...payload };
    if (data.tags) data.tags = uniqueIds(data.tags);
    if (data.relatedBlogs) data.relatedBlogs = uniqueIds(data.relatedBlogs);
    if (data.content !== undefined) {
        const text = contentText(data.content);
        data.readingTime = calculateReadingTime(text);
        if (!data.excerpt) data.excerpt = generateExcerpt(text, 180);
    }
    if (data.password !== undefined) {
        data.password = data.password ? await bcrypt.hash(data.password, 10) : "";
    }
    if ((data.visibility || existing?.visibility) === BLOG_VISIBILITY.PASSWORD &&
        !(data.password || existing?.password)) {
        throw error("A password is required when visibility is PASSWORD.", 400);
    }
    return data;
};

exports.createBlog = async (payload, actor) => {
    const slug = payload.slug || generateSlug(payload.title);
    await ensureSlug(slug);
    await ensureRelations(payload);
    const data = await normalize({
        ...payload,
        slug,
        blogCode: generateBlogCode(payload.title),
        seo: { ...getDefaultSeo(payload.title), ...(payload.seo || {}) },
        createdBy: actorId(actor),
        updatedBy: actorId(actor)
    });
    // Publishing is performed through the explicit publish endpoint.
    data.status = BLOG_STATUS.DRAFT;
    return formatBlogResponse(await repository.create(data));
};

exports.listBlogs = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    ["status", "visibility", "blogType", "category", "author", "isFeatured", "isTrending"]
        .forEach(field => { if (query[field] !== undefined) filter[field] = query[field]; });
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
        const regex = buildSearchRegex(query.search);
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: regex }));
    }
    const [blogs, total] = await Promise.all([
        repository.findAll({ filter, sort: buildSort(query.sortBy, query.sortOrder), skip, limit }),
        repository.count(filter)
    ]);
    return {
        blogs: blogs.map(formatBlogResponse),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getBlog = async id => formatBlogResponse(await repository.findActiveById(id) ||
    (() => { throw error(MESSAGES.NOT_FOUND, 404); })());

exports.updateBlog = async (id, payload, actor) => {
    const blog = await getDocument(id);
    const slug = payload.slug || (payload.title ? generateSlug(payload.title) : blog.slug);
    await ensureSlug(slug, blog._id);
    const relationData = {
        template: payload.template || blog.template,
        category: payload.category || blog.category,
        author: payload.author || blog.author,
        tags: payload.tags || blog.tags,
        relatedBlogs: payload.relatedBlogs || blog.relatedBlogs
    };
    await ensureRelations(relationData);
    const changes = await normalize({ ...payload, slug }, blog);
    delete changes.status;
    Object.assign(blog, changes, { updatedBy: actorId(actor) });
    await repository.save(blog);
    return formatBlogResponse(await repository.findActiveById(id));
};

exports.publishBlog = async (id, actor) => {
    const blog = await getDocument(id);
    if (blog.status !== BLOG_STATUS.PUBLISHED) {
        await ensureRelations(blog);
        blog.status = BLOG_STATUS.PUBLISHED;
        blog.publishedAt = new Date();
        blog.scheduledAt = null;
        blog.updatedBy = actorId(actor);
        await repository.save(blog);
        await repository.updateAssignmentCounts(blog, 1);
    }
    return formatBlogResponse(await repository.findActiveById(id));
};

exports.unpublishBlog = async (id, actor) => {
    const blog = await getDocument(id);
    if (blog.status === BLOG_STATUS.PUBLISHED) await repository.updateAssignmentCounts(blog, -1);
    blog.status = BLOG_STATUS.DRAFT;
    blog.publishedAt = null;
    blog.scheduledAt = null;
    blog.updatedBy = actorId(actor);
    await repository.save(blog);
    return formatBlogResponse(await repository.findActiveById(id));
};

exports.scheduleBlog = async (id, scheduledAt, actor) => {
    const blog = await getDocument(id);
    if (blog.status === BLOG_STATUS.PUBLISHED) await repository.updateAssignmentCounts(blog, -1);
    blog.status = BLOG_STATUS.SCHEDULED;
    blog.scheduledAt = scheduledAt;
    blog.publishedAt = null;
    blog.updatedBy = actorId(actor);
    await repository.save(blog);
    return formatBlogResponse(await repository.findActiveById(id));
};

exports.deleteBlog = async (id, actor) => {
    const blog = await getDocument(id);
    if (blog.status === BLOG_STATUS.PUBLISHED) await repository.updateAssignmentCounts(blog, -1);
    blog.isDeleted = true;
    blog.deletedAt = new Date();
    blog.status = BLOG_STATUS.ARCHIVED;
    blog.updatedBy = actorId(actor);
    await repository.save(blog);
};

exports.restoreBlog = async (id, actor) => {
    const blog = await repository.findDocumentById(id);
    if (!blog) throw error(MESSAGES.NOT_FOUND, 404);
    if (!blog.isDeleted) throw error("Blog is not deleted.", 409);
    await ensureSlug(blog.slug, blog._id);
    blog.isDeleted = false;
    blog.deletedAt = null;
    blog.status = BLOG_STATUS.DRAFT;
    blog.updatedBy = actorId(actor);
    await repository.save(blog);
    return formatBlogResponse(await repository.findActiveById(id));
};

exports.duplicateBlog = async (id, actor) => {
    const source = await getDocument(id);
    const copy = source.toObject();
    ["_id", "createdAt", "updatedAt", "__v"].forEach(field => delete copy[field]);
    copy.title = `${source.title} Copy`;
    copy.slug = `${source.slug}-copy-${Date.now()}`;
    copy.blogCode = generateBlogCode(copy.title);
    copy.status = BLOG_STATUS.DRAFT;
    copy.publishedAt = null;
    copy.scheduledAt = null;
    copy.totalViews = copy.totalLikes = copy.totalShares = copy.totalComments = 0;
    copy.createdBy = copy.updatedBy = actorId(actor);
    return formatBlogResponse(await repository.create(copy));
};

exports.getStatistics = async () => {
    const [stats] = await repository.statistics();
    return stats || { totalBlogs: 0, drafts: 0, inReview: 0, scheduled: 0, published: 0, archived: 0, totalViews: 0, totalLikes: 0 };
};

exports.uploadFeaturedImage = async (id, file, body, actor) => {
    const blog = await getDocument(id);
    if (!file) throw error("Please select an image from your device.", 400);
    if (!MIME_TYPES.IMAGE.includes(file.mimetype)) {
        throw error("The featured image must be a supported image file.", 400);
    }

    const media = await mediaService.uploadOne(file, {
        ...body,
        folder: body.folder || CLOUDINARY_FOLDERS.BLOGS,
        resourceType: "image"
    }, actor);

    try {
        blog.featuredImage = {
            url: media.secureUrl || media.url,
            alt: body.altText || media.altText || blog.title,
            caption: body.caption || media.caption || ""
        };
        blog.updatedBy = actorId(actor);
        await repository.save(blog);
    } catch (uploadError) {
        await mediaService.remove(media._id).catch(() => {});
        throw uploadError;
    }

    return {
        blog: formatBlogResponse(await repository.findActiveById(id)),
        media
    };
};
