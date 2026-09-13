const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Two-level category tree, OLX-style: each top-level category has a fixed
// set of subcategories. Listings are tagged to the most specific (leaf)
// category that applies; the listings API treats selecting a parent as
// "this category or any of its children" (see listings.js).
const categoryTree = [
  {
    slug: 'electronics', name: 'Electronics', nameUz: 'Elektronika',
    children: [
      { slug: 'phones', name: 'Phones', nameUz: 'Telefonlar' },
      { slug: 'computers', name: 'Computers', nameUz: 'Kompyuterlar' },
      { slug: 'photo-video', name: 'Photo & Video', nameUz: 'Foto/video' },
      { slug: 'tv-video', name: 'TV & Video', nameUz: 'TV/videotexnika' },
      { slug: 'audio', name: 'Audio', nameUz: 'Audiotexnika' },
    ],
  },
  {
    slug: 'vehicles', name: 'Vehicles', nameUz: 'Transport',
    children: [
      { slug: 'cars', name: 'Cars', nameUz: 'Yengil avtomobillar' },
      { slug: 'motorcycles', name: 'Motorcycles', nameUz: 'Mototsikllar' },
      { slug: 'trucks', name: 'Trucks', nameUz: 'Yuk mashinalari' },
      { slug: 'auto-parts', name: 'Auto parts', nameUz: 'Avto ehtiyot qismlari' },
    ],
  },
  {
    slug: 'real-estate', name: 'Real Estate', nameUz: "Ko'chmas mulk",
    children: [
      { slug: 'apartments', name: 'Apartments', nameUz: 'Kvartiralar' },
      { slug: 'houses', name: 'Houses', nameUz: 'Uylar' },
      { slug: 'land', name: 'Land', nameUz: 'Yer uchastkalari' },
      { slug: 'commercial', name: 'Commercial', nameUz: 'Ofis va tijorat' },
    ],
  },
  {
    slug: 'home-garden', name: 'Home & Garden', nameUz: "Uy va bog'",
    children: [
      { slug: 'furniture', name: 'Furniture', nameUz: 'Mebel' },
      { slug: 'kitchenware', name: 'Kitchenware', nameUz: 'Oshxona buyumlari' },
      { slug: 'garden', name: 'Garden', nameUz: "Bog' va hovli" },
      { slug: 'decor', name: 'Decor', nameUz: 'Interyer dekor' },
    ],
  },
  {
    slug: 'fashion', name: 'Fashion', nameUz: 'Kiyim-kechak',
    children: [
      { slug: 'womenswear', name: "Women's wear", nameUz: 'Ayollar kiyimi' },
      { slug: 'menswear', name: "Men's wear", nameUz: 'Erkaklar kiyimi' },
      { slug: 'shoes', name: 'Shoes', nameUz: 'Poyabzal' },
      { slug: 'accessories', name: 'Accessories', nameUz: 'Aksessuarlar' },
    ],
  },
  {
    slug: 'jobs', name: 'Jobs', nameUz: "Ish o'rinlari",
    children: [
      { slug: 'it-jobs', name: 'IT jobs', nameUz: 'IT va dasturlash' },
      { slug: 'driver-jobs', name: 'Driver jobs', nameUz: 'Haydovchilar' },
      { slug: 'sales-jobs', name: 'Sales jobs', nameUz: 'Sotuv va xizmat' },
      { slug: 'construction-jobs', name: 'Construction jobs', nameUz: 'Qurilish' },
    ],
  },
  {
    slug: 'services', name: 'Services', nameUz: 'Xizmatlar',
    children: [
      { slug: 'repair-services', name: 'Repair', nameUz: "Ta'mirlash" },
      { slug: 'beauty-services', name: 'Beauty', nameUz: "Go'zallik" },
      { slug: 'education-services', name: 'Education', nameUz: "Ta'lim" },
      { slug: 'transport-services', name: 'Transport services', nameUz: 'Tashish xizmatlari' },
    ],
  },
  {
    slug: 'kids', name: 'Kids', nameUz: 'Bolalar uchun',
    children: [
      { slug: 'toys', name: 'Toys', nameUz: "O'yinchoqlar" },
      { slug: 'kids-clothing', name: 'Kids clothing', nameUz: 'Bolalar kiyimi' },
      { slug: 'strollers', name: 'Strollers', nameUz: 'Aravachalar' },
      { slug: 'bicycles', name: 'Bicycles', nameUz: 'Velosipedlar' },
      { slug: 'school-supplies', name: 'School supplies', nameUz: 'Maktab buyumlari' },
    ],
  },
];

