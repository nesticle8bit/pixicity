import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ComentarioReciente {
  usuario: string;
  titulo: string;
  link: any[];
}

@Component({
  standalone: false,
  selector: 'app-recent-comments-list',
  templateUrl: './recent-comments-list.component.html',
})
export class RecentCommentsListComponent {
  @Input() comentarios: ComentarioReciente[] | null = [];
  @Input() cargando: boolean = false;
  @Input() mensajeVacio: string = 'Aún no se han realizado comentarios';
  @Output() actualizar = new EventEmitter<void>();
}
