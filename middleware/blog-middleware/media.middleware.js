const multer = require("multer");
const {
    MIME_TYPES,
    FILE_LIMITS,
    MESSAGES
} = require("../../constants/blog-constants/media.const");

const allowedMimeTypes = new Set([
    ...MIME_TYPES.IMAGE,
    ...MIME_TYPES.VIDEO,
    ...MIME_TYPES.DOCUMENT
]);

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_LIMITS.VIDEO_SIZE,
        files: FILE_LIMITS.MAX_FILES
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(Object.assign(new Error(MESSAGES.INVALID_FILE), { statusCode: 400 }));
        }
        return callback(null, true);
    }
});

const validateActualSize = (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) {
        return res.status(400).json({ success: false, message: "Please upload at least one file." });
    }
    const invalid = files.find(file => {
        if (MIME_TYPES.IMAGE.includes(file.mimetype)) return file.size > FILE_LIMITS.IMAGE_SIZE;
        if (MIME_TYPES.VIDEO.includes(file.mimetype)) return file.size > FILE_LIMITS.VIDEO_SIZE;
        return file.size > FILE_LIMITS.DOCUMENT_SIZE;
    });
    if (invalid) {
        return res.status(413).json({ success: false, message: `${invalid.originalname}: ${MESSAGES.FILE_TOO_LARGE}` });
    }
    return next();
};

const validate = (schema, source = "body") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map(item => item.message).join(" ")
        });
    }
    req[source] = value;
    return next();
};

const handleUploadError = (error, _req, res, next) => {
    if (error instanceof multer.MulterError || error.statusCode) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    return next(error);
};

module.exports = {
    uploadSingle: uploader.single("file"),
    uploadMultiple: uploader.array("files", FILE_LIMITS.MAX_FILES),
    validateActualSize,
    validate,
    handleUploadError
};
