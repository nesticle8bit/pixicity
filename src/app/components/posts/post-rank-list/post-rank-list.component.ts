import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PostSimpleViewModel } from 'src/app/models/posts/post-vm.model';
import { NgClass } from '@angular/common';
import { PostUrlLinkComponent } from '../../addons/post-url-link/post-url-link.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-post-rank-list',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './post-rank-list.component.html',
    styleUrls: ['./post-rank-list.component.scss'],
    imports: [
        NgClass,
        PostUrlLinkComponent,
        MatTooltip,
    ],
})
export class PostRankListComponent {
  readonly titulo = input<string>('');
  readonly icono = input<string>('ti-list-numbers');
  readonly mensajeVacio = input<string>('');
  readonly iconoVacio = input<string>('ti-mood-empty');
  readonly posts = input<PostSimpleViewModel[] | null>([]);
}
