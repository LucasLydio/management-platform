import { createClient } from "redis";

import { env } from "../config/env";

type CacheValue = {
  expiresAt: number;
  value: string;
};

export class CacheStore {
  private readonly memory = new Map<string, CacheValue>();
  private client?: ReturnType<typeof createClient>;

  async connect(): Promise<void> {
    if (!env.REDIS_URL) return;

    this.client = createClient({
      socket: {
        connectTimeout: 1_000,
        reconnectStrategy: false,
      },
      url: env.REDIS_URL,
    });
    this.client.on("error", () => undefined);

    try {
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis connection timeout")), 1_500),
        ),
      ]);
    } catch {
      await this.client.disconnect().catch(() => undefined);
      this.client = undefined;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const redisValue = this.client?.isOpen ? await this.client.get(key) : null;
    if (redisValue) return JSON.parse(redisValue) as T;

    const memoryValue = this.memory.get(key);
    if (!memoryValue || memoryValue.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }

    return JSON.parse(memoryValue.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.client?.isOpen) {
      await this.client.set(key, serialized, { EX: ttlSeconds });
      return;
    }

    this.memory.set(key, {
      expiresAt: Date.now() + ttlSeconds * 1000,
      value: serialized,
    });
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    if (this.client?.isOpen) {
      const keys: string[] = [];

      for await (const key of this.client.scanIterator({ COUNT: 100, MATCH: `${prefix}*` })) {
        keys.push(String(key));
      }

      if (keys.length) await this.client.del(keys);
      return;
    }

    [...this.memory.keys()]
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => this.memory.delete(key));
  }
}

export const cacheStore = new CacheStore();
