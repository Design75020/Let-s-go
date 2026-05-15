import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';

export async function seedDemoData() {
  const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
  if (restaurantsSnapshot.size >= 4) return; // Already seeded

  console.log('Seeding demo data...');

  const restaurants = [
    {
      id: 'resto_burger',
      name: 'Burger House',
      ownerId: 'merchant_1',
      category: 'American • Burgers',
      rating: 4.8,
      status: 'open',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800',
      description: 'Les meilleurs burgers gourmets de la ville.',
      address: '12 Rue de la Paix, Paris',
      hours: {
        monday: { open: '11:00', close: '23:00' },
        tuesday: { open: '11:00', close: '23:00' },
        wednesday: { open: '11:00', close: '23:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '00:00' },
        saturday: { open: '11:00', close: '00:00' },
        sunday: { open: '12:00', close: '22:00' },
      }
    },
    {
      id: 'resto_sushi',
      name: 'Sushi Tokyo',
      ownerId: 'merchant_2',
      category: 'Japanese • Sushi',
      rating: 4.9,
      status: 'open',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
      description: 'Tradition et fraîcheur japonaise directement chez vous.',
      address: '45 Avenue des Champs-Élysées, Paris',
      hours: {
        monday: { open: '12:00', close: '22:00' },
        tuesday: { open: '12:00', close: '22:00' },
        wednesday: { open: '12:00', close: '22:00' },
        thursday: { open: '12:00', close: '22:00' },
        friday: { open: '12:00', close: '23:00' },
        saturday: { open: '12:00', close: '23:00' },
        sunday: { open: '18:00', close: '22:00' },
      }
    },
    {
      id: 'resto_pizza',
      name: 'Pizza Napoli',
      ownerId: 'merchant_3',
      category: 'Italian • Pizza',
      rating: 4.7,
      status: 'open',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
      description: 'Pizzas au feu de bois avec des ingrédients importés d\'Italie.',
      address: '8 Boulevard Saint-Germain, Paris',
      hours: {
        monday: { open: '11:00', close: '22:30' },
        tuesday: { open: '11:00', close: '22:30' },
        wednesday: { open: '11:00', close: '22:30' },
        thursday: { open: '11:00', close: '22:30' },
        friday: { open: '11:00', close: '23:30' },
        saturday: { open: '11:00', close: '23:30' },
        sunday: { open: '11:00', close: '22:00' },
      }
    },
    {
      id: 'resto_green',
      name: 'Green Bowl',
      ownerId: 'merchant_4',
      category: 'Healthy • Vegan',
      rating: 4.6,
      status: 'open',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
      description: 'Cuisine saine, équilibrée et respectueuse de l\'environnement.',
      address: '22 Rue de Rivoli, Paris',
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' },
      }
    }
  ];

  const menuItems: any = {
    resto_burger: [
      { name: 'Le Classic', price: 12.5, category: 'Burgers', available: true },
      { name: 'Cheese Explosion', price: 14.9, category: 'Burgers', available: true },
      { name: 'Frites Maison', price: 4.5, category: 'Accompagnements', available: true },
    ],
    resto_sushi: [
      { name: 'Plateau Salmon', price: 18.0, category: 'Sushi', available: true },
      { name: 'Dragon Roll', price: 16.5, category: 'Maki', available: true },
      { name: 'Miso Soup', price: 3.5, category: 'Entrées', available: true },
    ],
    resto_pizza: [
      { name: 'Margherita', price: 10.0, category: 'Pizza', available: true },
      { name: 'Regina', price: 13.5, category: 'Pizza', available: true },
      { name: 'Tiramisu', price: 6.0, category: 'Desserts', available: true },
    ],
    resto_green: [
      { name: 'Buddha Bowl', price: 14.0, category: 'Bowls', available: true },
      { name: 'Smoothie Vert', price: 7.5, category: 'Boissons', available: true },
      { name: 'Avocado Toast', price: 11.5, category: 'Brunch', available: true },
    ]
  };

  const batch = writeBatch(db);

  for (const resto of restaurants) {
    const restoRef = doc(db, 'restaurants', resto.id);
    batch.set(restoRef, { ...resto, createdAt: serverTimestamp() });

    const items = menuItems[resto.id];
    for (const item of items) {
      const itemRef = doc(collection(db, 'restaurants', resto.id, 'menuItems'));
      batch.set(itemRef, { ...item, restaurantId: resto.id, createdAt: serverTimestamp() });
    }
  }

  // Seed 2 Drivers
  const drivers = [
    { uid: 'driver_1', name: 'Marco Driver', email: 'marco@lgf.com', role: 'driver', available: true, kyc: { status: 'approved' } },
    { uid: 'driver_2', name: 'Sophie Livreuse', email: 'sophie@lgf.com', role: 'driver', available: true, kyc: { status: 'pending' } },
  ];

  for (const driver of drivers) {
    batch.set(doc(db, 'users', driver.uid), { ...driver, createdAt: serverTimestamp() });
  }

  // Seed 2 Clients
  const clients = [
    { uid: 'client_1', name: 'Jean Client', email: 'jean@gmail.com', role: 'client' },
    { uid: 'client_2', name: 'Emma Foodie', email: 'emma@gmail.com', role: 'client' },
  ];

  for (const client of clients) {
    batch.set(doc(db, 'users', client.uid), { ...client, createdAt: serverTimestamp() });
  }

  await batch.commit();
  console.log('Seed completed successfully.');
}
