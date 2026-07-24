const templateRepository = require("../../repositories/blog-repositories/template-repositories");
const {
    generateTemplateCode,
    generateNextVersion,
    sortPreviewImages,
    removeDuplicateSections,
    formatTemplateResponse,
    generateSearchRegex,
    getPagination,
    buildSortObject,
    getDefaultSections
} = require("../../utilities/template");

const createError = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const getActorId = actor => actor?.id || actor?._id || null;

const normalizeTemplateData = (data, useDefaultSections = false) => {
    const normalized = { ...data };

    if (normalized.previewImages !== undefined) {
        normalized.previewImages = sortPreviewImages(normalized.previewImages);
    }

    if (normalized.allowedSections !== undefined) {
        normalized.allowedSections = removeDuplicateSections(normalized.allowedSections);
    } else if (useDefaultSections) {
        normalized.allowedSections = getDefaultSections();
    }

    return normalized;
};

const findActiveTemplate = async id => {
    const template = await templateRepository.findActiveById(id);
    if (!template) throw createError("Template not found.", 404);
    return template;
};

exports.createTemplate = async (payload, actor) => {
    const data = normalizeTemplateData(payload, true);
    data.templateCode = generateTemplateCode(data.templateName);
    data.createdBy = getActorId(actor);
    data.updatedBy = getActorId(actor);

    if (data.isDefault) {
        await templateRepository.clearDefaultTemplates();
    }

    const template = await templateRepository.create(data);
    return formatTemplateResponse(template);
};

exports.getAllTemplates = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };

    if (query.status !== undefined) filter.status = query.status;
    if (query.search) {
        const search = generateSearchRegex(query.search);
        filter.$or = [
            { templateName: search },
            { templateCode: search },
            { description: search }
        ];
    }

    const [templates, total] = await Promise.all([
        templateRepository.findAll({
            filter,
            sort: buildSortObject(query.sortBy, query.order),
            skip,
            limit
        }),
        templateRepository.count(filter)
    ]);

    return {
        templates: templates.map(formatTemplateResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

exports.getTemplateById = async id => {
    const template = await findActiveTemplate(id);
    return formatTemplateResponse(template);
};

exports.updateTemplate = async (id, payload, actor) => {
    const template = await findActiveTemplate(id);
    const updates = normalizeTemplateData(payload);

    if (updates.isDefault) {
        await templateRepository.clearDefaultTemplates(template._id);
    }

    Object.assign(template, updates);
    template.version = generateNextVersion(template.version);
    template.updatedBy = getActorId(actor);
    await templateRepository.save(template);

    return formatTemplateResponse(template);
};

exports.changeTemplateStatus = async (id, status, actor) => {
    const template = await findActiveTemplate(id);
    template.status = status;
    template.version = generateNextVersion(template.version);
    template.updatedBy = getActorId(actor);
    await templateRepository.save(template);
    return formatTemplateResponse(template);
};

exports.deleteTemplate = async (id, actor) => {
    const template = await findActiveTemplate(id);
    template.isDeleted = true;
    template.deletedAt = new Date();
    template.status = false;
    template.isDefault = false;
    template.updatedBy = getActorId(actor);
    await templateRepository.save(template);
};
