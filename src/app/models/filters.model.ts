export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

export interface PokemonFilters {
  name: string;
  numberMin: number | null;
  numberMax: number | null;
  types: string[];
  generation: number | null;
  onlyFavorites: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: PokemonFilters = {
  name: '',
  numberMin: null,
  numberMax: null,
  types: [],
  generation: null,
  onlyFavorites: false,
  sort: 'id-asc'
};
