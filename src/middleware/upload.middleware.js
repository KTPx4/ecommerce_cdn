const multer = require('multer');
const config = require('../config/app.config');
const { ApiError } = require('../utils/error.utils');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Check if file type is allowed
    if (config.image.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new ApiError(
                400,
                `Invalid file type. Allowed types: ${config.image.allowedTypes.join(', ')}`
            ),
            false
        );
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.image.maxFileSize,
    },
    fileFilter: fileFilter,
});

module.exports = upload;
