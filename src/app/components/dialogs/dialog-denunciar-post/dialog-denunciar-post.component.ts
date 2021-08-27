import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-denunciar-post',
  templateUrl: './dialog-denunciar-post.component.html',
  styleUrls: ['./dialog-denunciar-post.component.scss']
})
export class DialogDenunciarPostComponent implements OnInit {
  public razonDenuncia: any[] = [{
    id: 1,
    label: 'Re-post'
  },{
    id: 2,
    label: 'Se hace Spam'
  },{
    id: 3,
    label: 'Tiene links muertos'
  },{
    id: 4,
    label: 'Es racista o irrespetuoso'
  },{
    id: 5,
    label: 'Contiene información personal'
  },{
    id: 6,
    label: 'El título esta en mayúscula'
  },{
    id: 7,
    label: 'Contiene pedofilia'
  },{
    id: 8,
    label: 'Es gore o asqueroso'
  },{
    id: 9,
    label: 'Está mal la fuente'
  },{
    id: 10,
    label: 'Post demasiado pobre / Crap'
  },{
    id: 11,
    label: 'Pixicity! no es un foro'
  },{
    id: 12,
    label: 'No cumple con el protocolo'
  },{
    id: 13,
    label: 'Otra razón (por favor especificar)'
  }];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
