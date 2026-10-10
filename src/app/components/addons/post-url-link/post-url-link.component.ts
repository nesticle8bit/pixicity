import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-post-url-link',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './post-url-link.component.html',
    styleUrls: ['./post-url-link.component.scss'],
    imports: [RouterLink, TruncatePipe],
})
export class PostUrlLinkComponent implements OnInit {
  readonly post = input({
    id: 0,
    url: '',
    titulo: '',
    truncate: 70
});

  readonly categoria = input({
    icono: '',
    nombre: '',
    seo: '',
});

  readonly target = input<string>('_self');

  constructor() {}

  ngOnInit(): void {}
}
