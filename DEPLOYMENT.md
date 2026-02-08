# Deployment Guide

This guide covers deploying Business Management Hub to production environments.

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Code reviewed and merged to main
- [ ] Security audit completed (`npm audit`)
- [ ] Database backup created
- [ ] Environment variables configured
- [ ] SSL certificates ready (for HTTPS)
- [ ] Monitoring and logging setup
- [ ] Rollback plan documented

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file (never commit this):

```env
# Database
DB_HOST=your-db-server.com
DB_USER=production_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=business_management_hub

# Security
JWT_SECRET=VERY_LONG_CRYPTOGRAPHICALLY_SECURE_RANDOM_STRING
NODE_ENV=production

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Generate Secure JWT Secret

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

### 3. Database Setup

```bash
# Create dedicated database user
mysql -u root -p -e "CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';"

# Grant permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON business_management_hub.* TO 'prod_user'@'localhost';"

# Create database and import schema
mysql -u prod_user -p business_management_hub < database/schema.sql

# Run any pending migrations
mysql -u prod_user -p < database/setup-permissions.sql
```

## Deployment Options

### Option 1: Traditional VPS/Server

#### Prerequisites
- Node.js v18+ installed
- MySQL installed
- Nginx or Apache as reverse proxy
- PM2 for process management

#### Steps

1. **Clone the repository**
   ```bash
   cd /var/www
   git clone https://github.com/your-org/business-management-hub.git
   cd business-management-hub
   ```

2. **Install dependencies**
   ```bash
   npm install --production
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Setup PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "bmh" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
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
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com
   ```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=business_management_hub
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: always

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=business_management_hub
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - db_data:/var/lib/mysql
    restart: always

volumes:
  db_data:
```

#### Deploy with Docker
```bash
docker-compose up -d
```

### Option 3: Vercel Deployment

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env.production`
   - Database should be external (not local)

4. **Deploy**
   - Automatic deployment on push to main

**Note:** Vercel doesn't support local MySQL. Use AWS RDS, DigitalOcean DBaaS, or similar.

## Post-Deployment

### 1. Verify Installation

```bash
# Test API endpoint
curl https://yourdomain.com/api/auth/me

# Check database connection
pm2 logs bmh
```

### 2. Setup Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
```

### 3. Backup Strategy

```bash
# Daily database backup
0 2 * * * mysqldump -u prod_user -p$DB_PASSWORD business_management_hub > /backups/bmh-$(date +\%Y-\%m-\%d).sql
```

### 4. Security Hardening

```bash
# Update all packages
sudo apt-get update && apt-get upgrade -y

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Configure fail2ban
sudo apt-get install fail2ban
```

## Monitoring & Logging

### Application Logs
```bash
# View logs
pm2 logs bmh

# Watch logs in real-time
pm2 logs bmh --lines 100
```

### Database Logs
```bash
# Monitor MySQL
tail -f /var/log/mysql/mysql.log
```

### System Metrics
```bash
# Install and use iotop, htop for monitoring
sudo apt-get install htop
htop
```

## Scaling

### Horizontal Scaling
1. Setup multiple app instances
2. Configure load balancer (Nginx, HAProxy)
3. Use shared database

### Database Optimization
1. Add indexes to frequently queried columns
2. Archive old data periodically
3. Setup read replicas if needed

## Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs bmh

# Check Node.js version
node -v

# Rebuild dependencies
npm ci --production
```

### Database Connection Issues
```bash
# Test connection
mysql -h your-db-server -u prod_user -p

# Check MySQL status
systemctl status mysql
```

### Memory Leaks
```bash
# Monitor memory
pm2 monit

# Restart on memory threshold
pm2 set bmh max_memory_restart 500M
```

## Rollback Plan

```bash
# Keep previous version
cp -r /var/www/bmh /var/www/bmh-backup

# Rollback
pm2 stop bmh
rm -rf /var/www/bmh
cp -r /var/www/bmh-backup /var/www/bmh
pm2 start bmh
```

## Update Process

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Rebuild
npm run build

# Reload PM2 gracefully
pm2 reload bmh
```

## Performance Optimization

### Caching
- Enable Redis caching layer
- Cache database queries
- Cache API responses

### Database
- Add optimal indexes
- Archive old records
- Use connection pooling

### Frontend
- Enable static asset caching
- Image optimization
- Code splitting

---

**Questions?** Check [SECURITY.md](SECURITY.md) for security considerations or [README.md](README.md) for general info.
