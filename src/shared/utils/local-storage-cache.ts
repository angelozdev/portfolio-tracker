/**
 * Generic localStorage cache wrapper.
 *
 * Provides type-safe read/write/clear operations over a single
 * `localStorage` key. Values are JSON-serialized automatically.
 *
 * @template T — The shape of the cached value.
 *
 * @example
 * ```ts
 * const cache = new LocalStorageCache<Record<string, number>>("my-prices");
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

  /**
   * @param key — The localStorage key used to store the value.
   */
  constructor(key: string) {
    this.key = key;
  }

  /**
   * Retrieve the cached value.
   *
   * @returns The parsed value, or `null` if the key does not exist
   *          or the stored JSON is malformed.
   */
  get(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
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
    localStorage.setItem(this.key, JSON.stringify(value));
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
   * @returns `true` if the key exists and its content is valid JSON.
   */
  exists(): boolean {
    return this.get() !== null;
  }
}
