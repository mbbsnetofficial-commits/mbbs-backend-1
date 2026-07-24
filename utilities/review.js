const generateSlug = value => String(value || "").trim().toLowerCase()
    .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const generateShortReview = (review, length = 120) =>
    review?.length > length ? `${review.substring(0, length)}...` : (review || "");
const generateStars = rating => "⭐".repeat(rating);
const buildPagination = (page = 1, limit = 10) => {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 10);
    return { page: normalizedPage, limit: normalizedLimit, skip: (normalizedPage - 1) * normalizedLimit };
};
const buildSort = (field = "createdAt", order = "desc") => ({ [field]: order === "asc" ? 1 : -1 });
const escapeRegex = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const formatReview = review => {
    const value = review?.toObject ? review.toObject() : review;
    return value ? {
        ...value,
        id: value._id,
        shortReview: generateShortReview(value.review),
        stars: generateStars(value.rating)
    } : null;
};

module.exports = {
    generateSlug,
    generateShortReview,
    generateStars,
    buildPagination,
    buildSort,
    escapeRegex,
    formatReview
};
