# Hướng dẫn Deploy CDN Image Service lên Ubuntu Server

## 📋 Yêu cầu

- Ubuntu Server 20.04+ (hoặc Debian-based distro)
- Quyền sudo/root
- Kết nối internet

## 🚀 Hướng dẫn chi tiết

### Bước 1: Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### Bước 2: Cài đặt Node.js 18+

```bash
# Cài đặt Node.js 18.x từ NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### Bước 3: Cài đặt PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

### Bước 4: Clone/Upload project lên server

**Option A: Clone từ Git**
```bash
cd /var/www
sudo git clone https://github.com/your-username/ecommerce_cdn.git
cd ecommerce_cdn
```

**Option B: Upload qua SCP (từ máy local)**
```bash
# Trên máy Windows (PowerShell hoặc CMD)
scp -r "e:\My Project\CdnImage" username@server-ip:/var/www/

# SSH vào server
ssh username@server-ip
cd /var/www/CdnImage
```

**Option C: Upload qua FTP/SFTP**
- Sử dụng FileZilla hoặc WinSCP
- Upload toàn bộ folder CdnImage lên server

### Bước 5: Cài đặt dependencies

```bash
cd /var/www/CdnImage
npm install --production
```

### Bước 6: Cấu hình môi trường

```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env
nano .env
```

Cập nhật các giá trị trong `.env`:
```env
NODE_ENV=production
PORT=3000
BASE_URL=http://your-server-ip:3000

# Đổi API key thành giá trị bảo mật
API_KEY_SECRET=your_secure_random_api_key_here

# Các cấu hình khác...
```

**Lưu file:** Nhấn `Ctrl+X`, sau đó `Y`, rồi `Enter`

### Bước 7: Tạo thư mục cần thiết

```bash
mkdir -p storage/images storage/temp logs
chmod -R 755 storage logs
```

### Bước 8: Chạy ứng dụng với PM2

**Sử dụng file ecosystem.config.json:**

```bash
# Start app với PM2
pm2 start ecosystem.config.json

# Hoặc chạy đơn giản (không dùng cluster mode)
pm2 start src/server.js --name cdn-image-service
```

### Bước 9: Cấu hình PM2 tự động khởi động

```bash
# Lưu danh sách process
pm2 save

# Tạo startup script
pm2 startup

# Copy và chạy lệnh được hiển thị (tương tự như):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username
```

### Bước 10: Kiểm tra trạng thái

```bash
# Xem trạng thái app
pm2 status

# Xem logs
pm2 logs cdn-image-service

# Xem logs realtime
pm2 logs cdn-image-service --lines 100

# Monitor
pm2 monit
```

## 🔧 Các lệnh PM2 hữu ích

```bash
# Khởi động app
pm2 start ecosystem.config.json

# Dừng app
pm2 stop cdn-image-service

# Khởi động lại
pm2 restart cdn-image-service

# Reload (zero-downtime)
pm2 reload cdn-image-service

# Xóa app khỏi PM2
pm2 delete cdn-image-service

# Xem logs
pm2 logs

# Xóa logs
pm2 flush

# Danh sách process
pm2 list
```

## 🌐 Cấu hình Nginx Reverse Proxy (Optional nhưng khuyến nghị)

### 1. Cài đặt Nginx

```bash
sudo apt install nginx -y
```

### 2. Tạo cấu hình cho site

```bash
sudo nano /etc/nginx/sites-available/cdn-image-service
```

Thêm nội dung:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Hoặc IP server
    
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache cho images
    location ~* ^/api/v1/images/.+\.(jpg|jpeg|png|gif|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Kích hoạt site

```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/cdn-image-service /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. Mở port firewall

```bash
# Nếu dùng UFW
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw status
```

## 🔒 Cài đặt SSL với Let's Encrypt (Khuyến nghị cho Production)

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal đã được cấu hình tự động
# Kiểm tra renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### 1. Xem logs realtime

```bash
# PM2 logs
pm2 logs cdn-image-service --lines 200

# Application logs
tail -f logs/combined.log
tail -f logs/error.log
```

### 2. Theo dõi tài nguyên

```bash
# PM2 monitor
pm2 monit

# System resources
htop
```

### 3. Cài đặt PM2 Web UI (Optional)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔄 Update/Deploy code mới

```bash
# 1. Pull code mới (nếu dùng Git)
cd /var/www/CdnImage
git pull origin master

# 2. Cài đặt dependencies mới (nếu có)
npm install --production

# 3. Restart app với zero-downtime
pm2 reload cdn-image-service

# Hoặc restart thường
pm2 restart cdn-image-service
```

## 🐛 Troubleshooting

### Lỗi: Port 3000 đã được sử dụng

```bash
# Tìm process đang dùng port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Lỗi: Permission denied khi tạo file

```bash
# Sửa quyền cho thư mục storage và logs
sudo chown -R $USER:$USER /var/www/CdnImage
chmod -R 755 storage logs
```

### Lỗi: Module not found

```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install --production
```

### App crash liên tục

```bash
# Xem lỗi trong logs
pm2 logs cdn-image-service --err

# Xem logs chi tiết
cat logs/error.log
```

### Out of memory

```bash
# Tăng memory limit trong ecosystem.config.json
# max_memory_restart: "2G"

# Hoặc tăng swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📈 Performance Optimization

### 1. Sử dụng Cluster Mode

File `ecosystem.config.json` đã cấu hình cluster mode với `instances: "max"` để tận dụng hết CPU cores.

### 2. Tăng số file descriptors

```bash
# Thêm vào /etc/security/limits.conf
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf
```

### 3. Optimize Nginx

```bash
# Tăng worker_processes trong /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 4096;
```

## 🧪 Test sau khi deploy

```bash
# 1. Health check
curl http://localhost:3000/api/v1/health

# 2. Test upload (thay API_KEY)
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "x-api-key: your_api_key_here" \
  -F "image=@test-image.jpg" \
  -F "category=test"

# 3. Test từ bên ngoài
curl http://your-server-ip:3000/api/v1/health
```

## 📝 Checklist Deploy

- [ ] Node.js 18+ đã cài
- [ ] PM2 đã cài
- [ ] Code đã upload
- [ ] Dependencies đã install
- [ ] File .env đã cấu hình
- [ ] Thư mục storage, logs đã tạo
- [ ] App chạy thành công với PM2
- [ ] PM2 startup đã cấu hình
- [ ] Nginx đã cài (optional)
- [ ] Firewall đã mở port
- [ ] SSL đã cài (optional)
- [ ] Test health check OK
- [ ] Test upload OK

## 🎉 Hoàn tất!

Server CDN Image Service của bạn đã sẵn sàng!

**Truy cập:**
- API: `http://your-server-ip:3000` (hoặc domain)
- Health check: `http://your-server-ip:3000/api/v1/health`
- Upload form: Upload file `examples/upload.html` và trỏ API_URL đến server

**API Key mặc định:** `ecommerce_cdn_secret_key_2024`
⚠️ **Nhớ đổi API key trong production!**
