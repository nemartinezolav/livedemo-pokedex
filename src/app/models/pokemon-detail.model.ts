export interface PokemonDetail {
  id: number;
  heightM: number;
  weightKg: number;
  abilities: string[];
  stats: { name: string; value: number }[];
}
