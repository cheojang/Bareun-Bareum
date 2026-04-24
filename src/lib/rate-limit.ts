/**
 * 간단한 인메모리 레이트 리미터 (토큰 버킷)
 * Gemini API 등 비용·리소스 보호용
 *
 * 주의: 단일 서버 프로세스 기준. Vercel serverless에서는 인스턴스마다 별도
 * 상태이므로 완벽하지 않지만, 악의적 자동화 공격의 1차 방어로는 충분.
 * 분산 환경에서는 Upstash Redis 등으로 교체 필요.
 */

import { LRUCache } from "./lru-cache";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** 최대 토큰 개수 (버스트 허용치) */
  capacity: number;
  /** 초당 토큰 재충전 속도 */
  refillPerSecond: number;
  /** 추적 사용자 상한 (LRU) */
  maxUsers?: number;
}

export class RateLimiter {
  private buckets: LRUCache<string, Bucket>;
  constructor(private config: RateLimitConfig) {
    this.buckets = new LRUCache(config.maxUsers ?? 10_000);
  }

  /** 허용되면 true, 거부되면 false (토큰 1개 소모) */
  allow(userId: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(userId) ?? {
      tokens: this.config.capacity,
      lastRefill: now,
    };

    // 시간 경과에 따른 토큰 재충전
    const elapsedSec = (now - bucket.lastRefill) / 1000;
    const refilled = Math.min(
      this.config.capacity,
      bucket.tokens + elapsedSec * this.config.refillPerSecond
    );
    bucket.tokens = refilled;
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      this.buckets.set(userId, bucket);
      return false;
    }

    bucket.tokens -= 1;
    this.buckets.set(userId, bucket);
    return true;
  }
}

// ── 사전 정의된 리미터들 ──────────────────────────────────────────────────────

/** Gemini AI 분석: 사용자당 분당 10건, 버스트 10건 */
export const geminiLimiter = new RateLimiter({
  capacity: 10,
  refillPerSecond: 10 / 60, // 1분에 10건
});

/** 종합 분석 (더 비싼): 사용자당 시간당 5건, 버스트 2건 */
export const heavyAnalysisLimiter = new RateLimiter({
  capacity: 2,
  refillPerSecond: 5 / 3600, // 1시간에 5건
});
