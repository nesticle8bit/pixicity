import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-genre-icon',
    templateUrl: './genre-icon.component.html',
    styleUrls: ['./genre-icon.component.scss'],
    imports: [MatTooltip]
})
export class GenreIconComponent implements OnInit {
  readonly class = input<string>('');
  
  readonly genre = input<string | null | undefined>(undefined);

  readonly isFA = input<boolean>(false);
  
  constructor() { }

  ngOnInit(): void {
  }

}
