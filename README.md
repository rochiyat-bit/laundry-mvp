# Laundry Management System

Aplikasi web fullstack untuk manajemen laundry dengan fitur lengkap termasuk role management, pricing, order tracking, dan QR code generation.

## Fitur Utama

- **User Role Management**: 3 level akses (Admin, Staff, Customer)
- **Manajemen Harga**: Kelola layanan dan harga laundry
- **Order Management**: Buat dan kelola pesanan laundry
- **QR Code Generation**: Setiap pesanan mendapat QR code unik
- **Order Tracking**: Tracking pesanan secara real-time via QR code
- **Status History**: Riwayat perubahan status pesanan
- **Dashboard**: Statistik dan overview pesanan

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- QRCode Generation

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (State Management)
- Axios

## Prerequisites

- Node.js (v18 atau lebih baru)
- PostgreSQL (v14 atau lebih baru)
- npm atau yarn

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd laundry-mvp
```

### 2. Setup Database

Buat database PostgreSQL baru:

```sql
CREATE DATABASE laundry_db;
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file dengan konfigurasi database Anda
# DATABASE_URL="postgresql://user:password@localhost:5432/laundry_db?schema=public"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=3000
# FRONTEND_URL="http://localhost:5173"

# Setup database (generate, migrate, dan seed dalam 1 command)
npm run db:setup

# ATAU manual step by step:
# npm run prisma:generate    # Generate Prisma Client
# npm run prisma:migrate     # Run migrations
# npm run prisma:seed        # Seed initial data

# (Optional) Open Prisma Studio untuk melihat database
npm run prisma:studio
```

#### Seeding Data

Setelah menjalankan `npm run db:setup` atau `npm run prisma:seed`, database akan terisi dengan data awal:

**👤 Default Users:**
| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@laundry.com      | admin123     |
| Staff    | staff@laundry.com      | staff123     |
| Customer | customer@example.com   | customer123  |
| Customer | siti@example.com       | customer123  |

**🧺 Services:**
- Cuci Kering (Rp 7.000/kg)
- Cuci Setrika (Rp 10.000/kg)
- Setrika Saja (Rp 5.000/kg)
- Dry Cleaning (Rp 25.000/pcs)
- Cuci Sepatu (Rp 15.000/pcs)
- Cuci Boneka (Rp 20.000/pcs)
- Cuci Karpet (Rp 12.000/kg)
- Express 3 Jam (Rp 15.000/kg)

**📦 Sample Orders:**
- 3 order contoh dengan berbagai status (Delivered, Washing, Pending)
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file jika perlu
# VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend akan berjalan di http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend akan berjalan di http://localhost:5173

## Database Schema

### Users
- id, email, password, name, phone, role, timestamps

### Services
- id, name, description, unit, price, isActive, timestamps

### Orders
- id, orderNumber, customerId, status, totalAmount, notes, qrCode, trackingUrl, dates, timestamps

### OrderItems
- id, orderId, serviceId, quantity, price, subtotal

### OrderStatusHistory
- id, orderId, status, notes, timestamp

## User Roles

### ADMIN
- Full access ke semua fitur
- Kelola users (create, update, delete)
- Kelola services dan pricing
- Kelola semua orders
- Update status orders

### STAFF
- Kelola services dan pricing
- Kelola semua orders
- Update status orders
- Tidak bisa kelola users

### CUSTOMER
- Buat orders
- Lihat orders milik sendiri
- Track orders via QR code

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Services
- `GET /api/services` - Get all services (public)
- `GET /api/services/:id` - Get service by ID (public)
- `POST /api/services` - Create service (Admin/Staff)
- `PUT /api/services/:id` - Update service (Admin/Staff)
- `DELETE /api/services/:id` - Delete service (Admin)

### Orders
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders` - Get all orders (authenticated)
- `GET /api/orders/:id` - Get order by ID (authenticated)
- `GET /api/orders/number/:orderNumber` - Get order by number (authenticated)
- `PATCH /api/orders/:id/status` - Update order status (Admin/Staff)
- `DELETE /api/orders/:id` - Delete order (Admin)

### Tracking
- `GET /api/tracking/:orderNumber` - Track order (public, no auth required)

## Workflow Aplikasi

### 1. Login
Login menggunakan salah satu user yang sudah di-seed (lihat tabel Default Users di atas)

