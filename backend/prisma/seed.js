const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', nameUz: 'Elektronika', slug: 'electronics' },
  { name: 'Vehicles', nameUz: 'Transport', slug: 'vehicles' },
  { name: 'Real Estate', nameUz: 'Ko\'chmas mulk', slug: 'real-estate' },
  { name: 'Home & Garden', nameUz: 'Uy va bog\'', slug: 'home-garden' },
  { name: 'Fashion', nameUz: 'Kiyim-kechak', slug: 'fashion' },
  { name: 'Jobs', nameUz: 'Ish o\'rinlari', slug: 'jobs' },
  { name: 'Services', nameUz: 'Xizmatlar', slug: 'services' },
  { name: 'Kids', nameUz: 'Bolalar uchun', slug: 'kids' },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const password = await bcrypt.hash('password123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'demo@ebayuz.uz' },
    update: {},
    create: {
      name: 'Demo Sotuvchi',
      email: 'demo@ebayuz.uz',
      password,
      city: 'Tashkent',
      phone: '+998901234567',
    },
  });

  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const vehicles = await prisma.category.findUnique({ where: { slug: 'vehicles' } });

  await prisma.listing.createMany({
    data: [
      {
        title: 'iPhone 14 Pro, 256GB',
        description: 'Yangi holatda, kafolat bilan. Toshkentda yetkazib berish mavjud.',
        price: 9500000,
        currency: 'UZS',
        city: 'Tashkent',
        categoryId: electronics.id,
        sellerId: seller.id,
      },
      {
        title: 'Chevrolet Cobalt 2021',
        description: 'Yaxshi holatda, 45 000 km yurgan, bir egasidan.',
        price: 130000000,
        currency: 'UZS',
        city: 'Samarkand',
        categoryId: vehicles.id,
        sellerId: seller.id,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('Seed complete');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
