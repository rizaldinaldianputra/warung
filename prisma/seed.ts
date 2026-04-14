import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // 1. Clear existing data (optional, but good for clean seed)
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('user123', 10);

  // 3. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@warung.com' },
    update: {},
    create: {
      name: 'Admin Warung',
      email: 'admin@warung.com',
      password: adminPassword,
      role: 'admin',
      phone: '081234567890',
      address: 'Kantor Pusat Warung CO',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'budi@gmail.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: customerPassword,
      role: 'customer',
      phone: '08987654321',
      address: 'Jl. Melati No. 12, Jakarta',
    },
  });

  console.log('Users created:', { admin: admin.email, customer: customer.email });

  // 4. Create some initial products for shopping
  const products = [
    {
      name: 'Beras Pandan Wangi',
      sku: 'SKU-BRS-001',
      category: 'Sembako',
      unit: 'karung 5kg',
      price: 75000,
      stock: 100,
      isPreOrder: false,
      description: 'Beras kualitas super dari Cianjur, nasi pulen dan wangi alami.',
    },
    {
      name: 'Minyak Goreng Bimoli',
      sku: 'SKU-MYK-002',
      category: 'Sembako',
      unit: 'liter',
      price: 18500,
      stock: 50,
      isPreOrder: false,
      description: 'Minyak goreng kelapa sawit bermutu tinggi.',
    },
    {
      name: 'Telur Ayam Negeri',
      sku: 'SKU-TLR-003',
      category: 'Sembako',
      unit: 'kg',
      price: 28000,
      stock: 200,
      isPreOrder: false,
      description: 'Telur ayam segar harian, langsung dari peternakan.',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        price: BigInt(p.price),
        stock: p.stock,
      },
      create: {
        ...p,
        price: BigInt(p.price),
      },
    });
  }

  console.log('Products created:', products.length);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
