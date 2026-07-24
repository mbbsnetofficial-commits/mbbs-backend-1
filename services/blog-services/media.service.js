const repository = require("../../repositories/blog-repositories/media.repositories");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utilities/cloudinary");
const { getExtension, getReadableSize } = require("../../utilities/files");
const { getPagination, buildSort } = require("../../utilities/media");
const {
    RESOURCE_TYPES,
    MIME_TYPES,
    MEDIA_STATUS,
    MESSAGES,
    SEARCH_FIELDS
} = require("../../constants/blog-constants/media.const");

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const actorId = actor => actor?.id || actor?._id || null;
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseTags = tags => {
    if (!tags) return [];
    if (Array.isArray(tags)) return [...new Set(tags.map(String).map(value => value.trim()).filter(Boolean))];
    try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parseTags(parsed);
    } catch (_error) {
        // Comma-separated multipart values are supported as a convenience.
    }
    return [...new Set(String(tags).split(",").map(value => value.trim()).filter(Boolean))];
};

const resourceTypeFor = file => {
    if (MIME_TYPES.IMAGE.includes(file.mimetype)) return RESOURCE_TYPES.IMAGE;
    if (MIME_TYPES.VIDEO.includes(file.mimetype)) return RESOURCE_TYPES.VIDEO;
    return RESOURCE_TYPES.RAW;
};

const mapUpload = (file, result, body, actor) => {
    const format = result.format || getExtension(file.originalname);
    return {
        originalName: file.originalname,
        displayName: body.displayName || file.originalname,
        fileName: `${result.public_id.split("/").pop()}.${format}`,
        publicId: result.public_id,
        assetId: result.asset_id,
        version: result.version,
        url: result.url,
        secureUrl: result.secure_url,
        folder: result.folder || body.folder,
        format,
        extension: getExtension(file.originalname) || format,
        mimeType: file.mimetype,
        resourceType: result.resource_type || resourceTypeFor(file),
        width: result.width || 0,
        height: result.height || 0,
        duration: result.duration || 0,
        bytes: result.bytes || file.size,
        readableSize: getReadableSize(result.bytes || file.size),
        altText: body.altText || "",
        caption: body.caption || "",
        tags: parseTags(body.tags),
        uploadedBy: actorId(actor)
    };
};

const getActive = async id => {
    const media = await repository.findActiveById(id);
    if (!media) throw createError(MESSAGES.NOT_FOUND, 404);
    return media;
};

exports.uploadOne = async (file, body, actor) => {
    if (!file) throw createError("Please upload a file.", 400);
    const result = await uploadToCloudinary(file, body.folder, resourceTypeFor(file));
    try {
        return await repository.create(mapUpload(file, result, body, actor));
    } catch (error) {
        await deleteFromCloudinary(result.public_id, result.resource_type).catch(() => {});
        throw error;
    }
};

exports.uploadMany = async (files, body, actor) => {
    if (!files?.length) throw createError("Please upload at least one file.", 400);
    const uploaded = [];
    try {
        for (const file of files) {
            const result = await uploadToCloudinary(file, body.folder, resourceTypeFor(file));
            uploaded.push({ file, result });
        }
        return await repository.createMany(uploaded.map(({ file, result }) => mapUpload(file, result, body, actor)));
    } catch (error) {
        await Promise.all(uploaded.map(({ result }) =>
            deleteFromCloudinary(result.public_id, result.resource_type).catch(() => {})
        ));
        throw error;
    }
};

exports.list = async query => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const filter = { isDeleted: false };
    if (query.resourceType) filter.resourceType = query.resourceType;
    if (query.folder) filter.folder = query.folder;
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
        const regex = new RegExp(escapeRegex(query.search), "i");
        filter.$or = SEARCH_FIELDS.map(field => ({ [field]: regex }));
    }
    const [media, total] = await Promise.all([
        repository.findAll({ filter, sort: buildSort(query.sortBy, query.sortOrder), skip, limit }),
        repository.count(filter)
    ]);
    return { media, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

exports.getOne = id => getActive(id);

exports.update = async (id, body) => {
    const media = await getActive(id);
    Object.assign(media, body);
    await repository.save(media);
    return media;
};

exports.replace = async (id, file, body) => {
    if (!file) throw createError("Please upload a replacement file.", 400);
    const media = await getActive(id);
    const result = await uploadToCloudinary(file, body.folder || media.folder, resourceTypeFor(file));
    const old = { publicId: media.publicId, resourceType: media.resourceType };
    try {
        const replacement = mapUpload(file, result, { ...body, folder: body.folder || media.folder }, { id: media.uploadedBy });
        const preserved = {
            displayName: body.displayName ?? media.displayName,
            altText: body.altText ?? media.altText,
            caption: body.caption ?? media.caption,
            tags: body.tags === undefined ? media.tags : parseTags(body.tags)
        };
        Object.assign(media, replacement, preserved);
        await repository.save(media);
        await deleteFromCloudinary(old.publicId, old.resourceType).catch(() => {});
        return media;
    } catch (error) {
        await deleteFromCloudinary(result.public_id, result.resource_type).catch(() => {});
        throw error;
    }
};

exports.remove = async id => {
    const media = await getActive(id);
    media.isDeleted = true;
    media.deletedAt = new Date();
    media.status = MEDIA_STATUS.DELETED;
    await repository.save(media);
};

exports.restore = async id => {
    const media = await repository.findById(id);
    if (!media) throw createError(MESSAGES.NOT_FOUND, 404);
    if (!media.isDeleted) throw createError("Media is not deleted.", 409);
    media.isDeleted = false;
    media.deletedAt = null;
    media.status = MEDIA_STATUS.ACTIVE;
    await repository.save(media);
    return media;
};
