import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, shareReplay, tap } from 'rxjs';
import { Generation, Pokemon, PokemonTypeInfo } from '../models/pokemon.model';

const BASE_URL = 'https://pokeapi.co/api/v2';
const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Los 18 tipos estándar de Pokémon (se excluyen "unknown" y "shadow")
export const STANDARD_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy'
];

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A', fighting: '#C22E28', flying: '#A98FF3', poison: '#A33EA1',
  ground: '#E2BF65', rock: '#B6A136', bug: '#A6B91A', ghost: '#735797',
  steel: '#B7B7CE', fire: '#EE8130', water: '#6390F0', grass: '#7AC74C',
  electric: '#F7D02C', psychic: '#F95587', ice: '#96D9D6', dragon: '#6F35FC',
  dark: '#705746', fairy: '#D685AD'
};

export const GENERATIONS: Generation[] = [
  { id: 1, label: 'Gen I (Kanto)', min: 1, max: 151 },
  { id: 2, label: 'Gen II (Johto)', min: 152, max: 251 },
  { id: 3, label: 'Gen III (Hoenn)', min: 252, max: 386 },
  { id: 4, label: 'Gen IV (Sinnoh)', min: 387, max: 493 },
  { id: 5, label: 'Gen V (Teselia)', min: 494, max: 649 },
  { id: 6, label: 'Gen VI (Kalos)', min: 650, max: 721 },
  { id: 7, label: 'Gen VII (Alola)', min: 722, max: 809 },
  { id: 8, label: 'Gen VIII (Galar)', min: 810, max: 905 },
  { id: 9, label: 'Gen IX (Paldea)', min: 906, max: 1025 },
  { id: 10, label: 'Formas especiales', min: 1026, max: 100000 }
];

interface NamedApiResource {
  name: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);
  private cache$?: Observable<Pokemon[]>;

  readonly loading = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);

  getTypeList(): PokemonTypeInfo[] {
    return STANDARD_TYPES.map((name) => ({ name, colorHex: TYPE_COLORS[name] }));
  }

  getGenerations(): Generation[] {
    return GENERATIONS;
  }

  /** Devuelve el listado completo de pokemones (con tipo, imagen y generación), cacheado. */
  getAllPokemon(): Observable<Pokemon[]> {
    if (this.cache$) {
      return this.cache$;
    }

    this.loading.set(true);
    this.loadError.set(null);

    this.cache$ = forkJoin({
      list: this.fetchFullList(),
      typeMap: this.fetchTypeMap()
    }).pipe(
      map(({ list, typeMap }) =>
        list
          .map((item) => this.toPokemon(item, typeMap.get(item.id) ?? []))
          .sort((a, b) => a.id - b.id)
      ),
      tap({
        next: () => this.loading.set(false),
        error: (err) => {
          this.loading.set(false);
          this.loadError.set('No se pudo cargar el listado de Pokémon. Intenta nuevamente.');
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    return this.cache$;
  }

  private fetchFullList(): Observable<{ id: number; name: string }[]> {
    return this.http
      .get<{ results: NamedApiResource[] }>(`${BASE_URL}/pokemon?limit=100000&offset=0`)
      .pipe(
        map((res) =>
          res.results
            .map((r) => ({ id: this.extractId(r.url), name: r.name }))
            .filter((p) => !isNaN(p.id))
        )
      );
  }

  /** Construye un mapa id -> [tipos] consultando el endpoint /type de cada tipo estándar. */
  private fetchTypeMap(): Observable<Map<number, string[]>> {
    const requests = STANDARD_TYPES.map((typeName) =>
      this.http.get<{ pokemon: { pokemon: NamedApiResource }[] }>(`${BASE_URL}/type/${typeName}`).pipe(
        map((res) => ({
          typeName,
          ids: res.pokemon.map((p) => this.extractId(p.pokemon.url))
        }))
      )
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const map = new Map<number, string[]>();
        for (const { typeName, ids } of results) {
          for (const id of ids) {
            const current = map.get(id) ?? [];
            current.push(typeName);
            map.set(id, current);
          }
        }
        return map;
      })
    );
  }

  private toPokemon(item: { id: number; name: string }, types: string[]): Pokemon {
    return {
      id: item.id,
      name: item.name,
      image: `${ARTWORK_URL}/${item.id}.png`,
      types,
      generation: GENERATIONS.find((g) => item.id >= g.min && item.id <= g.max)?.id ?? 10
    };
  }

  private extractId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}