### 2. Setup Services (Opsional - sudah ada dari seeding)
Admin/Staff bisa menambahkan layanan baru atau edit yang sudah ada

### 3. Create Order
- Customer atau Staff membuat pesanan
- Pilih layanan dan jumlah
- Sistem menghitung total otomatis
- Order dibuat dengan status PENDING

### 4. QR Code Generation
- Sistem otomatis generate QR code untuk setiap pesanan
- QR code berisi link ke tracking page
- QR code dapat di-download

### 5. Order Processing
Staff update status pesanan melalui tahapan:
- PENDING → PROCESSING → WASHING → DRYING → IRONING → READY → DELIVERED

### 6. Order Tracking
- Customer scan QR code atau akses tracking URL
- Lihat status real-time tanpa perlu login
- Lihat detail items dan riwayat status

## Routing & URL Structure

Aplikasi ini menggunakan **React Router v6** dengan **BrowserRouter** untuk client-side routing.

### Available Routes

**Public Routes (No Authentication):**
- `/login` - Login page
- `/register` - Registration page
- `/tracking/:orderNumber` - Public tracking page (contoh: `/tracking/LDR2401070123`)

**Protected Routes (Require Authentication):**
- `/dashboard` - Dashboard dengan statistik
- `/orders` - Manajemen orders
- `/services` - Manajemen layanan dan harga (Admin/Staff only)
- `/users` - Manajemen user (Admin only)

### URL Path Examples

✅ **Full URL path akan terlihat di browser:**
- `https://laundryku.com/tracking/LDR2401070123`
- `https://laundryku.com/dashboard`
- `https://laundryku.com/orders`

Ini berbeda dengan hash routing (`#/tracking`) - aplikasi ini menggunakan **clean URLs** dengan BrowserRouter.

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Files akan ada di folder dist/
```

### Deployment Options

#### 1. Netlify / Vercel (Recommended - Zero Config)
Upload folder `dist/` - sudah include file `_redirects` dan `vercel.json` untuk handle routing otomatis.

```bash
# Deploy ke Netlify
netlify deploy --prod --dir=dist

# Deploy ke Vercel
vercel --prod
```

#### 2. Apache Server
File `.htaccess` sudah include di `public/`. Copy ke root directory setelah build.

#### 3. Nginx
Gunakan config file yang sudah disediakan:

```bash
# Copy nginx.conf
cp nginx.conf /etc/nginx/sites-available/laundry

# Atau gunakan Docker
docker build -t laundry-frontend .
docker run -p 80:80 laundry-frontend
```

#### 4. Docker
```bash
cd frontend
docker build -t laundry-frontend .
docker run -p 80:80 laundry-frontend
```

**Penting:** Semua konfigurasi deployment sudah include **SPA routing support** agar URL seperti `/tracking/LDR2401070123` berfungsi dengan baik di production.

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/laundry_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL sudah running
- Periksa credentials di DATABASE_URL
- Pastikan database sudah dibuat

### CORS Error
- Pastikan FRONTEND_URL di backend .env sesuai
- Check cors configuration di backend/src/index.ts

### QR Code tidak muncul
- Pastikan order sudah tersimpan dengan benar
- Check console untuk error
- Pastikan frontend URL sudah benar di backend .env

### Routing / 404 Error di Production
**Problem:** URL seperti `/tracking/LDR123` mengembalikan 404 saat refresh atau akses langsung.

**Solution:**
- ✅ **Netlify/Vercel:** File `_redirects` atau `vercel.json` sudah ada - otomatis terhandle
- ✅ **Nginx:** Pastikan sudah ada `try_files $uri $uri/ /index.html;` di config
- ✅ **Apache:** File `.htaccess` harus ada di root directory setelah build
- ✅ **Docker:** Gunakan Dockerfile yang sudah disediakan dengan nginx config

**Development:** URL routing sudah otomatis bekerja dengan `npm run dev`

### URL tidak berubah saat navigasi
- Pastikan menggunakan `<Link>` dari `react-router-dom`, bukan `<a>` tag
- Pastikan `BrowserRouter` sudah wrap seluruh App component
- Check console untuk error dari React Router

## License

MIT

## Support

Untuk pertanyaan atau bantuan, silakan buka issue di repository ini.