// Picsum is a fast, reliable CDN of stock photography — deterministic per
// seed string, so the same listing always gets the same photo. Not
// content-aware (no keyword search), but that trades a little relevance for
// much better reliability than keyword-search services.
function photo(seed) {
  return `https://picsum.photos/seed/${seed}/600/450`;
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
    category: 'phones',
    seller: 'demo',
    image: photo('iphone'),
  },
  {
    title: 'Samsung Galaxy S24 Ultra, 512GB',
    description: "Ishlatilmagan, quti va aksessuarlari to'liq. Rasmiy do'kondan sotib olingan.",
    price: 13000000,
    city: 'Tashkent',
    category: 'phones',
    seller: 'aziz',
    image: photo('smartphone'),
  },
  {
    title: 'Apple MacBook Air M2, 2023',
    description: "8GB/256GB, deyarli yangi, oz ishlatilgan. Dasturchilar uchun ideal.",
    price: 15500000,
    city: 'Samarkand',
    category: 'computers',
    seller: 'aziz',
    image: photo('macbook'),
  },
  // Vehicles
  {
    title: 'Chevrolet Cobalt 2021',
    description: 'Yaxshi holatda, 45 000 km yurgan, bir egasidan.',
    price: 130000000,
    city: 'Samarkand',
    category: 'cars',
    seller: 'demo',
    image: photo('sedan-car'),
  },
  {
    title: 'Chevrolet Lacetti 2019, gaz-benzin',
    description: "To'liq texnik ko'rikdan o'tgan, gaz uskunasi o'rnatilgan.",
    price: 95000000,
    city: 'Fergana',
    category: 'cars',
    seller: 'demo',
    image: photo('hatchback-car'),
  },
  {
    title: 'Yamaha YBR 125 mototsikl',
    description: '2022 yil, 8000 km yurgan, texnik holati a\'lo.',
    price: 18000000,
    city: 'Andijan',
    category: 'motorcycles',
    seller: 'aziz',
    image: photo('motorcycle'),
  },
  // Real estate
  {
    title: "3-xonali kvartira, Chilonzor",
    description: "80 m², 5/9 qavat, yevroremont, mebel bilan. Metro yaqin.",
    price: 850000000,
    city: 'Tashkent',
    category: 'apartments',
    seller: 'demo',
    image: photo('apartment-interior'),
  },
  {
    title: 'Hovli uy, 6 sotix',
    description: "Yangi qurilgan, 2 qavatli, barcha kommunikatsiyalar mavjud.",
    price: 620000000,
    city: 'Samarkand',
    category: 'houses',
    seller: 'aziz',
    image: photo('house-exterior'),
  },
  // Home & garden
  {
    title: 'Divan burchakli, yangi',
    description: "Yumshoq mebel, yuvilishi oson mato, ochiladigan mexanizm bilan.",
    price: 4200000,
    city: 'Bukhara',
    category: 'furniture',
    seller: 'demo',
    image: photo('sofa'),
  },
  {
    title: 'Oshxona garniturasi, MDF',
    description: "Buyurtma asosida tayyorlangan, o'lchamlar moslashtiriladi.",
    price: 7800000,
    city: 'Namangan',
    category: 'kitchenware',
    seller: 'aziz',
    image: photo('kitchen-cabinet'),
  },
  // Fashion
  {
    title: "Erkaklar kostyumi, Italiya matosi",
    description: "48-50 razmer, faqat bir marta kiyilgan, quti bilan.",
    price: 950000,
    city: 'Tashkent',
    category: 'menswear',
    seller: 'demo',
    image: photo('mens-suit'),
  },
  {
    title: "Ayollar qishki kurtkasi, XL",
    description: "Puxlik ichlik, -20°C gacha issiq saqlaydi.",
    price: 620000,
    city: 'Fergana',
    category: 'womenswear',
    seller: 'aziz',
    image: photo('winter-jacket'),
  },
  // Jobs
  {
    title: "Frontend dasturchi kerak (React)",
    description: "To'liq stavka, ofisda ishlash, tajriba 1 yildan boshlab.",
    price: 8000000,
    city: 'Tashkent',
    category: 'it-jobs',
    seller: 'demo',
    image: photo('office-work'),
  },
  {
    title: "Haydovchi (B toifa) talab qilinadi",
    description: "Yetkazib berish xizmati uchun, ish grafigi kelishiladi.",
    price: 4500000,
    city: 'Nukus',
    category: 'driver-jobs',
    seller: 'aziz',
    image: photo('delivery-driver'),
  },
  // Services
  {
    title: "Kvartira remonti, kalit topshirish",
    description: "Boshlang'ich narx, aniq smeta ob'ektni ko'rgandan keyin beriladi.",
    price: 5000000,
    city: 'Tashkent',
    category: 'repair-services',
    seller: 'demo',
    image: photo('home-renovation'),
  },
  {
    title: "Kompyuter va noutbuk ta'mirlash",
    description: "Diagnostika bepul, chiqib borish xizmati mavjud.",
    price: 150000,
    city: 'Bukhara',
    category: 'repair-services',
    seller: 'aziz',
    image: photo('computer-repair'),
  },
  // Kids
  {
    title: "Bolalar velosipedi, 16 dyum",
    description: "4-7 yosh oralig'i uchun, yordamchi g'ildiraklar bilan.",
    price: 890000,
    city: 'Andijan',
    category: 'bicycles',
    seller: 'demo',
    image: photo('kids-bicycle'),
  },
  {
    title: "O'yinchoqlar to'plami, 3-6 yosh",
    description: "Rivojlantiruvchi o'yinchoqlar, xavfsiz material.",
    price: 320000,
    city: 'Namangan',
    category: 'toys',
    seller: 'aziz',
    image: photo('kids-toys'),
  },
];

async function main() {
  for (const top of categoryTree) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { parentId: null },
      create: { name: top.name, nameUz: top.nameUz, slug: top.slug },
    });
    for (const child of top.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { parentId: parent.id },
        create: { name: child.name, nameUz: child.nameUz, slug: child.slug, parentId: parent.id },
      });
    }
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

  const allCategories = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c]));

  // Idempotent by title: re-running the seed fills in missing listings and
  // corrects any existing listing's category (e.g. after the subcategory
  // split) without duplicating rows.
  for (const l of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: l.title } });
    const categoryId = categoryBySlug[l.category].id;
    if (existing) {
      if (existing.categoryId !== categoryId) {
        await prisma.listing.update({ where: { id: existing.id }, data: { categoryId } });
      }
      continue;
    }
    await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        price: l.price,
        currency: 'UZS',
        city: l.city,
        categoryId,
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
