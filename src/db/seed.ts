import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { categories, eventSeats, events, ticketTypes, users } from './schema';

const now = new Date();
const future = (days: number, hour: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour, 0, 0);

const categoryData = [
  ['Music', 'music'],
  ['Sports', 'sports'],
  ['Technology', 'technology'],
  ['Business', 'business'],
  ['Food', 'food'],
  ['Arts', 'arts'],
  ['Entertainment', 'entertainment'],
] as const;

const eventData = [
  {
    title: 'Neon Nights: Rooftop Sessions',
    slug: 'neon-nights-rooftop-sessions',
    category: 'music',
    description:
      'A luminous night of live electronic sets, skyline views, and creative cocktails from the city’s most exciting selectors.',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85',
    organizerName: 'Electric City Collective',
    organizerBio: 'Curators of immersive music experiences across the city.',
    venue: 'The Glasshouse',
    address: '88 Mercer Street',
    city: 'New York',
    startsAt: future(12, 20),
    endsAt: future(13, 1),
    featured: true,
    tickets: [
      ['General Admission', 42, 300],
      ['VIP Deck Access', 95, 80],
    ],
  },
  {
    title: 'Future Forward Summit',
    slug: 'future-forward-summit',
    category: 'technology',
    description:
      'Two days of bold ideas, practical workshops, and candid conversations about building what comes next.',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85',
    organizerName: 'Northstar Labs',
    organizerBio: 'Independent community for builders, founders, and curious minds.',
    venue: 'Pier 36',
    address: '299 South Street',
    city: 'New York',
    startsAt: future(24, 9),
    endsAt: future(25, 17),
    featured: true,
    tickets: [
      ['Standard Pass', 149, 500],
      ['Founder Pass', 299, 120],
    ],
  },
  {
    title: 'Midnight Runners Club',
    slug: 'midnight-runners-club',
    category: 'sports',
    description:
      'A city-wide 10K under the lights, paced by local crews and finished with a late-night recovery party.',
    imageUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=85',
    organizerName: 'Run After Dark',
    organizerBio: 'Movement, music, and community after sunset.',
    venue: 'Brooklyn Bridge Park',
    address: '334 Furman Street',
    city: 'Brooklyn',
    startsAt: future(7, 22),
    endsAt: future(8, 1),
    featured: true,
    tickets: [
      ['Runner Entry', 35, 700],
      ['Crew Bundle', 120, 100],
    ],
  },
  {
    title: 'The Long Table',
    slug: 'the-long-table',
    category: 'food',
    description:
      'A communal tasting journey with six neighborhood chefs, seasonal ingredients, and one unforgettable table.',
    imageUrl:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=85',
    organizerName: 'City Table',
    organizerBio: 'Connecting people through great food and the stories behind it.',
    venue: 'The Foundry',
    address: '42 Wythe Avenue',
    city: 'Brooklyn',
    startsAt: future(17, 19),
    endsAt: future(17, 23),
    featured: false,
    tickets: [['Tasting Seat', 110, 90]],
  },
  {
    title: 'Open Studio: Modern Print',
    slug: 'open-studio-modern-print',
    category: 'arts',
    description:
      'Meet the artists, explore the presses, and take home a limited edition print from this season’s open studio.',
    imageUrl:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1400&q=85',
    organizerName: 'Foundry Arts',
    organizerBio: 'A working studio for contemporary printmakers.',
    venue: 'Foundry Arts Center',
    address: '17 Franklin Street',
    city: 'Brooklyn',
    startsAt: future(31, 13),
    endsAt: future(31, 18),
    featured: false,
    tickets: [['General Entry', 18, 180]],
  },
];

async function seed() {
  for (const [name, slug] of categoryData)
    db.insert(categories).values({ name, slug }).onConflictDoNothing().run();
  const categoryRows = db.select().from(categories).all();
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const userHash = await bcrypt.hash('Welcome123!', 10);
  db.insert(users)
    .values({
      name: 'EventHub Admin',
      email: 'admin@eventhub.local',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();
  db.insert(users)
    .values({
      name: 'Demo Attendee',
      email: 'demo@eventhub.local',
      passwordHash: userHash,
      role: 'customer',
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();
  for (const event of eventData) {
    if (db.select().from(events).where(eq(events.slug, event.slug)).get()) continue;
    const category = categoryRows.find((item) => item.slug === event.category);
    if (!category) continue;
    const { tickets: eventTickets, ...eventValues } = event;
    const inserted = db
      .insert(events)
      .values({ ...eventValues, categoryId: category.id, createdAt: now, status: 'published' })
      .returning({ id: events.id })
      .get();
    for (const [name, price, capacity] of eventTickets)
      db.insert(ticketTypes)
        .values({
          eventId: Number(inserted.id),
          name,
          price,
          capacity,
          sold: 0,
        } as typeof ticketTypes.$inferInsert)
        .run();
    if (event.slug === 'neon-nights-rooftop-sessions') {
      const tiers = db.select().from(ticketTypes).where(eq(ticketTypes.eventId, inserted.id)).all();
      for (const [rowIndex, rowLabel] of ['A', 'B', 'C', 'D'].entries()) {
        for (let seatNumber = 1; seatNumber <= 8; seatNumber++) {
          const tier = seatNumber <= 4 ? tiers[0] : (tiers[1] ?? tiers[0]);
          if (tier)
            db.insert(eventSeats)
              .values({
                eventId: inserted.id,
                ticketTypeId: tier.id,
                rowLabel,
                seatNumber,
                label: `${rowLabel}${seatNumber}`,
                position: rowIndex * 8 + seatNumber,
                status: 'available',
              })
              .run();
        }
      }
    }
  }
  console.log(
    'EventHub seed complete. Demo user: demo@eventhub.local / Welcome123! Admin: admin@eventhub.local / Admin123!'
  );
}
seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
