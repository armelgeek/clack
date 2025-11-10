import {
  boolean,
  pgTable,
  text,
  timestamp,
  numeric,
  varchar,
  json,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  birthday: varchar('birthday', { length: 10 }),
  image: text('image'),
  role: text('role').notNull().default('user'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  status: boolean('status').notNull().default(true),
});

export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  address: text('address').notNull(),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  openingHours: json('opening_hours'), // JSON depuis Google Maps
  status: text('status').default('ACTIVATED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const products = pgTable(
  'products',
  {
    id: text('id').notNull().unique(),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').references(() => categories.id),
    priceHT: numeric('price_ht').notNull().$type<number>(),
    priceTTC: numeric('price_ttc').notNull().$type<number>(),
    vat: text('vat').notNull(),
    status: text('status').notNull().default('ACTIVATED'),
    quantity: numeric('quantity').notNull().$type<number>(),
    owner: text('owner').notNull().default('VAPOSTORE'), // VAPOSTORE / OTHER
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    pk: primaryKey(table.id, table.storeId), // ✅ composite key
  }),
);

export const productImages = pgTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull(),
    storeId: text('store_id').notNull(),
    url: text('url').notNull(),
    filename: text('filename').notNull(),
    objectKey: text('object_key').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    productsFk: foreignKey({
      columns: [table.productId, table.storeId],
      foreignColumns: [products.id, products.storeId],
    }).onDelete('cascade'),
  }),
);

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: text('id').notNull().primaryKey(),
    productId: text('product_id').notNull(),
    storeId: text('store_id').notNull(),
    type: text('type').notNull(), // IN / OUT
    quantity: numeric('quantity').notNull().$type<number>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    productsFk: foreignKey({
      columns: [table.productId, table.storeId],
      foreignColumns: [products.id, products.storeId],
    }).onDelete('cascade'),
  }),
);

export const userInventoryPreferences = pgTable('user_inventory_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  isNotified: boolean('is_notified').notNull().default(true),
  minThreshold: numeric('min_threshold').notNull().default('5').$type<number>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const storeUsers = pgTable('store_users', {
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  impersonatedBy: text('impersonated_by').references(() => users.id),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const notifications = pgTable('notifications', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text('type').notNull(), // STORE_STATUS_CHANGE, ...
  data: json('data'),
  isSeen: boolean('is_seen').default(false).notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  redirectUrl: text('redirect_url'),
  platform: text('platform').notNull(), // CUSTOMER, STORE_ADMIN, SUPER_ADMIN
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const externalStoreMappings = pgTable('external_store_mappings', {
  externalCompanyId: integer('external_company_id').notNull(),
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
});

export const storeFolders = pgTable('store_folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  storeId: text('store_id'),
  parentId: text('parent_id'), // null si dossier racine
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const headBand = pgTable('head_bands', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const carts = pgTable('carts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'), // active, saved, merged
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  storeId: text('store_id').notNull(),
  quantity: numeric('quantity').notNull().$type<number>(),
  isSelected: boolean('is_selected').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const storeUsersRelations = relations(storeUsers, ({ one }) => ({
  store: one(stores, {
    fields: [storeUsers.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeUsers.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [products.category],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
}));

export const userInventoryPreferencesRelations = relations(
  userInventoryPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userInventoryPreferences.userId],
      references: [users.id],
    }),
  }),
);

export const storesRelations = relations(stores, ({ many }) => ({
  storeUsers: many(storeUsers),
  products: many(products),
}));

export const usersRelations = relations(users, ({ many }) => ({
  storeUsers: many(storeUsers),
}));

export const externalStoreMappingsRelations = relations(
  externalStoreMappings,
  ({ one }) => ({
    store: one(stores, {
      fields: [externalStoreMappings.storeId],
      references: [stores.id],
    }),
  }),
);

export const storeFoldersRelations = relations(
  storeFolders,
  ({ one, many }) => ({
    parent: one(storeFolders, {
      fields: [storeFolders.parentId],
      references: [storeFolders.id],
    }),

    children: many(storeFolders),
  }),
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type ExternalStoreMappings = typeof externalStoreMappings.$inferSelect;
export type NewExternalStoreMappings =
  typeof externalStoreMappings.$inferInsert;
export type StoreFolder = typeof storeFolders.$inferSelect;
export type NewStoreFolder = typeof storeFolders.$inferInsert;

export type HeadBand = typeof headBand.$inferSelect;
export type NewHeadBand = typeof headBand.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
