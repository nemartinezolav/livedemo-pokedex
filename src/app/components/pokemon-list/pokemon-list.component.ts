import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon.model';
import { DEFAULT_FILTERS, PokemonFilters } from '../../models/filters.model';
import { PokemonService } from '../../services/pokemon.service';
import { FavoritesService } from '../../services/favorites.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonFiltersComponent } from '../pokemon-filters/pokemon-filters.component';
import { PokemonDetailModalComponent } from '../pokemon-detail-modal/pokemon-detail-modal.component';

const PAGE_SIZE = 40;

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, PokemonFiltersComponent, PokemonDetailModalComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss'
})
export class PokemonListComponent implements OnInit {
  private pokemonService = inject(PokemonService);
  favoritesService = inject(FavoritesService);

  readonly loading = this.pokemonService.loading;
  readonly loadError = this.pokemonService.loadError;

  readonly allPokemon = signal<Pokemon[]>([]);
  readonly filters = signal<PokemonFilters>({ ...DEFAULT_FILTERS });
  readonly visibleCount = signal(PAGE_SIZE);
  readonly selectedPokemon = signal<Pokemon | null>(null);

  readonly types = this.pokemonService.getTypeList();
  readonly generations = this.pokemonService.getGenerations();

  readonly filteredPokemon = computed(() => {
    const f = this.filters();
    const favorites = this.favoritesService.favorites();
    let result = this.allPokemon().filter((p) => {
      if (f.name && !p.name.toLowerCase().includes(f.name.toLowerCase())) return false;
      if (f.numberMin !== null && p.id < f.numberMin) return false;
      if (f.numberMax !== null && p.id > f.numberMax) return false;
      if (f.generation !== null && p.generation !== f.generation) return false;
      if (f.types.length > 0 && !f.types.every((t) => p.types.includes(t))) return false;
      if (f.onlyFavorites && !favorites.has(p.id)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (f.sort) {
        case 'id-desc':
          return b.id - a.id;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return a.id - b.id;
      }
    });

    return result;
  });

  readonly pagedPokemon = computed(() => this.filteredPokemon().slice(0, this.visibleCount()));
  readonly hasMore = computed(() => this.visibleCount() < this.filteredPokemon().length);

  ngOnInit(): void {
    this.pokemonService.getAllPokemon().subscribe((list) => this.allPokemon.set(list));
  }

  onFiltersChange(filters: PokemonFilters): void {
    this.filters.set(filters);
    this.visibleCount.set(PAGE_SIZE);
  }

  loadMore(): void {
    this.visibleCount.update((v) => v + PAGE_SIZE);
  }

  openDetail(pokemon: Pokemon): void {
    this.selectedPokemon.set(pokemon);
  }

  closeDetail(): void {
    this.selectedPokemon.set(null);
  }

  onToggleFavorite(pokemon: Pokemon): void {
    this.favoritesService.toggle(pokemon.id);
  }

  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  trackById(_index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}
