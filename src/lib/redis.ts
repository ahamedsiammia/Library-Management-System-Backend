import { createClient } from "redis";
import config from "../config";

// In-Memory store fallback if Redis Cloud/Server is unreachable
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

const isRedisConfigured = Boolean(config.redis_host && config.redis_port);

let isConnected = false;
let hasLoggedDnsError = false;

const rawClient = isRedisConfigured
  ? createClient({
      username: config.redis_userName,
      password: config.redis_password,
      socket: {
        host: config.redis_host,
        port: Number(config.redis_port),
        connectTimeout: 4000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            // Stop infinite reconnection attempts when host does not exist
            return new Error("Redis reconnection stopped: Host unreachable");
          }
          return 2000;
        },
      },
    })
  : null;

if (rawClient) {
  rawClient.on("error", (err: any) => {
    if (err?.code === "ENOTFOUND") {
      if (!hasLoggedDnsError) {
        console.warn(
          `⚠️ Redis Host '${config.redis_host}' not found (ENOTFOUND). Using In-Memory cache fallback.`
        );
        hasLoggedDnsError = true;
      }
    } else {
      console.warn("Redis Client Error:", err?.message || err);
    }
  });

  rawClient.on("ready", () => {
    isConnected = true;
    console.log("✅ Redis connected and ready");
  });

  rawClient.on("end", () => {
    isConnected = false;
  });
}

export const redisClient = {
  async connect() {
    if (!rawClient) return;
    try {
      await rawClient.connect();
    } catch (err: any) {
      if (err?.code === "ENOTFOUND") {
        if (!hasLoggedDnsError) {
          console.warn(
            `⚠️ Redis Host '${config.redis_host}' unreachable. In-Memory cache fallback active.`
          );
          hasLoggedDnsError = true;
        }
      } else {
        throw err;
      }
    }
  },

  async set(key: string, value: any, options?: any) {
    if (isConnected && rawClient?.isOpen) {
      try {
        return await rawClient.set(key, value, options);
      } catch (err) {
        console.warn("Redis set failed, falling back to In-Memory cache:", err);
      }
    }

    let ttlMs: number | undefined;
    if (options?.expiration?.type === "EX") {
      ttlMs = options.expiration.value * 1000;
    }
    memoryStore.set(key, {
      value: typeof value === "string" ? value : String(value),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    });
    return "OK";
  },

  async get(key: string): Promise<string | null> {
    if (isConnected && rawClient?.isOpen) {
      try {
        return await rawClient.get(key);
      } catch (err) {
        console.warn("Redis get failed, falling back to In-Memory cache:", err);
      }
    }

    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },

  async del(keys: string | string[]) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const k of keyArray) {
      memoryStore.delete(k);
    }
    if (isConnected && rawClient?.isOpen) {
      try {
        return await rawClient.del(keys as any);
      } catch (err) {
        console.warn("Redis del failed, falling back to In-Memory cache:", err);
      }
    }
    return 1;
  },

  on(event: string, listener: (...args: any[]) => void) {
    if (rawClient) {
      rawClient.on(event, listener);
    }
    return this;
  },
};
