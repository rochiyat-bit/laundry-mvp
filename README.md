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

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio untuk melihat database
npm run prisma:studio
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

## Default User Credentials

Setelah setup, Anda perlu membuat user pertama melalui endpoint register atau langsung via database.

Contoh membuat admin via Prisma Studio atau SQL:

```sql
INSERT INTO users (id, email, password, name, role)
VALUES (
  gen_random_uuid(),
  'admin@laundry.com',
  '$2a$10$...', -- hash dari password menggunakan bcrypt
  'Admin User',
  'ADMIN'
);
```

Atau register via API kemudian update role di database.

## Workflow Aplikasi

### 1. Setup Services
Admin/Staff menambahkan layanan laundry beserta harganya (misalnya: Cuci Kering, Setrika, dll)

### 2. Create Order
- Customer atau Staff membuat pesanan
- Pilih layanan dan jumlah
- Sistem menghitung total otomatis
- Order dibuat dengan status PENDING

### 3. QR Code Generation
- Sistem otomatis generate QR code untuk setiap pesanan
- QR code berisi link ke tracking page
- QR code dapat di-download

### 4. Order Processing
Staff update status pesanan melalui tahapan:
- PENDING → PROCESSING → WASHING → DRYING → IRONING → READY → DELIVERED

### 5. Order Tracking
- Customer scan QR code atau akses tracking URL
- Lihat status real-time tanpa perlu login
- Lihat detail items dan riwayat status

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

Deploy folder `dist/` ke static hosting (Vercel, Netlify, dll) dan backend ke service seperti Heroku, Railway, atau DigitalOcean.

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

## License

MIT

## Support

Untuk pertanyaan atau bantuan, silakan buka issue di repository ini.
