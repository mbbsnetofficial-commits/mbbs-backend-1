const repository = require("../../repositories/blog-repositories/analytics.repositories");
const { MESSAGES } = require("../../constants/blog-constants/analytics.const");
const {
    normalizeDate,
    getRange,
    growthPercentage,
    pagination
} = require("../../utilities/analytics");

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const collect = async range => {
    const [dashboard, reviews, media, seo, traffic, counts] = await Promise.all([
        repository.dashboard(),
        repository.reviews(),
        repository.media(),
        repository.seo(),
        repository.traffic(),
        repository.growthCounts(range)
    ]);
    return {
        dashboard,
        reviews,
        searches: {
            totalSearches: 0,
            uniqueKeywords: 0,
            noResultSearches: 0,
            averageSearchTime: 0
        },
        media,
        seo,
        traffic,
        growth: {
            blogGrowth: growthPercentage(counts.blogs, counts.previousBlogs),
            reviewGrowth: growthPercentage(counts.reviews, counts.previousReviews),
            searchGrowth: 0,
            visitorGrowth: 0
        }
    };
};

exports.dashboard = async () => {
    const range = getRange(new Date(), "MONTHLY");
    return { ...(await collect(range)), period: { type: "MONTHLY", ...range } };
};

exports.generate = async ({ period, date }) => {
    const normalizedDate = normalizeDate(date, period);
    const metrics = await collect(getRange(normalizedDate, period));
    return repository.upsertSnapshot(period, normalizedDate, metrics);
};

exports.list = async query => {
    const { page, limit, skip } = pagination(query.page, query.limit);
    const filter = {};
    if (query.period) filter.period = query.period;
    if (query.from || query.to) {
        filter.date = {};
        if (query.from) filter.date.$gte = new Date(query.from);
        if (query.to) filter.date.$lte = new Date(query.to);
    }
    const [snapshots, total] = await Promise.all([
        repository.listSnapshots({ filter, skip, limit }),
        repository.countSnapshots(filter)
    ]);
    return { snapshots, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

exports.latest = async period => {
    const snapshot = await repository.latest(period);
    if (!snapshot) throw createError(MESSAGES.NOT_FOUND, 404);
    return snapshot;
};

exports.performance = limit => repository.topContent(limit);
