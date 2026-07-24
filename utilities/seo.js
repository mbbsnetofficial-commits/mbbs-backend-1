const generateSlug = value => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getPagination = (page = 1, limit = 20) => {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 20);
    return {
        page: normalizedPage,
        limit: normalizedLimit,
        skip: (normalizedPage - 1) * normalizedLimit
    };
};

const buildSort = (sortBy = "createdAt", sortOrder = "desc") => ({
    [sortBy]: sortOrder === "asc" ? 1 : -1
});

const escapeRegex = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const uniqueStrings = values => [...new Set((values || []).map(value => value.trim()).filter(Boolean))];

module.exports = { generateSlug, getPagination, buildSort, escapeRegex, uniqueStrings };
