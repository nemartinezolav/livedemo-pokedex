import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pokedex-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly favorites = signal<Set<number>>(this.load());

  isFavorite(id: number): boolean {
    return this.favorites().has(id);
  }

  toggle(id: number): void {
    const current = new Set(this.favorites());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.favorites.set(current);
    this.persist(current);
  }

  private load(): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private persist(set: Set<number>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      /* localStorage no disponible, se ignora */
    }
  }
}
