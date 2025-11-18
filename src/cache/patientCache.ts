// Patient Caching Utilities
interface CachedPatient {
  patient: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class PatientCache {
  private cache: Map<string, CachedPatient> = new Map();
  private maxEntries: number; // Maximum number of entries in cache

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get a cached patient
   */
  get(patientId: string): any | null {
    const cached = this.cache.get(patientId);
    if (!cached) {
      return null;
    }

    // Check if the cache is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(patientId);
      return null;
    }

    return cached.patient;
  }

  /**
   * Set a patient in cache with TTL
   */
  set(patientId: string, patient: any, ttl: number = 10 * 60 * 1000): void { // Default TTL: 10 minutes
    // Implement LRU eviction if we exceed max entries
    if (this.cache.size >= this.maxEntries) {
      // Remove the oldest entry (least recently used)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(patientId, {
      patient,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Batch set multiple patients in cache
   */
  batchSet(patients: Array<{id: string, patient: any}>, ttl: number = 10 * 60 * 1000): void {
    patients.forEach(({id, patient}) => {
      this.set(id, patient, ttl);
    });
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [patientId, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(patientId);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number, maxEntries: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries
    };
  }
}

export const patientCache = new PatientCache();