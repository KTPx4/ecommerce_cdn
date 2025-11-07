# CDN Image Service - Quick Start

## 🚀 Khởi động nhanh

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi động server
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

### 3. Test API

#### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

#### Upload ảnh (cần API Key)
```bash
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "x-api-key: ecommerce_cdn_secret_key_2024" \
  -F "image=@your-image.jpg" \
  -F "category=products"
```

#### Lấy ảnh
```bash
# Mở trong browser hoặc sử dụng trong HTML
http://localhost:3000/api/v1/images/products/2024/11/your-image.jpg
```

### 4. Sử dụng Web Interface
Mở file `examples/upload.html` trong browser để upload ảnh qua giao diện web.

## 📌 API Key mặc định
```
ecommerce_cdn_secret_key_2024
```

**Lưu ý:** Thay đổi API key trong file `.env` trước khi deploy production!

## 📚 Xem thêm
- Đọc [README.md](README.md) để biết chi tiết đầy đủ
- Xem [examples/client.js](examples/client.js) để tích hợp vào code
- Xem [examples/upload.html](examples/upload.html) để test upload qua browser

## 🔧 Các lệnh hữu ích
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```
