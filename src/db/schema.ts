import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['customer', 'admin'] })
    .notNull()
    .default('customer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  organizerName: text('organizer_name').notNull(),
  organizerBio: text('organizer_bio').notNull(),
  venue: text('venue').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  timezone: text('timezone').notNull().default('America/New_York'),
  startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] })
    .notNull()
    .default('published'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const ticketTypes = sqliteTable('ticket_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  capacity: integer('capacity').notNull(),
  sold: integer('sold').notNull().default(0),
});

export const eventSeats = sqliteTable(
  'event_seats',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    ticketTypeId: integer('ticket_type_id')
      .notNull()
      .references(() => ticketTypes.id),
    rowLabel: text('row_label').notNull(),
    seatNumber: integer('seat_number').notNull(),
    label: text('label').notNull(),
    position: integer('position').notNull(),
    status: text('status', { enum: ['available', 'sold', 'blocked'] })
      .notNull()
      .default('available'),
  },
  (table) => ({
    uniqueSeat: uniqueIndex('event_seat_position_idx').on(
      table.eventId,
      table.rowLabel,
      table.seatNumber
    ),
  })
);

export const seatHolds = sqliteTable('seat_holds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seatId: integer('seat_id')
    .notNull()
    .references(() => eventSeats.id, { onDelete: 'cascade' })
    .unique(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const favorites = sqliteTable(
  'favorites',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniqueFavorite: uniqueIndex('favorites_user_event_idx').on(table.userId, table.eventId),
  })
);

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  bookingCode: text('booking_code').notNull().unique(),
  attendeeName: text('attendee_name').notNull(),
  attendeeEmail: text('attendee_email').notNull(),
  status: text('status', { enum: ['confirmed', 'cancelled'] })
    .notNull()
    .default('confirmed'),
  paymentStatus: text('payment_status', { enum: ['paid', 'failed'] }).notNull(),
  subtotal: real('subtotal').notNull(),
  serviceFee: real('service_fee').notNull(),
  total: real('total').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bookingItems = sqliteTable('booking_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  seatId: integer('seat_id').references(() => eventSeats.id),
  seatLabel: text('seat_label'),
  ticketTypeId: integer('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id),
  ticketTypeName: text('ticket_type_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
});

export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  seatId: integer('seat_id').references(() => eventSeats.id),
  seatLabel: text('seat_label'),
  bookingItemId: integer('booking_item_id')
    .notNull()
    .references(() => bookingItems.id, { onDelete: 'cascade' }),
  ticketCode: text('ticket_code').notNull().unique(),
  status: text('status', { enum: ['valid', 'used'] })
    .notNull()
    .default('valid'),
});
