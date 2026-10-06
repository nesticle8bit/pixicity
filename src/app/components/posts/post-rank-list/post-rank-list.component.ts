import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-post-rank-list',
  templateUrl: './post-rank-list.component.html',
  styleUrls: ['./post-rank-list.component.scss'],
})
export class PostRankListComponent {
  @Input() titulo: string = '';
  @Input() icono: string = 'ti-list-numbers';
  @Input() mensajeVacio: string = '';
  @Input() iconoVacio: string = 'ti-mood-empty';
  @Input() posts: any[] | null = [];
}
