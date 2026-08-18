import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon.model';
import { TYPE_COLORS } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss'
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: Pokemon;
  @Input() isFavorite = false;
  @Output() select = new EventEmitter<Pokemon>();
  @Output() toggleFavorite = new EventEmitter<Pokemon>();

  readonly typeColors = TYPE_COLORS;

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.pokemon);
  }

  get formattedId(): string {
    return `#${this.pokemon.id.toString().padStart(4, '0')}`;
  }
}
