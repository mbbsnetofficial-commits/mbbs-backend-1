const escapeRegex = (keyword = "") => String(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildRegex = keyword => new RegExp(escapeRegex(keyword.trim()), "i");
const removeHtml = text => String(text || "").replace(/<[^>]*>/g, "");
const generateSnippet = (text, keyword, length = 180) => {
    const clean = removeHtml(typeof text === "string" ? text : JSON.stringify(text || ""));
    const index = clean.toLowerCase().indexOf(keyword.toLowerCase());
    const start = index < 0 ? 0 : Math.max(0, index - 50);
    const snippet = clean.slice(start, start + length);
    return snippet.length < clean.length ? `${snippet}...` : snippet;
};
const buildPagination = (page = 1, limit = 10) => {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 10);
    return { page: normalizedPage, limit: normalizedLimit, skip: (normalizedPage - 1) * normalizedLimit };
};
const calculateScore = (values, keyword) => {
    const needle = keyword.toLowerCase();
    return values.reduce((score, value) => {
        const text = String(value || "").toLowerCase();
        if (text === needle) return score + 20;
        if (text.startsWith(needle)) return score + 10;
        if (text.includes(needle)) return score + 5;
        return score;
    }, 0);
};
const resultFields = {
    BLOG: item => [item.title, item.slug, item.excerpt, item.shortDescription],
    CATEGORY: item => [item.categoryName, item.slug, item.description],
    TAG: item => [item.tagName, item.slug, item.description],
    AUTHOR: item => [item.fullName, item.slug, item.bio, item.designation],
    REVIEW: item => [item.title, item.review, item.reviewerName],
    SEO: item => [item.metaTitle, item.metaDescription, item.slug],
    MEDIA: item => [item.displayName, item.originalName, item.altText, item.caption]
};
const formatSearchResult = (item, module, keyword) => {
    const values = resultFields[module]?.(item) || [];
    return {
        id: item._id,
        module,
        title: item.title || item.categoryName || item.tagName || item.fullName ||
            item.metaTitle || item.displayName || item.originalName || "",
        slug: item.slug || "",
        description: generateSnippet(
            item.excerpt || item.shortDescription || item.description || item.bio ||
            item.review || item.metaDescription || item.caption || "",
            keyword
        ),
        image: item.featuredImage?.url || item.profileImage || item.secureUrl || "",
        rating: item.rating,
        createdAt: item.createdAt,
        score: calculateScore(values, keyword)
    };
};
const groupResults = results => results.reduce((groups, item) => {
    (groups[item.module] ||= []).push(item);
    return groups;
}, {});

module.exports = {
    escapeRegex,
    buildRegex,
    removeHtml,
    generateSnippet,
    buildPagination,
    calculateScore,
    formatSearchResult,
    groupResults
};
