import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma Seeding...');

  // 1. Clear existing data
  await prisma.order.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (including Drivers)
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@letsgofood.fr', name: 'Super Admin' } }),
    prisma.user.create({ data: { email: 'client1@test.com', name: 'John Doe' } }),
    prisma.user.create({ data: { email: 'client2@test.com', name: 'Jane Smith' } }),
    prisma.user.create({ data: { email: 'driver1@letsgofood.fr', name: 'Marco (Driver 1)' } }),
    prisma.user.create({ data: { email: 'driver2@letsgofood.fr', name: 'Sophie (Driver 2)' } }),
    prisma.user.create({ data: { email: 'driver3@letsgofood.fr', name: 'Ahmed (Driver 3)' } }),
    prisma.user.create({ data: { email: 'driver4@letsgofood.fr', name: 'Lucia (Driver 4)' } }),
    prisma.user.create({ data: { email: 'driver5@letsgofood.fr', name: 'Jean (Driver 5)' } }),
  ]);

  const drivers = users.filter(u => u.name?.includes('(Driver'));
  const customers = users.filter(u => !u.name?.includes('(Driver') && u.email !== 'admin@letsgofood.fr');

  // 3. Create Restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.create({ data: { name: 'Burger House', location: 'Paris Centre' } }),
    prisma.restaurant.create({ data: { name: 'Sushi Zen', location: 'Paris 15' } }),
    prisma.restaurant.create({ data: { name: 'Pasta Viva', location: 'Lyon' } }),
    prisma.restaurant.create({ data: { name: 'Le Bistro', location: 'Paris Centre' } }),
    prisma.restaurant.create({ data: { name: 'Pizza Flash', location: 'Marseille' } }),
  ]);

  // 4. Create Initial Orders
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const total = 15 + Math.random() * 40;
    
    await prisma.order.create({
      data: {
        userId: customer.id,
        restaurantId: restaurant.id,
        total,
        status: Math.random() > 0.8 ? 'COMPLETED' : 'PENDING',
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Last hour
        ledgerEntries: {
          create: {
            type: 'CREDIT',
            amount: total,
            purpose: 'PAYMENT',
            status: 'COMPLETED'
          }
        }
      }
    });
  }

  console.log(`✅ Seeded ${users.length} users, ${restaurants.length} restaurants, and initial orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
