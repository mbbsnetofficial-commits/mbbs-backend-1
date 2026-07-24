const repository = require("../../repositories/blog-repositories/search.repositories");
const { SEARCH_MODULES, MESSAGES } = require("../../constants/blog-constants/search.const");
const {
    buildRegex,
    buildPagination,
    formatSearchResult,
    groupResults
} = require("../../utilities/search");

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const supported = repository.supportedModules();

const sortResults = (results, sortBy, sortOrder) => {
    const direction = sortOrder === "asc" ? 1 : -1;
    const value = (item, field) => {
        if (field === "relevance") return item.score || 0;
        if (field === "title" || field === "name") return item.title || "";
        if (field === "rating") return item.rating || 0;
        if (field === "popularity") return item.popularity || 0;
        return item[field] || "";
    };
    return results.sort((a, b) => {
        const left = value(a, sortBy);
        const right = value(b, sortBy);
        if (typeof left === "string") return left.localeCompare(right) * direction;
        return (left - right) * direction;
    });
};

const modulesFor = module =>
    !module || module === SEARCH_MODULES.GLOBAL ? supported : [module];

const execute = async payload => {
    const modules = modulesFor(payload.module);
    const unsupported = modules.filter(module => !supported.includes(module));
    if (unsupported.length) {
        throw createError(`Search is not available for: ${unsupported.join(", ")}.`, 400);
    }
    const regex = buildRegex(payload.keyword);
    const filtersFor = module => {
        const filters = {};
        if (module === "BLOG") {
            if (payload.category) filters.category = payload.category;
            if (payload.author) filters.author = payload.author;
            if (payload.tag) filters.tags = payload.tag;
        }
        if (module === "REVIEW" && payload.rating) filters.rating = payload.rating;
        return filters;
    };
    const collections = await Promise.all(modules.map(async module => {
        const rows = await repository.search(module, regex, filtersFor(module));
        return rows.map(row => formatSearchResult(row, module, payload.keyword));
    }));
    const ranked = sortResults(collections.flat(), payload.sortBy, payload.sortOrder);
    const { page, limit, skip } = buildPagination(payload.page, payload.limit);
    const results = ranked.slice(skip, skip + limit);
    return {
        keyword: payload.keyword,
        total: ranked.length,
        results,
        grouped: groupResults(results),
        pagination: { page, limit, total: ranked.length, totalPages: Math.ceil(ranked.length / limit) }
    };
};

exports.globalSearch = payload => execute({ ...payload, module: SEARCH_MODULES.GLOBAL });
exports.moduleSearch = payload => execute(payload);
exports.advancedSearch = payload => execute(payload);

exports.suggestions = async ({ keyword, limit }) => {
    const regex = buildRegex(keyword);
    const modules = ["BLOG", "CATEGORY", "TAG", "AUTHOR"];
    const collections = await Promise.all(modules.map(async module =>
        (await repository.search(module, regex, {}, limit))
            .map(row => formatSearchResult(row, module, keyword))
    ));
    const unique = new Map();
    sortResults(collections.flat(), "relevance", "desc").forEach(item => {
        const key = `${item.module}:${item.title.toLowerCase()}`;
        if (!unique.has(key)) unique.set(key, item);
    });
    return [...unique.values()].slice(0, limit);
};

exports.messages = MESSAGES;
