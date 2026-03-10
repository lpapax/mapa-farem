// backend/src/db/seed.js
// Run: node src/db/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import farmsData from '../../../frontend/src/data/farms.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('admin1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zemeplocha.cz' },
    update: {},
    create: { name: 'Admin', email: 'admin@zemeplocha.cz', passwordHash: adminHash, role: 'ADMIN' },
  });

  // Demo farmer
  const farmerHash = await bcrypt.hash('farmer1234', 12);
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@zemeplocha.cz' },
    update: {},
    create: { name: 'Jan Farmář', email: 'farmer@zemeplocha.cz', passwordHash: farmerHash, role: 'FARMER' },
  });

  // Demo customer
  const custHash = await bcrypt.hash('customer1234', 12);
  await prisma.user.upsert({
    where: { email: 'zakaznik@zemeplocha.cz' },
    update: {},
    create: { name: 'Jana Zákazníková', email: 'zakaznik@zemeplocha.cz', passwordHash: custHash, role: 'CUSTOMER' },
  });

  // Seed farms (first 5 with real farmer, rest anonymous)
  let farmerAssigned = false;
  for (const f of farmsData.slice(0, 50)) {
    const ownerId = !farmerAssigned ? farmer.id : admin.id;
    farmerAssigned = true;

    try {
      const farm = await prisma.farm.create({
        data: {
          ownerId,
          name: f.name,
          description: f.description || `Rodinná farma v regionu ${f.loc}.`,
          type: f.type,
          lat: f.lat,
          lng: f.lng,
          address: f.loc,
          city: f.loc.split(',')[0],
          region: f.loc,
          phone: f.phone,
          hours: f.hours,
          bio: f.bio,
          delivery: f.delivery || false,
          eshop: f.eshop || false,
          founded: f.founded || null,
          hectares: f.hectares || null,
          verified: Math.random() > 0.5,
        },
      });

      // Add products
      for (const [i, productName] of (f.products || []).entries()) {
        const name = productName.replace(/\p{Emoji}/gu, '').trim();
        const emoji = productName.match(/\p{Emoji}/u)?.[0] || '🌿';
        await prisma.product.create({
          data: {
            farmId: farm.id,
            name: name || 'Produkt',
            emoji,
            price: Math.round((20 + Math.random() * 200) * 10) / 10,
            unit: ['kg','l','ks','balení'][i % 4],
            stock: Math.floor(Math.random() * 50),
            category: f.type,
            seasonal: Math.random() > 0.6,
          },
        });
      }

      // Seasonal offer for 30% of farms
      if (Math.random() > 0.7) {
        await prisma.seasonalOffer.create({
          data: {
            farmId: farm.id,
            title: 'Jarní sezóna 2026',
            description: 'Čerstvé produkty ze začátku sezóny.',
            emoji: '🌱',
            validFrom: new Date(),
            validTo: new Date(Date.now() + 60 * 24 * 3600 * 1000),
            discount: Math.random() > 0.5 ? Math.round(5 + Math.random() * 20) : null,
          },
        });
      }
    } catch (err) {
      console.warn(`Skipping farm ${f.name}:`, err.message);
    }
  }

  console.log('✅ Seed dokončen!');
  console.log('   👤 Admin:    admin@zemeplocha.cz / admin1234');
  console.log('   🌾 Farmář:   farmer@zemeplocha.cz / farmer1234');
  console.log('   🛒 Zákazník: zakaznik@zemeplocha.cz / customer1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
