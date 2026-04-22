/**
 * 간단한 LRU (Least Recently Used) 캐시
 * 메모리 누수 방지를 위해 최대 크기 제한
 *
 * 사용 예:
 *   const cache = new LRUCache<string, Value>(1000);
 *   cache.set("key", value);
 *   const v = cache.get("key");
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private readonly maxSize: number = 500) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 최근 접근으로 이동
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거 (Map은 삽입 순서 유지)
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
