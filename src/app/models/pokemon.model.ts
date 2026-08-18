export interface PokemonBasic {
  id: number;
  name: string;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  generation: number;
}

export interface PokemonTypeInfo {
  name: string;
  colorHex: string;
}

export interface Generation {
  id: number;
  label: string;
  min: number;
  max: number;
}
