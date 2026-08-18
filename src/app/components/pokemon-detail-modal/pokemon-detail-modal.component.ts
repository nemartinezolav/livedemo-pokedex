import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonDetail } from '../../models/pokemon-detail.model';
import { PokemonDetailService } from '../../services/pokemon-detail.service';
import { TYPE_COLORS } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail-modal.component.html',
  styleUrl: './pokemon-detail-modal.component.scss'
})
export class PokemonDetailModalComponent implements OnChanges {
  @Input() pokemon: Pokemon | null = null;
  @Input() isFavorite = false;
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<Pokemon>();

  private detailService = inject(PokemonDetailService);

  readonly typeColors = TYPE_COLORS;
  detail: PokemonDetail | null = null;
  loadingDetail = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemon'] && this.pokemon) {
      this.detail = null;
      this.loadingDetail = true;
      this.detailService.getDetail(this.pokemon.id).subscribe({
        next: (d) => {
          this.detail = d;
          this.loadingDetail = false;
        },
        error: () => (this.loadingDetail = false)
      });
    }
  }

  get formattedId(): string {
    return this.pokemon ? `#${this.pokemon.id.toString().padStart(4, '0')}` : '';
  }

  maxStat(value: number): number {
    return Math.min(100, Math.round((value / 180) * 100));
  }
}
