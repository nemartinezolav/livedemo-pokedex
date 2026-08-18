import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Generation, PokemonTypeInfo } from '../../models/pokemon.model';
import { DEFAULT_FILTERS, PokemonFilters, SortOption } from '../../models/filters.model';

@Component({
  selector: 'app-pokemon-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-filters.component.html',
  styleUrl: './pokemon-filters.component.scss'
})
export class PokemonFiltersComponent {
  @Input() types: PokemonTypeInfo[] = [];
  @Input() generations: Generation[] = [];
  @Input() resultCount = 0;
  @Input() filters: PokemonFilters = { ...DEFAULT_FILTERS };
  @Output() filtersChange = new EventEmitter<PokemonFilters>();

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'id-asc', label: 'Número (menor a mayor)' },
    { value: 'id-desc', label: 'Número (mayor a menor)' },
    { value: 'name-asc', label: 'Nombre (A-Z)' },
    { value: 'name-desc', label: 'Nombre (Z-A)' }
  ];

  update<K extends keyof PokemonFilters>(key: K, value: PokemonFilters[K]): void {
    this.filtersChange.emit({ ...this.filters, [key]: value });
  }

  onNameInput(value: string): void {
    this.update('name', value);
  }

  onNumberMin(value: string): void {
    this.update('numberMin', value === '' ? null : Number(value));
  }

  onNumberMax(value: string): void {
    this.update('numberMax', value === '' ? null : Number(value));
  }

  onGeneration(value: string): void {
    this.update('generation', value === '' ? null : Number(value));
  }

  onSort(value: string): void {
    this.update('sort', value as SortOption);
  }

  toggleType(typeName: string): void {
    const current = this.filters.types;
    const next = current.includes(typeName)
      ? current.filter((t) => t !== typeName)
      : [...current, typeName];
    this.update('types', next);
  }

  toggleFavorites(): void {
    this.update('onlyFavorites', !this.filters.onlyFavorites);
  }

  resetFilters(): void {
    this.filtersChange.emit({ ...DEFAULT_FILTERS });
  }
}
