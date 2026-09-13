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

// LoremFlickr serves a real (if random) photo per keyword — good enough for
// demo listings without needing to source and store our own images.
function photo(keyword) {
  return `https://loremflickr.com/600/600/${keyword}`;
}

const sellers = [
  {
    key: 'demo',
    name: 'Demo Sotuvchi',
    email: 'demo@ebayuz.uz',
    city: 'Tashkent',
    phone: '+998901234567',
  },
  {
    key: 'aziz',
    name: 'Aziz Karimov',
    email: 'aziz@ebayuz.uz',
    city: 'Samarkand',
    phone: '+998933451122',
  },
];

const listings = [
  // Electronics
  {
    title: 'iPhone 14 Pro, 256GB',
    description: 'Yangi holatda, kafolat bilan. Toshkentda yetkazib berish mavjud.',
    price: 9500000,
    city: 'Tashkent',
    category: 'electronics',
    seller: 'demo',
    image: photo('iphone'),
  },
  {
    title: 'Samsung Galaxy S24 Ultra, 512GB',
    description: "Ishlatilmagan, quti va aksessuarlari to'liq. Rasmiy do'kondan sotib olingan.",
    price: 13000000,
    city: 'Tashkent',
    category: 'electronics',
    seller: 'aziz',
    image: photo('smartphone'),
  },
  {
    title: 'Apple MacBook Air M2, 2023',
    description: "8GB/256GB, deyarli yangi, oz ishlatilgan. Dasturchilar uchun ideal.",
    price: 15500000,
    city: 'Samarkand',
    category: 'electronics',
    seller: 'aziz',
    image: photo('macbook'),
  },
  // Vehicles
  {
    title: 'Chevrolet Cobalt 2021',
    description: 'Yaxshi holatda, 45 000 km yurgan, bir egasidan.',
    price: 130000000,
    city: 'Samarkand',
    category: 'vehicles',
    seller: 'demo',
    image: photo('sedan-car'),
  },
  {
    title: 'Chevrolet Lacetti 2019, gaz-benzin',
    description: "To'liq texnik ko'rikdan o'tgan, gaz uskunasi o'rnatilgan.",
    price: 95000000,
    city: 'Fergana',
    category: 'vehicles',
    seller: 'demo',
    image: photo('hatchback-car'),
  },
  {
    title: 'Yamaha YBR 125 mototsikl',
    description: '2022 yil, 8000 km yurgan, texnik holati a\'lo.',
    price: 18000000,
    city: 'Andijan',
    category: 'vehicles',
    seller: 'aziz',
    image: photo('motorcycle'),
  },
  // Real estate
  {
    title: "3-xonali kvartira, Chilonzor",
    description: "80 m², 5/9 qavat, yevroremont, mebel bilan. Metro yaqin.",
    price: 850000000,
    city: 'Tashkent',
    category: 'real-estate',
    seller: 'demo',
    image: photo('apartment-interior'),
  },
  {
    title: 'Hovli uy, 6 sotix',
    description: "Yangi qurilgan, 2 qavatli, barcha kommunikatsiyalar mavjud.",
    price: 620000000,
    city: 'Samarkand',
    category: 'real-estate',
    seller: 'aziz',
    image: photo('house-exterior'),
  },
  // Home & garden
  {
    title: 'Divan burchakli, yangi',
    description: "Yumshoq mebel, yuvilishi oson mato, ochiladigan mexanizm bilan.",
    price: 4200000,
    city: 'Bukhara',
    category: 'home-garden',
    seller: 'demo',
    image: photo('sofa'),
  },
  {
    title: 'Oshxona garniturasi, MDF',
    description: "Buyurtma asosida tayyorlangan, o'lchamlar moslashtiriladi.",
    price: 7800000,
    city: 'Namangan',
    category: 'home-garden',
    seller: 'aziz',
    image: photo('kitchen-cabinet'),
  },
  // Fashion
  {
    title: "Erkaklar kostyumi, Italiya matosi",
    description: "48-50 razmer, faqat bir marta kiyilgan, quti bilan.",
    price: 950000,
    city: 'Tashkent',
    category: 'fashion',
    seller: 'demo',
    image: photo('mens-suit'),
  },
  {
    title: "Ayollar qishki kurtkasi, XL",
    description: "Puxlik ichlik, -20°C gacha issiq saqlaydi.",
    price: 620000,
    city: 'Fergana',
    category: 'fashion',
    seller: 'aziz',
    image: photo('winter-jacket'),
  },
  // Jobs
  {
    title: "Frontend dasturchi kerak (React)",
    description: "To'liq stavka, ofisda ishlash, tajriba 1 yildan boshlab.",
    price: 8000000,
    city: 'Tashkent',
    category: 'jobs',
    seller: 'demo',
    image: photo('office-work'),
  },
  {
    title: "Haydovchi (B toifa) talab qilinadi",
    description: "Yetkazib berish xizmati uchun, ish grafigi kelishiladi.",
    price: 4500000,
    city: 'Nukus',
    category: 'jobs',
    seller: 'aziz',
    image: photo('delivery-driver'),
  },
  // Services
  {
    title: "Kvartira remonti, kalit topshirish",
    description: "Boshlang'ich narx, aniq smeta ob'ektni ko'rgandan keyin beriladi.",
    price: 5000000,
    city: 'Tashkent',
    category: 'services',
    seller: 'demo',
    image: photo('home-renovation'),
  },
  {
    title: "Kompyuter va noutbuk ta'mirlash",
    description: "Diagnostika bepul, chiqib borish xizmati mavjud.",
    price: 150000,
    city: 'Bukhara',
    category: 'services',
    seller: 'aziz',
    image: photo('computer-repair'),
  },
  // Kids
  {
    title: "Bolalar velosipedi, 16 dyum",
    description: "4-7 yosh oralig'i uchun, yordamchi g'ildiraklar bilan.",
    price: 890000,
    city: 'Andijan',
    category: 'kids',
    seller: 'demo',
    image: photo('kids-bicycle'),
  },
  {
    title: "O'yinchoqlar to'plami, 3-6 yosh",
    description: "Rivojlantiruvchi o'yinchoqlar, xavfsiz material.",
    price: 320000,
    city: 'Namangan',
    category: 'kids',
    seller: 'aziz',
    image: photo('kids-toys'),
  },
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
  const sellerByKey = {};
  for (const s of sellers) {
    sellerByKey[s.key] = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, password, city: s.city, phone: s.phone },
    });
  }

  const categoryBySlug = {};
  for (const c of categories) {
    categoryBySlug[c.slug] = await prisma.category.findUnique({ where: { slug: c.slug } });
  }

  // Idempotent by title, so re-running the seed only fills in what's missing
  // instead of duplicating listings every time.
  for (const l of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: l.title } });
    if (existing) continue;
    await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        price: l.price,
        currency: 'UZS',
        city: l.city,
        categoryId: categoryBySlug[l.category].id,
        sellerId: sellerByKey[l.seller].id,
        imageUrl: l.image,
      },
    });
  }
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
