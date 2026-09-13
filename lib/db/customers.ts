import { Redis } from '@upstash/redis';

export interface Customer {
  id: string                    // UUID
  name: string
  email: string
  whatsapp: string
  device: string
  country?: string
  connectionType?: string
  internetSpeed?: string
  
  // Trial tracking
  trialStatus: 'pending' | 'active' | 'expired' | 'converted'
  trialStartedAt?: string       // ISO timestamp
  trialExpiresAt?: string       // ISO timestamp
  trialCredentials?: {
    server: string
    username: string
    password: string
  }
  
  // Subscription tracking  
  subscriptionStatus: 'none' | 'active' | 'expired' | 'cancelled'
  plan?: string                 // '1month', '3month', '6month', '12month'
  paidAt?: string               // ISO timestamp
  subscriptionExpiresAt?: string
  stripeSessionId?: string
  stripeCustomerId?: string
  
  // Email sequence tracking
  emailsSent: string[]          // e.g. ['welcome', 'checkin_2h', 'trial_ending', 'trial_expired']
  
  // Metadata
  createdAt: string             // ISO timestamp
  updatedAt: string             // ISO timestamp
  source: 'trial_form' | 'buy_form' | 'manual'
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'emailsSent' | 'trialStatus' | 'subscriptionStatus'>): Promise<Customer> {
  if (!redis) {
    throw new Error('Redis is not configured');
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const customer: Customer = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
    emailsSent: [],
    trialStatus: 'pending',
    subscriptionStatus: 'none',
  };

  const pipeline = redis.pipeline();
  pipeline.set(`customer:${id}`, customer);
  pipeline.set(`customer:email:${data.email}`, id);
  pipeline.sadd(`customer:list`, id);
  
  if (customer.trialExpiresAt) {
    pipeline.zadd(`customer:trials`, {
      score: new Date(customer.trialExpiresAt).getTime(),
      member: id
    });
  }

  await pipeline.exec();

  return customer;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (!redis) return null;
  return redis.get<Customer>(`customer:${id}`);
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  if (!redis) return null;
  const id = await redis.get<string>(`customer:email:${email}`);
  if (!id) return null;
  return getCustomer(id);
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  if (!redis) return null;
  const existing = await getCustomer(id);
  if (!existing) return null;

  const updated: Customer = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const pipeline = redis.pipeline();
  pipeline.set(`customer:${id}`, updated);
  
  if (updates.email && updates.email !== existing.email) {
    pipeline.del(`customer:email:${existing.email}`);
    pipeline.set(`customer:email:${updates.email}`, id);
  }

  if (updates.trialExpiresAt !== undefined) {
    if (updates.trialExpiresAt) {
      pipeline.zadd(`customer:trials`, {
        score: new Date(updates.trialExpiresAt).getTime(),
        member: id
      });
    } else {
      pipeline.zrem(`customer:trials`, id);
    }
  }

  await pipeline.exec();

  return updated;
}

export async function listTrialsExpiringSoon(withinMinutes: number): Promise<Customer[]> {
  if (!redis) return [];
  const now = Date.now();
  const upTo = now + (withinMinutes * 60 * 1000);
  
  const ids = await redis.zrange<string[]>(`customer:trials`, now, upTo, { byScore: true });
  if (!ids.length) return [];
  
  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get<Customer>(`customer:${id}`);
  }
  const results = await pipeline.exec<any[]>();
  // Filter out any null results
  return results.filter(c => c !== null);
}

export async function listActiveTrials(): Promise<Customer[]> {
  if (!redis) return [];
  const now = Date.now();
  const ids = await redis.zrange<string[]>(`customer:trials`, now, '+inf', { byScore: true });
  if (!ids.length) return [];
  
  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get<Customer>(`customer:${id}`);
  }
  const results = await pipeline.exec<any[]>();
  return results.filter(c => c !== null && c.trialStatus === 'active');
}

export async function markEmailSent(id: string, emailType: string): Promise<void> {
  if (!redis) return;
  const customer = await getCustomer(id);
  if (!customer) return;
  
  if (!customer.emailsSent.includes(emailType)) {
    customer.emailsSent.push(emailType);
    await updateCustomer(id, { emailsSent: customer.emailsSent });
  }
}

export async function getStats(): Promise<{ totalTrials: number; activeTrials: number; converted: number; conversionRate: number }> {
  if (!redis) return { totalTrials: 0, activeTrials: 0, converted: 0, conversionRate: 0 };
  
  const ids = await redis.smembers(`customer:list`);
  if (!ids.length) return { totalTrials: 0, activeTrials: 0, converted: 0, conversionRate: 0 };

  let totalTrials = 0;
  let activeTrials = 0;
  let converted = 0;

  // Use pipeline for better performance
  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get<Customer>(`customer:${id}`);
  }
  const customers = await pipeline.exec<any[]>();

  for (const c of customers) {
    if (!c) continue;
    if (c.source === 'trial_form') {
      totalTrials++;
      if (c.trialStatus === 'active') activeTrials++;
      if (c.trialStatus === 'converted') converted++;
    }
  }

  const conversionRate = totalTrials > 0 ? (converted / totalTrials) * 100 : 0;

  return {
    totalTrials,
    activeTrials,
    converted,
    conversionRate
  };
}
