const normalizeDate = (date, period) => {
    const value = new Date(date || Date.now());
    value.setUTCHours(0, 0, 0, 0);
    if (period === "WEEKLY") value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
    if (period === "MONTHLY") value.setUTCDate(1);
    if (period === "YEARLY") {
        value.setUTCMonth(0, 1);
    }
    return value;
};

const getRange = (date, period) => {
    const start = normalizeDate(date, period);
    const end = new Date(start);
    if (period === "DAILY") end.setUTCDate(end.getUTCDate() + 1);
    if (period === "WEEKLY") end.setUTCDate(end.getUTCDate() + 7);
    if (period === "MONTHLY") end.setUTCMonth(end.getUTCMonth() + 1);
    if (period === "YEARLY") end.setUTCFullYear(end.getUTCFullYear() + 1);
    const previousStart = new Date(start);
    if (period === "DAILY") previousStart.setUTCDate(previousStart.getUTCDate() - 1);
    if (period === "WEEKLY") previousStart.setUTCDate(previousStart.getUTCDate() - 7);
    if (period === "MONTHLY") previousStart.setUTCMonth(previousStart.getUTCMonth() - 1);
    if (period === "YEARLY") previousStart.setUTCFullYear(previousStart.getUTCFullYear() - 1);
    return { start, end, previousStart };
};

const growthPercentage = (current, previous) => {
    if (!previous) return current ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
};

const pagination = (page = 1, limit = 20) => {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Number(limit) || 20);
    return { page: normalizedPage, limit: normalizedLimit, skip: (normalizedPage - 1) * normalizedLimit };
};

module.exports = { normalizeDate, getRange, growthPercentage, pagination };
