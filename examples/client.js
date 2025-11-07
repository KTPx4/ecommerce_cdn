const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'ecommerce_cdn_secret_key_2024';

class CDNImageClient {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.axios = axios.create({
            baseURL: apiUrl,
            headers: {
                'x-api-key': apiKey,
            },
        });
    }

    /**
     * Upload single image
     */
    async uploadImage(imagePath, category = 'general') {
        try {
            const form = new FormData();
            form.append('image', fs.createReadStream(imagePath));
            form.append('category', category);

            const response = await this.axios.post('/images/upload', form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Upload multiple images
     */
    async uploadMultipleImages(imagePaths, category = 'general') {
        try {
            const form = new FormData();

            imagePaths.forEach((imagePath) => {
                form.append('images', fs.createReadStream(imagePath));
            });

            form.append('category', category);

            const response = await this.axios.post('/images/upload-multiple', form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Get image URL
     */
    getImageUrl(imagePath, size = null) {
        let url = `${this.apiUrl}/images/${imagePath}`;
        if (size) {
            url += `?size=${size}`;
        }
        return url;
    }

    /**
     * List images
     */
    async listImages(options = {}) {
        try {
            const { page = 1, limit = 20, category } = options;

            const params = { page, limit };
            if (category) params.category = category;

            const response = await axios.get(`${this.apiUrl}/images/list`, {
                params,
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Get image metadata
     */
    async getImageMetadata(imagePath) {
        try {
            const response = await axios.get(`${this.apiUrl}/images/${imagePath}/metadata`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Delete image
     */
    async deleteImage(imagePath) {
        try {
            const response = await this.axios.delete(`/images/${imagePath}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        try {
            const response = await this.axios.get('/images/stats');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${this.apiUrl}/health`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
}

// Example usage
async function main() {
    const client = new CDNImageClient(API_URL, API_KEY);

    try {
        // 1. Health check
        console.log('1. Checking service health...');
        const health = await client.healthCheck();
        console.log('Health:', health);

        // 2. Upload single image (uncomment and provide image path)
        // console.log('\n2. Uploading single image...');
        // const uploadResult = await client.uploadImage('./test-image.jpg', 'products');
        // console.log('Upload result:', uploadResult.data);
        // console.log('Image URL:', uploadResult.data.url);
        // console.log('Thumbnail URLs:', uploadResult.data.thumbnails);

        // 3. Upload multiple images (uncomment and provide image paths)
        // console.log('\n3. Uploading multiple images...');
        // const multiUpload = await client.uploadMultipleImages(
        //   ['./image1.jpg', './image2.jpg'],
        //   'products'
        // );
        // console.log('Multi-upload result:', multiUpload.data);

        // 4. List images
        console.log('\n4. Listing images...');
        const images = await client.listImages({ page: 1, limit: 10 });
        console.log('Images:', images);

        // 5. Get storage stats
        console.log('\n5. Getting storage statistics...');
        const stats = await client.getStorageStats();
        console.log('Storage stats:', stats.data);

        // 6. Get image URL examples
        console.log('\n6. Image URL examples:');
        const imagePath = 'products/2024/11/example.jpg';
        console.log('Original:', client.getImageUrl(imagePath));
        console.log('Small:', client.getImageUrl(imagePath, 'small'));
        console.log('Medium:', client.getImageUrl(imagePath, 'medium'));
        console.log('Large:', client.getImageUrl(imagePath, 'large'));

        // 7. Get image metadata (uncomment and provide actual image path)
        // console.log('\n7. Getting image metadata...');
        // const metadata = await client.getImageMetadata('products/2024/11/example.jpg');
        // console.log('Metadata:', metadata.data);

        // 8. Delete image (uncomment and provide actual image path)
        // console.log('\n8. Deleting image...');
        // const deleteResult = await client.deleteImage('products/2024/11/example.jpg');
        // console.log('Delete result:', deleteResult);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run example if executed directly
if (require.main === module) {
    main();
}

// Export client for use in other files
module.exports = CDNImageClient;
