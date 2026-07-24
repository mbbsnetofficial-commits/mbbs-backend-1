const categoryRepository = require("../../repositories/blog-repositories/category.repositories");
const {
    CATEGORY_LEVEL,
    MESSAGES,
    SEARCH_FIELDS
} = require("../../constants/blog-constants/category.constant");
const {
    generateSlug,
    generateCategoryCode,
    buildCategoryTree,
    getPagination,
    buildSearchRegex,
    buildSortObject,
    removeDuplicateKeywords,
    formatCategoryResponse,
    getDefaultSeo
} = require("../../utilities/category");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const getActorId = actor => actor?.id || actor?._id || null;

const getParent = async (parentCategoryId, categoryId = null) => {
    if (!parentCategoryId) return null;
    if (categoryId && parentCategoryId.toString() === categoryId.toString()) {
        throw createError(MESSAGES.INVALID_PARENT, 400);
    }

    const parent = await categoryRepository.findActiveById(parentCategoryId);
    if (!parent || parent.level !== CATEGORY_LEVEL.ROOT || !parent.status) {
        throw createError(MESSAGES.INVALID_PARENT, 400);
    }
    return parent;
};

const normalizeSeo = (categoryName, seo, existingSeo = null) => {
    const base = existingSeo
        ? (typeof existingSeo.toObject === "function" ? existingSeo.toObject() : existingSeo)
        : getDefaultSeo(categoryName);
    const normalized = { ...base, ...(seo || {}) };
    normalized.keywords = removeDuplicateKeywords(normalized.keywords || []);
    return normalized;
};

const ensureUnique = async (categoryName, slug, excludeId = null) => {
    const duplicate = await categoryRepository.findDuplicate({ categoryName, slug, excludeId });
    if (!duplicate) return;
    const message = duplicate.slug === slug ? MESSAGES.SLUG_EXISTS : MESSAGES.ALREADY_EXISTS;
    throw createError(message, 409);
};

const getActiveCategory = async id => {
    const category = await categoryRepository.findActiveById(id);
    if (!category) throw createError(MESSAGES.NOT_FOUND, 404);
    return category;
};

exports.createCategory = async (payload, actor) => {
    const slug = generateSlug(payload.categoryName);
    await ensureUnique(payload.categoryName, slug);
    const parent = await getParent(payload.parentCategory);

    const data = {
        ...payload,
        slug,
        categoryCode: generateCategoryCode(payload.categoryName),
        parentCategory: parent?._id || null,
        level: parent ? CATEGORY_LEVEL.CHILD : CATEGORY_LEVEL.ROOT,
        seo: normalizeSeo(payload.categoryName, payload.seo),
        createdBy: getActorId(actor),
        updatedBy: getActorId(actor)
    };

    const category = await categoryRepository.create(data);
    return formatCategoryResponse(category);
};

exports.getAllCategories = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };

    if (query.status !== undefined) filter.status = query.status;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
    if (query.categoryType) filter.categoryType = query.categoryType;
    if (query.parentCategory === "root") filter.parentCategory = null;
    else if (query.parentCategory) filter.parentCategory = query.parentCategory;
    if (query.search) {
        const search = buildSearchRegex(query.search);
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: search }));
    }

    const [categories, total] = await Promise.all([
        categoryRepository.findAll({
            filter,
            sort: buildSortObject(query.sortBy, query.order),
            skip,
            limit
        }),
        categoryRepository.count(filter)
    ]);

    return {
        categories: categories.map(formatCategoryResponse),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getCategoryTree = async query => {
    const filter = { isDeleted: false };
    if (query.status !== undefined) filter.status = query.status;
    if (query.categoryType) filter.categoryType = query.categoryType;
    const categories = await categoryRepository.findTreeCategories(filter);
    return buildCategoryTree(categories);
};

exports.getCategoryDropdown = () => categoryRepository.findDropdownCategories({
    isDeleted: false,
    status: true
});

exports.getCategoryById = async id => formatCategoryResponse(await getActiveCategory(id));

exports.updateCategory = async (id, payload, actor) => {
    const category = await getActiveCategory(id);
    const nextName = payload.categoryName || category.categoryName;
    const nextSlug = payload.categoryName ? generateSlug(payload.categoryName) : category.slug;
    await ensureUnique(nextName, nextSlug, category._id);

    if (payload.parentCategory !== undefined) {
        const parent = await getParent(payload.parentCategory, category._id);
        category.parentCategory = parent?._id || null;
        category.level = parent ? CATEGORY_LEVEL.CHILD : CATEGORY_LEVEL.ROOT;
    }

    const updates = { ...payload };
    delete updates.parentCategory;
    delete updates.seo;
    Object.assign(category, updates);
    category.categoryName = nextName;
    category.slug = nextSlug;
    if (payload.seo !== undefined || payload.categoryName) {
        category.seo = normalizeSeo(nextName, payload.seo, category.seo);
    }
    category.updatedBy = getActorId(actor);
    await categoryRepository.save(category);
    return formatCategoryResponse(category);
};

exports.changeCategoryStatus = async (id, status, actor) => {
    const category = await getActiveCategory(id);
    category.status = status;
    category.updatedBy = getActorId(actor);
    await categoryRepository.save(category);
    return formatCategoryResponse(category);
};

exports.deleteCategory = async (id, actor) => {
    const category = await getActiveCategory(id);
    if (await categoryRepository.countChildren(category._id)) {
        throw createError(MESSAGES.CANNOT_DELETE_PARENT, 409);
    }
    if (category.totalBlogs > 0) {
        throw createError(MESSAGES.CANNOT_DELETE_BLOG_CATEGORY, 409);
    }
    category.isDeleted = true;
    category.deletedAt = new Date();
    category.status = false;
    category.updatedBy = getActorId(actor);
    await categoryRepository.save(category);
};

exports.restoreCategory = async (id, actor) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw createError(MESSAGES.NOT_FOUND, 404);
    if (!category.isDeleted) throw createError("Category is not deleted.", 409);

    if (category.parentCategory) await getParent(category.parentCategory, category._id);
    await ensureUnique(category.categoryName, category.slug, category._id);
    category.isDeleted = false;
    category.deletedAt = null;
    category.status = true;
    category.updatedBy = getActorId(actor);
    await categoryRepository.save(category);
    return formatCategoryResponse(category);
};
