# CDN Image Service - E-commerce

Server Node.js để lưu trữ và phục vụ ảnh cho dự án E-commerce, hoạt động như một CDN riêng.

## 🚀 Tính năng

- ✅ Upload ảnh đơn lẻ và nhiều ảnh cùng lúc
- ✅ Tự động tối ưu hóa ảnh (resize, compress)
- ✅ Tạo thumbnail tự động (small, medium, large)
- ✅ Phân loại ảnh theo category
- ✅ Bảo mật với API Key authentication
- ✅ Rate limiting để chống abuse
- ✅ CORS configuration cho cross-origin requests
- ✅ Logging và error handling
- ✅ Hỗ trợ nhiều định dạng ảnh (JPEG, PNG, WebP, GIF)

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- Ít nhất 1GB RAM
- Dung lượng ổ cứng tùy thuộc vào số lượng ảnh cần lưu trữ

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd CdnImage
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=http://your-domain.com

# Storage Configuration
STORAGE_PATH=./storage/images
TEMP_PATH=./storage/temp

# API Keys
API_KEY_SECRET=your_secure_api_key_here_change_this

# JWT Configuration (nếu cần authentication nâng cao)
JWT_SECRET=your_super_secret_jwt_key

# Image Configuration
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
IMAGE_QUALITY=80
GENERATE_THUMBNAILS=true

# CORS
CORS_ORIGIN=*
```

### 4. Khởi động server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Tất cả các endpoint upload và delete yêu cầu API Key trong header:

```
x-api-key: your_api_key_here
```

---

### 1. Health Check

**Endpoint:** `GET /api/v1/health`

**Description:** Kiểm tra trạng thái server

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2024-11-07T10:00:00.000Z",
    "uptime": 3600,
    "environment": "production"
  }
}
```

---

### 2. Upload Single Image

**Endpoint:** `POST /api/v1/images/upload`

**Headers:**
```
x-api-key: your_api_key_here
Content-Type: multipart/form-data
```

**Body (form-data):**
- `image` (file, required): File ảnh cần upload
- `category` (string, optional): Phân loại ảnh (default: "general")
- `generateThumbnails` (boolean, optional): Tạo thumbnails (default: true)
- `optimize` (boolean, optional): Tối ưu hóa ảnh (default: true)
- `alt` (string, optional): Alt text cho ảnh
- `tags` (array, optional): Tags cho ảnh

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "x-api-key: your_api_key_here" \
  -F "image=@/path/to/image.jpg" \
  -F "category=products" \
  -F "alt=Product Image"
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "1699356000000-uuid.jpg",
    "path": "products/2024/11/1699356000000-uuid.jpg",
    "url": "http://localhost:3000/api/v1/images/products/2024/11/1699356000000-uuid.jpg",
    "thumbnails": {
      "small": "http://localhost:3000/api/v1/images/products/2024/11/1699356000000-uuid-small.jpg",
      "medium": "http://localhost:3000/api/v1/images/products/2024/11/1699356000000-uuid-medium.jpg",
      "large": "http://localhost:3000/api/v1/images/products/2024/11/1699356000000-uuid-large.jpg"
    },
    "metadata": {
      "originalName": "image.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "width": 1920,
      "height": 1080,
      "format": "jpeg"
    },
    "category": "products",
    "uploadedAt": "2024-11-07T10:00:00.000Z"
  }
}
```

---

### 3. Upload Multiple Images

**Endpoint:** `POST /api/v1/images/upload-multiple`

**Headers:**
```
x-api-key: your_api_key_here
Content-Type: multipart/form-data
```

**Body (form-data):**
- `images` (files, required): Tối đa 10 file ảnh
- `category` (string, optional): Phân loại ảnh

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload-multiple \
  -H "x-api-key: your_api_key_here" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "category=products"
```

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "count": 2,
    "images": [...]
  }
}
```

---

### 4. Get Image

**Endpoint:** `GET /api/v1/images/:path`

**Query Parameters:**
- `size` (optional): Kích thước ảnh (`small`, `medium`, `large`, `original`)

**Example Request:**
```bash
# Original image
http://localhost:3000/api/v1/images/products/2024/11/image.jpg

