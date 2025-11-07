FROM node:18-alpine

# Install Sharp dependencies
RUN apk add --no-cache \
    libc6-compat \
    libstdc++ \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create directories
RUN mkdir -p storage/images storage/temp logs

# Set permissions
RUN chmod -R 755 storage logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
