const fs = require('fs-extra');
const path = require('path');
const config = require('../config/app.config');
const { ApiError } = require('../utils/error.utils');
const logger = require('../utils/logger.utils');
const {
    generateFileName,
    optimizeImage,
    getImageMetadata,
    generateThumbnails,
    getExtensionFromMimeType,
} = require('../utils/image.utils');

class StorageService {
    constructor() {
        this.storagePath = config.storage.path;
        this.tempPath = config.storage.tempPath;
        this.baseUrl = config.baseUrl;
        this.initializeStorage();
    }

    /**
     * Initialize storage directories
     */
    async initializeStorage() {
        try {
            await fs.ensureDir(this.storagePath);
            await fs.ensureDir(this.tempPath);
            logger.info('Storage directories initialized');
        } catch (error) {
            logger.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    /**
     * Get storage path for category
     */
    getCategoryPath(category = 'general') {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return path.join(this.storagePath, category, String(year), month);
    }

    /**
     * Upload image to local storage
     */
    async uploadImage(file, options = {}) {
        try {
            const { category = 'general', generateThumb = true, optimize = true } = options;

            // Get original image metadata
            const metadata = await getImageMetadata(file.buffer);

            // Optimize original image if needed
            let imageBuffer = file.buffer;
            if (optimize) {
                imageBuffer = await optimizeImage(file.buffer, {
                    format: metadata.format,
                });
            }

            // Generate filename and paths
            const fileName = generateFileName(file.originalname);
            const categoryPath = this.getCategoryPath(category);
            await fs.ensureDir(categoryPath);

            const filePath = path.join(categoryPath, fileName);
            const relativePath = path.relative(this.storagePath, filePath);

            // Save original image
            await fs.writeFile(filePath, imageBuffer);

            // Generate and save thumbnails
            let thumbnailUrls = {};
            if (generateThumb) {
                const thumbnails = await generateThumbnails(file.buffer, metadata.format);
                const ext = getExtensionFromMimeType(file.mimetype);

                for (const [sizeName, thumbBuffer] of Object.entries(thumbnails)) {
                    const thumbFileName = fileName.replace(ext, `-${sizeName}${ext}`);
                    const thumbPath = path.join(categoryPath, thumbFileName);
                    await fs.writeFile(thumbPath, thumbBuffer);

                    const thumbRelativePath = path.relative(this.storagePath, thumbPath);
                    thumbnailUrls[sizeName] = `${this.baseUrl}/api/${config.apiVersion}/images/${thumbRelativePath.replace(/\\/g, '/')}`;
                }
            }

            // Return image data
            return {
                id: fileName,
                path: relativePath.replace(/\\/g, '/'),
                url: `${this.baseUrl}/api/${config.apiVersion}/images/${relativePath.replace(/\\/g, '/')}`,
                thumbnails: thumbnailUrls,
                metadata: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: imageBuffer.length,
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                },
                category,
                uploadedAt: new Date().toISOString(),
            };
        } catch (error) {
            logger.error('Storage Upload Error:', error);
            throw new ApiError(500, 'Failed to upload image to storage');
        }
    }

    /**
     * Get image from local storage
     */
    async getImage(imagePath) {
        try {
            const fullPath = path.join(this.storagePath, imagePath);

            // Check if file exists
            const exists = await fs.pathExists(fullPath);
            if (!exists) {
                throw new ApiError(404, 'Image not found');
            }

            // Read file
            const data = await fs.readFile(fullPath);

            // Get file extension to determine content type
            const ext = path.extname(fullPath).toLowerCase();
            const contentTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.gif': 'image/gif',
            };

            return {
                data,
                contentType: contentTypes[ext] || 'image/jpeg',
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Storage Get Error:', error);
            throw new ApiError(500, 'Failed to retrieve image from storage');
        }
    }

    /**
     * Delete image from local storage
     */
    async deleteImage(imagePath) {
        try {
            const fullPath = path.join(this.storagePath, imagePath);

            // Check if file exists
            const exists = await fs.pathExists(fullPath);
            if (!exists) {
                throw new ApiError(404, 'Image not found');
            }

            // Delete original file
            await fs.remove(fullPath);

            // Delete thumbnails if they exist
            const ext = path.extname(fullPath);
            const basePath = fullPath.replace(ext, '');

            const thumbnailSizes = ['small', 'medium', 'large'];
            const deletePromises = thumbnailSizes.map(async (size) => {
                const thumbPath = `${basePath}-${size}${ext}`;
                const thumbExists = await fs.pathExists(thumbPath);
                if (thumbExists) {
                    await fs.remove(thumbPath);
                }
            });

            await Promise.all(deletePromises);

            return { success: true };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Storage Delete Error:', error);
            throw new ApiError(500, 'Failed to delete image from storage');
        }
    }

    /**
     * List images from local storage
     */
    async listImages(options = {}) {
        try {
            const { category, page = 1, limit = 20 } = options;

            let searchPath = this.storagePath;
            if (category) {
                searchPath = path.join(this.storagePath, category);
            }

            // Check if path exists
            const exists = await fs.pathExists(searchPath);
            if (!exists) {
                return {
                    images: [],
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                };
            }

            // Get all image files recursively
            const allFiles = await this.getFilesRecursively(searchPath);

            // Filter out thumbnails
            const imageFiles = allFiles.filter(file => {
                return !/-(?:small|medium|large)\.[^.]+$/.test(file);
            });

            // Sort by modification time (newest first)
            const filesWithStats = await Promise.all(
                imageFiles.map(async (file) => {
                    const stats = await fs.stat(file);
                    return { file, mtime: stats.mtime, size: stats.size };
                })
            );

            filesWithStats.sort((a, b) => b.mtime - a.mtime);

            // Paginate results
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedFiles = filesWithStats.slice(startIndex, endIndex);

            // Map to image objects
            const images = paginatedFiles.map((item) => {
                const relativePath = path.relative(this.storagePath, item.file);
                return {
                    path: relativePath.replace(/\\/g, '/'),
                    url: `${this.baseUrl}/api/${config.apiVersion}/images/${relativePath.replace(/\\/g, '/')}`,
                    size: item.size,
                    lastModified: item.mtime,
                };
            });

            return {
                images,
                total: imageFiles.length,
                page: parseInt(page),
                limit: parseInt(limit),
            };
        } catch (error) {
            logger.error('Storage List Error:', error);
            throw new ApiError(500, 'Failed to list images from storage');
        }
    }

    /**
     * Get all files recursively from directory
     */
    async getFilesRecursively(dir) {
        const files = [];
        const items = await fs.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                const subFiles = await this.getFilesRecursively(fullPath);
                files.push(...subFiles);
            } else if (stat.isFile()) {
                // Check if it's an image file
                const ext = path.extname(fullPath).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }

    /**
     * Check if image exists
     */
    async imageExists(imagePath) {
        const fullPath = path.join(this.storagePath, imagePath);
        return await fs.pathExists(fullPath);
    }

    /**
     * Get image metadata from storage
     */
    async getImageMetadataFromStorage(imagePath) {
        try {
            const fullPath = path.join(this.storagePath, imagePath);

            // Check if file exists
            const exists = await fs.pathExists(fullPath);
            if (!exists) {
                throw new ApiError(404, 'Image not found');
            }

            // Get file stats
            const stats = await fs.stat(fullPath);

            // Read and get image metadata
            const buffer = await fs.readFile(fullPath);
            const metadata = await getImageMetadata(buffer);

            return {
                size: stats.size,
                lastModified: stats.mtime,
                created: stats.birthtime,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Storage Metadata Error:', error);
            throw new ApiError(500, 'Failed to get image metadata');
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        try {
            const allFiles = await this.getFilesRecursively(this.storagePath);

            let totalSize = 0;
            for (const file of allFiles) {
                const stats = await fs.stat(file);
                totalSize += stats.size;
            }

            return {
                totalImages: allFiles.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                storagePath: this.storagePath,
            };
        } catch (error) {
            logger.error('Storage Stats Error:', error);
            throw new ApiError(500, 'Failed to get storage statistics');
        }
    }
}

module.exports = new StorageService();
