interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Generic localStorage cache wrapper with optional TTL.
 *
 * Provides type-safe read/write/clear operations over a single
 * `localStorage` key. Values are JSON-serialized automatically.
 *
 * @template T — The shape of the cached value.
 *
 * @example
 * ```ts
 * const cache = new LocalStorageCache<Record<string, number>>("my-prices", 5 * 60 * 1000);
 *
 * cache.set({ AAPL: 185.5, GOOG: 140.2 });
 * cache.get();   // { AAPL: 185.5, GOOG: 140.2 }
 * cache.exists(); // true
 * cache.clear();
 * cache.get();   // null
 * ```
 */
export class LocalStorageCache<T> {
  private key: string;
  private ttlMs: number | null;

  /**
   * @param key — The localStorage key used to store the value.
   * @param ttlMs — Optional time-to-live in milliseconds. If omitted, cache never expires.
   */
  constructor(key: string, ttlMs?: number) {
    this.key = key;
    this.ttlMs = ttlMs ?? null;
  }

  /**
   * Retrieve the cached value.
   *
   * @returns The parsed value, or `null` if the key does not exist,
   *          the stored JSON is malformed, or the entry has expired.
   */
  get(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;

      const parsed = JSON.parse(raw);

      // Support both old format (raw T) and new format (CacheEntry<T>)
      if (this.ttlMs !== null && parsed && typeof parsed === "object" && "timestamp" in parsed) {
        const entry = parsed as CacheEntry<T>;
        if (Date.now() - entry.timestamp > this.ttlMs) {
          this.clear();
          return null;
        }
        return entry.data;
      }

      // Legacy format or no TTL: return raw value
      return parsed as T;
    } catch {
      return null;
    }
  }

  /**
   * Store a value in localStorage.
   *
   * @param value — The value to serialize and persist.
   */
  set(value: T): void {
    if (this.ttlMs !== null) {
      const entry: CacheEntry<T> = { data: value, timestamp: Date.now() };
      localStorage.setItem(this.key, JSON.stringify(entry));
    } else {
      localStorage.setItem(this.key, JSON.stringify(value));
    }
  }

  /**
   * Remove the cached entry from localStorage.
   */
  clear(): void {
    localStorage.removeItem(this.key);
  }

  /**
   * Check whether a valid cached value exists.
   *
   * @returns `true` if the key exists and its content is valid JSON (and not expired).
   */
  exists(): boolean {
    return this.get() !== null;
  }
}
