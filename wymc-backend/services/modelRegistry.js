// Very small in-memory registry with LRU eviction by total size
// Use env MAX_VRAM_MB to enforce a budget (optional)

const MAX_MB = Number(process.env.MAX_VRAM_MB || 0); // 0 = unlimited

class LRU {
  constructor() {
    this.map = new Map(); // name -> { sizeMB, pinned, ts }
    this.total = 0;
  }
  has(name) { return this.map.has(name); }
  get(name) {
    const v = this.map.get(name);
    if (!v) return null;
    v.ts = Date.now();
    return v;
  }
  add(name, meta) {
    if (this.map.has(name)) return this.touch(name);
    this.map.set(name, { ...meta, ts: Date.now() });
    this.total += meta.sizeMB || 0;
    this.evictIfNeeded();
  }
  touch(name) { const v = this.map.get(name); if (v) v.ts = Date.now(); }
  remove(name) {
    const v = this.map.get(name);
    if (!v) return;
    this.total -= v.sizeMB || 0;
    this.map.delete(name);
  }
  evictIfNeeded() {
    if (!MAX_MB || this.total <= MAX_MB) return [];
    const victims = [];
    // collect non-pinned sorted by oldest ts
    const pool = [...this.map.entries()].filter(([, v]) => !v.pinned)
      .sort((a, b) => a[1].ts - b[1].ts);
    for (const [name, v] of pool) {
      if (this.total <= MAX_MB) break;
      victims.push({ name, ...v });
      this.remove(name);
    }
    return victims;
  }
  list() {
    return [...this.map.entries()].map(([name, v]) => ({ name, ...v }));
  }
}

export const registry = new LRU();