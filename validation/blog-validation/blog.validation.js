const Joi = require("joi");
const {
    BLOG_STATUS,
    BLOG_VISIBILITY,
    BLOG_TYPES,
    LIMITS,
    SORT_FIELDS,
    SORT_ORDER
} = require("../../constants/blog-constants/blog.const");

const objectId = Joi.string().length(24).hex();
const text = max => Joi.string().trim().allow("").max(max);
const image = Joi.object({
    url: Joi.string().trim().required(),
    alt: text(250),
    caption: text(500)
});
const socialImage = Joi.object({ url: Joi.string().trim().required(), alt: text(250) });
const video = Joi.object({ title: Joi.string().trim().required(), url: Joi.string().trim().required() });
const faq = Joi.object({
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required()
});
const seo = Joi.object({
    metaTitle: text(250),
    metaDescription: text(500),
    keywords: Joi.array().items(Joi.string().trim().min(1)).unique(),
    canonicalUrl: text(1000),
    robots: Joi.string().trim().valid("index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow")
});

const fields = {
    title: Joi.string().trim().min(LIMITS.TITLE_MIN).max(LIMITS.TITLE_MAX),
    slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    shortDescription: text(LIMITS.SHORT_DESCRIPTION_MAX),
    excerpt: text(LIMITS.EXCERPT_MAX),
    content: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string().min(1)),
    blogType: Joi.string().valid(...Object.values(BLOG_TYPES)),
    template: objectId,
    category: objectId,
    tags: Joi.array().items(objectId).max(LIMITS.MAX_TAGS).unique(),
    author: objectId,
    featuredImage: image,
    gallery: Joi.array().items(socialImage).max(LIMITS.MAX_GALLERY_IMAGES),
    videos: Joi.array().items(video).max(LIMITS.MAX_VIDEOS),
    status: Joi.string().valid(...Object.values(BLOG_STATUS)),
    visibility: Joi.string().valid(...Object.values(BLOG_VISIBILITY)),
    password: Joi.string().allow("").max(200),
    publishedAt: Joi.date().iso(),
    scheduledAt: Joi.date().iso().greater("now"),
    isFeatured: Joi.boolean(),
    isTrending: Joi.boolean(),
    isPinned: Joi.boolean(),
    seo,
    faqs: Joi.array().items(faq).max(LIMITS.MAX_FAQS),
    relatedBlogs: Joi.array().items(objectId).max(LIMITS.MAX_RELATED_BLOGS).unique(),
    metadata: Joi.object()
};

const createBlogSchema = Joi.object({
    ...fields,
    title: fields.title.required(),
    content: fields.content.required(),
    template: fields.template.required(),
    category: fields.category.required(),
    author: fields.author.required()
});

const updateBlogSchema = Joi.object(fields).min(1);
const blogIdSchema = Joi.object({ id: objectId.required() });
const listBlogsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(LIMITS.MAX_PAGE_LIMIT).default(LIMITS.PAGE_LIMIT),
    search: Joi.string().trim().allow(""),
    status: Joi.string().valid(...Object.values(BLOG_STATUS)),
    visibility: Joi.string().valid(...Object.values(BLOG_VISIBILITY)),
    blogType: Joi.string().valid(...Object.values(BLOG_TYPES)),
    category: objectId,
    author: objectId,
    tag: objectId,
    isFeatured: Joi.boolean(),
    isTrending: Joi.boolean(),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.CREATED_AT),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC)
});
const scheduleBlogSchema = Joi.object({ scheduledAt: Joi.date().iso().greater("now").required() });

module.exports = {
    createBlogSchema,
    updateBlogSchema,
    blogIdSchema,
    listBlogsSchema,
    scheduleBlogSchema
};
