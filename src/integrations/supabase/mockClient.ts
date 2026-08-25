// LOCAL PREVIEW MOCK — not for production. Enabled only when VITE_MOCK=1.
// Lets the authenticated UI render without a live Supabase backend by
// returning a signed-in session and empty/seed data for queries.
/* eslint-disable @typescript-eslint/no-explicit-any */

const now = new Date().toISOString();
const USER_ID = 'mock-user-0001';

const mockUser: any = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'aisha@example.com',
  email_confirmed_at: now,
  phone: '',
  created_at: now,
  updated_at: now,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Aisha Rahman' },
};

const mockSession: any = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: mockUser,
};

// Per-table seed data. Anything not listed returns [] for lists / null for single.
const SEED: Record<string, any[]> = {
  profiles: [{
    id: USER_ID,
    full_name: 'Aisha Rahman',
    avatar_url: null,
    onboarding_completed: true,
    created_at: now,
    updated_at: now,
  }],
  user_roles: [{
    id: 'role-1', user_id: USER_ID, role: 'admin',
    granted_by: null, granted_at: now,
  }],
};

function resultFor(table: string, single: boolean) {
  const rows = SEED[table] ?? [];
  if (single) return { data: rows[0] ?? null, error: null, count: rows.length, status: 200, statusText: 'OK' };
  return { data: rows, error: null, count: rows.length, status: 200, statusText: 'OK' };
}

// Chainable, thenable query builder. Every filter/modifier returns `this`;
// awaiting it (or calling single/maybeSingle) resolves to a PostgREST-shaped result.
function makeBuilder(table: string) {
  let single = false;
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    contains: () => builder,
    or: () => builder,
    filter: () => builder,
    match: () => builder,
    not: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    abortSignal: () => builder,
    single: () => { single = true; return builder; },
    maybeSingle: () => { single = true; return builder; },
    csv: () => builder,
    then: (resolve: any) => Promise.resolve(resultFor(table, single)).then(resolve),
    catch: () => builder,
    finally: () => builder,
  };
  return builder;
}

const noopChannel: any = {
  on: () => noopChannel,
  subscribe: (cb?: any) => { if (cb) setTimeout(() => cb('SUBSCRIBED'), 0); return noopChannel; },
  unsubscribe: () => Promise.resolve('ok'),
  send: () => Promise.resolve('ok'),
};

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: mockSession }, error: null }),
    getUser: async () => ({ data: { user: mockUser }, error: null }),
    onAuthStateChange: (cb: any) => {
      setTimeout(() => cb('SIGNED_IN', mockSession), 0);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signUp: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signInWithOAuth: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    updateUser: async () => ({ data: { user: mockUser }, error: null }),
    setSession: async () => ({ data: { session: mockSession }, error: null }),
  },
  from: (table: string) => makeBuilder(table),
  rpc: async () => ({ data: null, error: null }),
  channel: () => noopChannel,
  removeChannel: () => Promise.resolve('ok'),
  getChannels: () => [],
  functions: { invoke: async () => ({ data: null, error: null }) },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'mock' }, error: null }),
      remove: async () => ({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null }),
      list: async () => ({ data: [], error: null }),
    }),
  },
};
