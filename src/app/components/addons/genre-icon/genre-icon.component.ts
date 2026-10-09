import { ChangeDetectionStrategy, Component, Input, OnInit, input } from '@angular/core';
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
  
  private _genre: any;

  @Input() set genre(value: any) {
    this._genre = value;
  }

  get genre(): any {
    return this._genre;
  }

  readonly isFA = input<boolean>(false);
  
  constructor() { }

  ngOnInit(): void {
  }

}
