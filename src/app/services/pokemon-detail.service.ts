import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { PokemonDetail } from '../models/pokemon-detail.model';

const BASE_URL = 'https://pokeapi.co/api/v2';

const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Especial',
  'special-defense': 'Def. Especial',
  speed: 'Velocidad'
};

interface RawPokemonDetail {
  id: number;
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

@Injectable({ providedIn: 'root' })
export class PokemonDetailService {
  private http = inject(HttpClient);
  private cache = new Map<number, Observable<PokemonDetail>>();

  getDetail(id: number): Observable<PokemonDetail> {
    if (!this.cache.has(id)) {
      const req$ = this.http.get<RawPokemonDetail>(`${BASE_URL}/pokemon/${id}`).pipe(
        map((raw) => ({
          id: raw.id,
          heightM: raw.height / 10,
          weightKg: raw.weight / 10,
          abilities: raw.abilities.map((a) => a.ability.name.replace(/-/g, ' ')),
          stats: raw.stats.map((s) => ({
            name: STAT_LABELS[s.stat.name] ?? s.stat.name,
            value: s.base_stat
          }))
        })),
        shareReplay(1)
      );
      this.cache.set(id, req$);
    }
    return this.cache.get(id)!;
  }
}
