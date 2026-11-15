import { SparePart } from '../types';

export interface SearchResult {
  part: SparePart;
  score: number;
}

export class PartSearchIndex {
  private parts: SparePart[] = [];
  private tokenMap: Map<string, Set<string>> = new Map();

  constructor(parts: SparePart[] = []) {
    this.rebuild(parts);
  }

  public rebuild(parts: SparePart[]) {
    this.parts = parts;
    this.tokenMap.clear();

    for (const part of parts) {
      if (part.is_archived) continue;
      const text = `${part.part_name} ${part.part_code} ${part.barcode} ${part.category} ${part.vehicle_model} ${part.location.rack} ${part.location.bin}`.toLowerCase();
      const tokens = text.split(/[\s,.\-_/]+/).filter(Boolean);

      for (const token of tokens) {
        if (!this.tokenMap.has(token)) {
          this.tokenMap.set(token, new Set());
        }
        this.tokenMap.get(token)!.add(part.id);
      }
    }
  }

  public search(
    query: string,
    categoryFilter?: string,
    statusFilter?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  ): { results: SparePart[]; latencyMs: number } {
    const startTime = performance.now();
    const q = query.trim().toLowerCase();

    let matchedParts = this.parts.filter(p => !p.is_archived);

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'ALL') {
      matchedParts = matchedParts.filter(p => p.category === categoryFilter);
    }

    // Apply stock status filter
    if (statusFilter && statusFilter !== 'ALL') {
      matchedParts = matchedParts.filter(p => {
        if (statusFilter === 'OUT_OF_STOCK') return p.stock_qty <= 0;
        if (statusFilter === 'LOW_STOCK') return p.stock_qty > 0 && p.stock_qty <= p.min_threshold;
        if (statusFilter === 'IN_STOCK') return p.stock_qty > p.min_threshold;
        return true;
      });
    }

    // Apply query matching
    if (q) {
      const qTokens = q.split(/[\s,.\-_/]+/).filter(Boolean);
      matchedParts = matchedParts.filter(part => {
        const text = `${part.part_name} ${part.part_code} ${part.barcode} ${part.category} ${part.vehicle_model} ${part.location.rack} ${part.location.bin}`.toLowerCase();
        // every token must appear as substring
        return qTokens.every(token => text.includes(token));
      });
    }

    const endTime = performance.now();
    const latencyMs = Math.max(1, Math.round(endTime - startTime));

    return {
      results: matchedParts,
      latencyMs,
    };
  }
}