# Small thumbnail
http://localhost:3000/api/v1/images/products/2024/11/image.jpg?size=small
```

**Response:** Binary image data

---

### 5. List Images

**Endpoint:** `GET /api/v1/images/list`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số ảnh trên mỗi trang (default: 20, max: 100)
- `category` (optional): Lọc theo category

**Example Request:**
```bash
curl http://localhost:3000/api/v1/images/list?page=1&limit=20&category=products
```

**Response:**
```json
{
  "success": true,
  "message": "Images retrieved successfully",
  "data": [
    {
      "path": "products/2024/11/image.jpg",
      "url": "http://localhost:3000/api/v1/images/products/2024/11/image.jpg",
      "size": 245678,
      "lastModified": "2024-11-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6. Get Image Metadata

**Endpoint:** `GET /api/v1/images/:path/metadata`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/images/products/2024/11/image.jpg/metadata
```

**Response:**
```json
{
  "success": true,
  "message": "Image metadata retrieved successfully",
  "data": {
    "size": 245678,
    "lastModified": "2024-11-07T10:00:00.000Z",
    "created": "2024-11-07T10:00:00.000Z",
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  }
}
```

---

### 7. Delete Image

**Endpoint:** `DELETE /api/v1/images/:path`

**Headers:**
```
x-api-key: your_api_key_here
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/images/products/2024/11/image.jpg \
  -H "x-api-key: your_api_key_here"
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "path": "products/2024/11/image.jpg"
  }
}
```

---

### 8. Get Storage Statistics

**Endpoint:** `GET /api/v1/images/stats`

**Headers:**
```
x-api-key: your_api_key_here
```

**Response:**
```json
{
  "success": true,
  "message": "Storage statistics retrieved successfully",
  "data": {
    "totalImages": 1500,
    "totalSize": 2147483648,
    "totalSizeMB": "2048.00",
    "storagePath": "/path/to/storage/images"
  }
}
```

---

## 🔒 Bảo mật

### 1. API Key Authentication
- Tất cả endpoint upload/delete yêu cầu API key
- Đặt `API_KEY_SECRET` trong file `.env`
- Gửi API key qua header `x-api-key`

### 2. Rate Limiting
- Upload: 20 requests / 15 phút
- Delete: 30 requests / 15 phút
- General API: 100 requests / 15 phút

### 3. CORS
- Cấu hình CORS trong `.env`
- Mặc định cho phép tất cả origins (`*`)
- Trong production nên giới hạn cụ thể

### 4. File Validation
- Giới hạn kích thước file (mặc định 10MB)
- Chỉ chấp nhận định dạng ảnh hợp lệ
- Validate content type

## 📁 Cấu trúc thư mục

```
CdnImage/
├── src/
│   ├── config/
│   │   └── app.config.js
│   ├── controllers/
│   │   └── image.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   │   ├── health.routes.js
│   │   └── image.routes.js
│   ├── services/
│   │   └── storage.service.js
│   ├── utils/
│   │   ├── error.utils.js
│   │   ├── image.utils.js
│   │   ├── logger.utils.js
│   │   └── response.utils.js
│   ├── app.js
│   └── server.js
├── storage/
│   ├── images/       # Thư mục lưu ảnh
│   └── temp/         # Thư mục tạm
├── logs/             # Log files
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deployment

### Deploy lên VPS/Server

1. **Chuẩn bị server:**
```bash
# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
sudo npm install -g pm2
```

2. **Clone và cài đặt:**
```bash
git clone <repository-url>
cd CdnImage
npm install --production
```

3. **Cấu hình:**
```bash
cp .env.example .env
nano .env
```

4. **Chạy với PM2:**
```bash
pm2 start src/server.js --name cdn-image-service
pm2 save
pm2 startup
```

5. **Cấu hình Nginx (optional):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache static images
    location ~* ^/api/v1/images/.+\.(jpg|jpeg|png|gif|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Deploy lên AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04 LTS)
2. **Cấu hình Security Group:** Mở port 3000 hoặc 80
3. **SSH vào instance và cài đặt như VPS**
4. **Cấu hình Elastic IP** cho địa chỉ IP tĩnh
5. **Setup Auto Scaling** (optional) cho high availability

### Deploy với Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p storage/images storage/temp logs

EXPOSE 3000

CMD ["node", "src/server.js"]
```

**Build và chạy:**
```bash
docker build -t cdn-image-service .
docker run -d -p 3000:3000 \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  --name cdn-service \
  cdn-image-service
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Monitoring

Server tự động ghi log vào thư mục `logs/`:
- `combined.log`: Tất cả logs
- `error.log`: Chỉ error logs

Xem logs với PM2:
```bash
pm2 logs cdn-image-service
```

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux
lsof -i :3000
kill -9 <PID>
```

### Thiếu quyền ghi file
```bash
# Linux/Mac
chmod -R 755 storage/
chmod -R 755 logs/
```

### Out of memory
Tăng memory limit cho Node.js:
```bash
node --max-old-space-size=4096 src/server.js
```

## 📝 Example Client Usage

### JavaScript/Node.js
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadImage() {
  const form = new FormData();
  form.append('image', fs.createReadStream('./image.jpg'));
  form.append('category', 'products');

  const response = await axios.post(
    'http://localhost:3000/api/v1/images/upload',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'x-api-key': 'your_api_key_here'
      }
    }
  );

  console.log('Image URL:', response.data.data.url);
}
```

### PHP
```php
<?php
$curl = curl_init();

$file = new CURLFile('image.jpg', 'image/jpeg', 'image.jpg');
$data = array(
    'image' => $file,
    'category' => 'products'
);

curl_setopt_array($curl, array(
    CURLOPT_URL => 'http://localhost:3000/api/v1/images/upload',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => array(
        'x-api-key: your_api_key_here'
    ),
));

$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response, true);
echo $result['data']['url'];
?>
```

### Python
```python
import requests

url = 'http://localhost:3000/api/v1/images/upload'
headers = {'x-api-key': 'your_api_key_here'}
files = {'image': open('image.jpg', 'rb')}
data = {'category': 'products'}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
print(result['data']['url'])
```

## 📄 License

MIT

## 👥 Support

Nếu có vấn đề, tạo issue trên GitHub repository.
