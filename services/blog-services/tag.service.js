const tagRepository = require("../../repositories/blog-repositories/tag.repositories");
const { MESSAGES, SEARCH_FIELDS } = require("../../constants/blog-constants/tag.const");
const {
    generateSlug,
    generateTagCode,
    buildSearchRegex,
    getPagination,
    buildSortObject,
    removeDuplicateKeywords,
    getDefaultSeo,
    formatTagResponse
} = require("../../utilities/tag");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const getActorId = actor => actor?.id || actor?._id || null;

const normalizeSeo = (tagName, seo, existingSeo = null) => {
    const base = existingSeo
        ? (typeof existingSeo.toObject === "function" ? existingSeo.toObject() : existingSeo)
        : getDefaultSeo(tagName);
    const normalized = { ...base, ...(seo || {}) };
    normalized.keywords = removeDuplicateKeywords(normalized.keywords || []);
    return normalized;
};

const ensureUnique = async (tagName, slug, excludeId = null) => {
    const duplicate = await tagRepository.findDuplicate({ tagName, slug, excludeId });
    if (!duplicate) return;
    throw createError(duplicate.slug === slug ? MESSAGES.SLUG_EXISTS : MESSAGES.ALREADY_EXISTS, 409);
};

const getActiveTag = async id => {
    const tag = await tagRepository.findActiveById(id);
    if (!tag) throw createError(MESSAGES.NOT_FOUND, 404);
    return tag;
};

exports.createTag = async (payload, actor) => {
    const slug = payload.slug || generateSlug(payload.tagName);
    await ensureUnique(payload.tagName, slug);
    const data = {
        ...payload,
        slug,
        tagCode: generateTagCode(payload.tagName),
        seo: normalizeSeo(payload.tagName, payload.seo),
        createdBy: getActorId(actor),
        updatedBy: getActorId(actor)
    };
    const tag = await tagRepository.create(data);
    return formatTagResponse(tag);
};

exports.getAllTags = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    if (query.status !== undefined) filter.status = query.status;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
    if (query.tagType) filter.tagType = query.tagType;
    if (query.search) {
        const search = buildSearchRegex(query.search);
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: search }));
    }
    const [tags, total] = await Promise.all([
        tagRepository.findAll({ filter, sort: buildSortObject(query.sortBy, query.order), skip, limit }),
        tagRepository.count(filter)
    ]);
    return {
        tags: tags.map(formatTagResponse),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getTagDropdown = () => tagRepository.findDropdown({ isDeleted: false, status: true });

exports.getPopularTags = async query => {
    const filter = { isDeleted: false, status: true };
    if (query.tagType) filter.tagType = query.tagType;
    const tags = await tagRepository.findPopular(filter, query.limit);
    return tags.map(formatTagResponse);
};

exports.getTagStatistics = async () => {
    const [statistics] = await tagRepository.getStatistics();
    return statistics || {
        totalTags: 0,
        activeTags: 0,
        inactiveTags: 0,
        featuredTags: 0,
        totalBlogAssignments: 0,
        totalViews: 0
    };
};

exports.getTagById = async id => formatTagResponse(await getActiveTag(id));

exports.updateTag = async (id, payload, actor) => {
    const tag = await getActiveTag(id);
    const nextName = payload.tagName || tag.tagName;
    const nextSlug = payload.slug || (payload.tagName ? generateSlug(payload.tagName) : tag.slug);
    await ensureUnique(nextName, nextSlug, tag._id);

    const updates = { ...payload };
    delete updates.seo;
    Object.assign(tag, updates);
    tag.tagName = nextName;
    tag.slug = nextSlug;
    if (payload.seo !== undefined || payload.tagName) {
        tag.seo = normalizeSeo(nextName, payload.seo, tag.seo);
    }
    tag.updatedBy = getActorId(actor);
    await tagRepository.save(tag);
    return formatTagResponse(tag);
};

exports.changeTagStatus = async (id, status, actor) => {
    const tag = await getActiveTag(id);
    tag.status = status;
    tag.updatedBy = getActorId(actor);
    await tagRepository.save(tag);
    return formatTagResponse(tag);
};

exports.deleteTag = async (id, actor) => {
    const tag = await getActiveTag(id);
    if (tag.totalBlogs > 0) throw createError(MESSAGES.CANNOT_DELETE_ASSIGNED, 409);
    tag.isDeleted = true;
    tag.deletedAt = new Date();
    tag.status = false;
    tag.updatedBy = getActorId(actor);
    await tagRepository.save(tag);
};

exports.restoreTag = async (id, actor) => {
    const tag = await tagRepository.findById(id);
    if (!tag) throw createError(MESSAGES.NOT_FOUND, 404);
    if (!tag.isDeleted) throw createError("Tag is not deleted.", 409);
    await ensureUnique(tag.tagName, tag.slug, tag._id);
    tag.isDeleted = false;
    tag.deletedAt = null;
    tag.status = true;
    tag.updatedBy = getActorId(actor);
    await tagRepository.save(tag);
    return formatTagResponse(tag);
};
