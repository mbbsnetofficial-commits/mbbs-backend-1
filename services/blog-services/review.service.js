const repository = require("../../repositories/blog-repositories/review.repositories");
const { REVIEW_STATUS, MESSAGES, SEARCH_FIELDS } = require("../../constants/blog-constants/review.const");
const {
    generateSlug,
    buildPagination,
    buildSort,
    escapeRegex,
    formatReview
} = require("../../utilities/review");

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const actorId = actor => actor?.id || actor?._id || null;

const getActive = async id => {
    const review = await repository.findActiveById(id);
    if (!review) throw createError(MESSAGES.REVIEW_NOT_FOUND, 404);
    return review;
};
const validateRelations = async payload => {
    if (!await repository.referenceExists(payload.reviewType, payload.referenceId)) {
        throw createError(`The referenced ${payload.reviewType.toLowerCase()} record does not exist.`, 400);
    }
    if (!await repository.mediaExist(payload.media)) {
        throw createError("One or more review media records do not exist.", 400);
    }
};

exports.create = async (payload, student) => {
    const studentId = actorId(student);
    if (await repository.findDuplicate(studentId, payload.reviewType, payload.referenceId)) {
        throw createError(MESSAGES.DUPLICATE_REVIEW, 409);
    }
    await validateRelations(payload);
    const review = await repository.create({
        ...payload,
        studentId,
        slug: `${generateSlug(payload.title)}-${Date.now()}`,
        status: REVIEW_STATUS.PENDING,
        isFeatured: false,
        isVerified: false
    });
    return formatReview(review);
};

const list = async (query, baseFilter = {}) => {
    const { page, limit, skip } = buildPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    ["reviewType", "referenceId", "status", "rating", "isFeatured", "isVerified"]
        .forEach(field => { if (query[field] !== undefined) filter[field] = query[field]; });
    if (query.search) {
        const regex = new RegExp(escapeRegex(query.search), "i");
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: regex }));
    }
    Object.assign(filter, baseFilter);
    const [reviews, total] = await Promise.all([
        repository.findAll({ filter, sort: buildSort(query.sortBy, query.sortOrder), skip, limit }),
        repository.count(filter)
    ]);
    return {
        reviews: reviews.map(formatReview),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.listAdmin = query => list(query);
exports.listMine = (query, student) => list(query, { studentId: actorId(student) });
exports.listApprovedByReference = (params, query) =>
    list(query, { reviewType: params.reviewType, referenceId: params.referenceId, status: REVIEW_STATUS.APPROVED });
exports.listFeatured = query => list(query, { status: REVIEW_STATUS.APPROVED, isFeatured: true });
exports.getById = async id => formatReview(await getActive(id));

exports.updateMine = async (id, payload, student) => {
    const review = await repository.findActiveById(id);
    if (!review) throw createError(MESSAGES.REVIEW_NOT_FOUND, 404);
    if (String(review.studentId) !== String(actorId(student))) throw createError("You cannot update this review.", 403);
    if (review.status === REVIEW_STATUS.APPROVED) {
        throw createError("Approved reviews cannot be edited. Contact an administrator.", 409);
    }
    if (payload.media && !await repository.mediaExist(payload.media)) {
        throw createError("One or more review media records do not exist.", 400);
    }
    Object.assign(review, payload, { status: REVIEW_STATUS.PENDING });
    await repository.save(review);
    return formatReview(review);
};

exports.approve = async (id, admin) => {
    const review = await getActive(id);
    review.status = REVIEW_STATUS.APPROVED;
    review.approvedBy = actorId(admin);
    review.approvedAt = new Date();
    review.rejectionReason = "";
    await repository.save(review);
    return formatReview(review);
};
exports.reject = async (id, reason) => {
    const review = await getActive(id);
    review.status = REVIEW_STATUS.REJECTED;
    review.rejectionReason = reason;
    review.approvedAt = null;
    await repository.save(review);
    return formatReview(review);
};
exports.setFeatured = async (id, value) => {
    const review = await getActive(id);
    if (value && review.status !== REVIEW_STATUS.APPROVED) {
        throw createError("Only approved reviews can be featured.", 409);
    }
    review.isFeatured = value;
    review.featuredAt = value ? new Date() : null;
    await repository.save(review);
    return formatReview(review);
};
exports.setVerified = async (id, value) => {
    const review = await getActive(id);
    review.isVerified = value;
    review.verifiedAt = value ? new Date() : null;
    await repository.save(review);
    return formatReview(review);
};
exports.remove = async id => {
    const review = await getActive(id);
    review.isDeleted = true;
    review.deletedAt = new Date();
    review.isFeatured = false;
    await repository.save(review);
};
exports.restore = async id => {
    const review = await repository.findDocumentById(id);
    if (!review) throw createError(MESSAGES.REVIEW_NOT_FOUND, 404);
    if (!review.isDeleted) throw createError("Review is not deleted.", 409);
    if (review.studentId && await repository.findDuplicate(review.studentId, review.reviewType, review.referenceId, review._id)) {
        throw createError(MESSAGES.DUPLICATE_REVIEW, 409);
    }
    review.isDeleted = false;
    review.deletedAt = null;
    review.status = REVIEW_STATUS.PENDING;
    await repository.save(review);
    return formatReview(review);
};
exports.statistics = async () => {
    const [stats] = await repository.statistics();
    return stats || { totalReviews: 0, pending: 0, approved: 0, rejected: 0, spam: 0, averageRating: 0 };
};
