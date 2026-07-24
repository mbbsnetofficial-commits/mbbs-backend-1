const repository = require("../../repositories/blog-repositories/seo.repositories");
const { MESSAGES, SEARCH_FIELDS } = require("../../constants/blog-constants/seo.const");
const { getPagination, buildSort, escapeRegex, uniqueStrings } = require("../../utilities/seo");

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const ensureUnique = async (slug, module, referenceId, excludeId = null) => {
    const [slugMatch, moduleMatch] = await Promise.all([
        repository.findBySlug(slug, excludeId),
        repository.findByModule(module, referenceId, excludeId)
    ]);
    if (slugMatch) throw createError(MESSAGES.DUPLICATE_SLUG, 409);
    if (moduleMatch) throw createError("SEO already exists for this module and reference.", 409);
};

const ensureReference = async (module, referenceId) => {
    if (!await repository.referenceExists(module, referenceId)) {
        throw createError(`The referenced ${module.toLowerCase()} record does not exist.`, 400);
    }
};

const getActive = async id => {
    const seo = await repository.findActiveById(id);
    if (!seo) throw createError(MESSAGES.NOT_FOUND, 404);
    return seo;
};

exports.create = async payload => {
    await ensureUnique(payload.slug, payload.module, payload.referenceId);
    await ensureReference(payload.module, payload.referenceId);
    payload.metaKeywords = uniqueStrings(payload.metaKeywords);
    return repository.create(payload);
};

exports.list = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    if (query.module) filter.module = query.module;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.robots) filter.robots = query.robots;
    if (query.search) {
        const regex = new RegExp(escapeRegex(query.search), "i");
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: regex }));
    }
    const [records, total] = await Promise.all([
        repository.findAll({ filter, sort: buildSort(query.sortBy, query.sortOrder), skip, limit }),
        repository.count(filter)
    ]);
    return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

exports.getById = id => getActive(id);

exports.getByModule = async (module, referenceId) => {
    const seo = await repository.findByModule(module, referenceId);
    if (!seo || seo.isDeleted) throw createError(MESSAGES.NOT_FOUND, 404);
    return seo;
};

exports.update = async (id, payload) => {
    const seo = await getActive(id);
    const module = payload.module || seo.module;
    const referenceId = payload.referenceId || seo.referenceId;
    const slug = payload.slug || seo.slug;
    await ensureUnique(slug, module, referenceId, seo._id);
    await ensureReference(module, referenceId);
    if (payload.metaKeywords) payload.metaKeywords = uniqueStrings(payload.metaKeywords);
    Object.assign(seo, payload);
    return repository.save(seo);
};

exports.remove = async id => {
    const seo = await getActive(id);
    seo.isDeleted = true;
    seo.deletedAt = new Date();
    seo.isActive = false;
    await repository.save(seo);
};

exports.restore = async id => {
    const seo = await repository.findById(id);
    if (!seo) throw createError(MESSAGES.NOT_FOUND, 404);
    if (!seo.isDeleted) throw createError("SEO record is not deleted.", 409);
    await ensureUnique(seo.slug, seo.module, seo.referenceId, seo._id);
    await ensureReference(seo.module, seo.referenceId);
    seo.isDeleted = false;
    seo.deletedAt = null;
    seo.isActive = true;
    return repository.save(seo);
};

exports.statistics = async () => {
    const rows = await repository.statistics();
    return {
        total: rows.reduce((sum, row) => sum + row.total, 0),
        modules: rows.map(row => ({ module: row._id, total: row.total, active: row.active }))
    };
};
