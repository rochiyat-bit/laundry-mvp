import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you don't want to clear)
  console.log('🗑️  Clearing existing data...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👤 Creating users...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@laundry.com',
      password: adminPassword,
      name: 'Admin Laundry',
      phone: '+62 812 3456 7890',
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@laundry.com',
      password: staffPassword,
      name: 'Staff Laundry',
      phone: '+62 813 4567 8901',
      role: 'STAFF',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Budi Santoso',
      phone: '+62 821 1111 2222',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'siti@example.com',
      password: customerPassword,
      name: 'Siti Nurhaliza',
      phone: '+62 822 3333 4444',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created');

  // Create Services
  console.log('🧺 Creating laundry services...');

  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Cuci Kering',
        description: 'Layanan cuci dan kering dengan mesin modern',
        unit: 'kg',
        price: 7000,
        isActive: true,
      },
      {
        name: 'Cuci Setrika',
        description: 'Paket cuci, kering, dan setrika rapi',
        unit: 'kg',
        price: 10000,
        isActive: true,
      },
      {
        name: 'Setrika Saja',
        description: 'Khusus setrika untuk pakaian bersih',
        unit: 'kg',
        price: 5000,
        isActive: true,
      },
      {
        name: 'Dry Cleaning',
        description: 'Dry cleaning untuk pakaian premium (jas, gaun, dll)',
        unit: 'pcs',
        price: 25000,
        isActive: true,
      },
      {
        name: 'Cuci Sepatu',
        description: 'Cuci sepatu dengan treatment khusus',
        unit: 'pcs',
        price: 15000,
        isActive: true,
      },
      {
        name: 'Cuci Boneka',
        description: 'Cuci boneka ukuran sedang-besar',
        unit: 'pcs',
        price: 20000,
        isActive: true,
      },
      {
        name: 'Cuci Karpet',
        description: 'Cuci karpet dengan mesin khusus',
        unit: 'kg',
        price: 12000,
        isActive: true,
      },
      {
        name: 'Express 3 Jam',
        description: 'Layanan express selesai dalam 3 jam (tambahan)',
        unit: 'kg',
        price: 15000,
        isActive: true,
      },
    ],
  });

  console.log('✅ Services created');

  // Create Sample Orders
  console.log('📦 Creating sample orders...');

  const allServices = await prisma.service.findMany();
  const cuciKering = allServices.find((s) => s.name === 'Cuci Kering');
  const cuciSetrika = allServices.find((s) => s.name === 'Cuci Setrika');
  const dryCleaning = allServices.find((s) => s.name === 'Dry Cleaning');

  if (cuciKering && cuciSetrika && dryCleaning) {
    // Order 1 - Completed
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'LDR2401010001',
        customerId: customer1.id,
        status: 'DELIVERED',
        totalAmount: 70000,
        notes: 'Pisahkan pakaian putih dan berwarna',
        deliveryDate: new Date('2024-01-05'),
        items: {
          create: [
            {
              serviceId: cuciKering.id,
              quantity: 5,
              price: cuciKering.price,
              subtotal: cuciKering.price * 5,
            },
            {
              serviceId: cuciSetrika.id,
              quantity: 3,
              price: cuciSetrika.price,
              subtotal: cuciSetrika.price * 3,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: 'PENDING', notes: 'Order dibuat' },
            { status: 'PROCESSING', notes: 'Sedang diproses' },
            { status: 'WASHING', notes: 'Sedang dicuci' },
            { status: 'DRYING', notes: 'Sedang dikeringkan' },
            { status: 'IRONING', notes: 'Sedang disetrika' },
            { status: 'READY', notes: 'Siap diambil' },
            { status: 'DELIVERED', notes: 'Sudah diambil customer' },
          ],
        },
      },
    });

    // Order 2 - In Progress (Washing)
    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'LDR2401150001',
        customerId: customer2.id,
        status: 'WASHING',
        totalAmount: 100000,
        notes: 'Pakai pewangi lavender',
        pickupDate: new Date(),
        items: {
          create: [
            {
              serviceId: dryCleaning.id,
              quantity: 2,
              price: dryCleaning.price,
              subtotal: dryCleaning.price * 2,
            },
            {
              serviceId: cuciSetrika.id,
              quantity: 5,
              price: cuciSetrika.price,
              subtotal: cuciSetrika.price * 5,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: 'PENDING', notes: 'Order dibuat' },
            { status: 'PROCESSING', notes: 'Sedang diproses' },
            { status: 'WASHING', notes: 'Sedang dicuci' },
          ],
        },
      },
    });

    // Order 3 - Pending
    const order3 = await prisma.order.create({
      data: {
        orderNumber: 'LDR2401180001',
        customerId: customer1.id,
        status: 'PENDING',
        totalAmount: 35000,
        notes: 'Cuci biasa saja',
        items: {
          create: [
            {
              serviceId: cuciKering.id,
              quantity: 5,
              price: cuciKering.price,
              subtotal: cuciKering.price * 5,
            },
          ],
        },
        statusHistory: {
          create: [{ status: 'PENDING', notes: 'Order baru dibuat' }],
        },
      },
    });

    console.log('✅ Sample orders created');
  }

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📋 Summary:');
  console.log('-----------------------------------');
  console.log('👤 Users:');
  console.log('   Admin   : admin@laundry.com / admin123');
  console.log('   Staff   : staff@laundry.com / staff123');
  console.log('   Customer: customer@example.com / customer123');
  console.log('   Customer: siti@example.com / customer123');
  console.log('\n🧺 Services: 8 laundry services');
  console.log('📦 Orders: 3 sample orders');
  console.log('-----------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
