const authorRepository = require("../../repositories/blog-repositories/aurthor.repositories");
const {
    MESSAGES,
    SEARCH_FIELDS,
    FEATURED_LIMIT
} = require("../../constants/blog-constants/aurthor.const");
const {
    generateSlug,
    generateAuthorCode,
    buildSearchRegex,
    getPagination,
    buildSortObject,
    removeDuplicates,
    getDefaultSeo,
    formatAuthorResponse
} = require("../../utilities/aurthor");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const getActorId = actor => actor?.id || actor?._id || null;

const normalizeArrays = payload => {
    ["qualifications", "specializations", "languages"].forEach(field => {
        if (payload[field]) payload[field] = removeDuplicates(payload[field]);
    });
    if (payload.seo?.keywords) payload.seo.keywords = removeDuplicates(payload.seo.keywords);
    return payload;
};

const ensureUnique = async (email, slug, excludeId = null) => {
    const duplicate = await authorRepository.findDuplicate({ email, slug, excludeId });
    if (!duplicate) return;
    throw createError(duplicate.email === email ? MESSAGES.EMAIL_EXISTS : MESSAGES.SLUG_EXISTS, 409);
};

const getExisting = async id => {
    const author = await authorRepository.findActiveById(id);
    if (!author) throw createError(MESSAGES.NOT_FOUND, 404);
    return author;
};

exports.createAuthor = async (payload, actor) => {
    const slug = payload.slug || generateSlug(payload.fullName);
    await ensureUnique(payload.email, slug);
    const data = normalizeArrays({
        ...payload,
        slug,
        authorCode: generateAuthorCode(payload.fullName),
        seo: { ...getDefaultSeo(payload.fullName), ...(payload.seo || {}) },
        createdBy: getActorId(actor),
        updatedBy: getActorId(actor)
    });
    return formatAuthorResponse(await authorRepository.create(data));
};

exports.getAuthors = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    if (query.status !== undefined) filter.status = query.status;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
    if (query.authorType) filter.authorType = query.authorType;
    if (query.search) {
        const search = buildSearchRegex(query.search);
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: search }));
    }
    const [authors, total] = await Promise.all([
        authorRepository.findAll({
            filter,
            sort: buildSortObject(query.sortBy, query.sortOrder),
            skip,
            limit
        }),
        authorRepository.count(filter)
    ]);
    return {
        authors: authors.map(formatAuthorResponse),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getAuthorById = async id => formatAuthorResponse(await getExisting(id));
exports.getDropdown = () => authorRepository.findDropdown();

exports.getFeatured = async () =>
    (await authorRepository.findFeatured(FEATURED_LIMIT)).map(formatAuthorResponse);

exports.getStatistics = async () => {
    const [statistics] = await authorRepository.getStatistics();
    return statistics || {
        totalAuthors: 0,
        activeAuthors: 0,
        inactiveAuthors: 0,
        featuredAuthors: 0,
        totalBlogs: 0,
        totalViews: 0
    };
};

exports.updateAuthor = async (id, payload, actor) => {
    const author = await getExisting(id);
    const email = payload.email || author.email;
    const slug = payload.slug || (payload.fullName ? generateSlug(payload.fullName) : author.slug);
    await ensureUnique(email, slug, author._id);

    const updates = normalizeArrays({ ...payload });
    Object.assign(author, updates, {
        email,
        slug,
        updatedBy: getActorId(actor)
    });
    if (payload.fullName && !payload.seo?.metaTitle) {
        author.seo.metaTitle = `${payload.fullName} | MBBS.NET`;
    }
    await authorRepository.save(author);
    return formatAuthorResponse(author);
};

exports.changeStatus = async (id, status, actor) => {
    const author = await getExisting(id);
    author.status = status;
    author.updatedBy = getActorId(actor);
    await authorRepository.save(author);
    return formatAuthorResponse(author);
};

exports.deleteAuthor = async (id, actor) => {
    const author = await getExisting(id);
    author.isDeleted = true;
    author.deletedAt = new Date();
    author.status = false;
    author.updatedBy = getActorId(actor);
    await authorRepository.save(author);
};

exports.restoreAuthor = async (id, actor) => {
    const author = await authorRepository.findById(id);
    if (!author) throw createError(MESSAGES.NOT_FOUND, 404);
    if (!author.isDeleted) throw createError("Author is not deleted.", 409);
    await ensureUnique(author.email, author.slug, author._id);
    author.isDeleted = false;
    author.deletedAt = null;
    author.status = true;
    author.updatedBy = getActorId(actor);
    await authorRepository.save(author);
    return formatAuthorResponse(author);
};
