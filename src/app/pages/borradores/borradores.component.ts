import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.component.html',
  styleUrls: ['./borradores.component.scss']
})
export class BorradoresComponent implements OnInit {
  public borradores: any[] = [{
    categoria: {
      seo: '',
      icono: 'disk.png'
    },
    titulo: 'Titulo del Post',
    fechaActualiza: new Date()
  }, {
    categoria: {
      seo: '',
      icono: 'disk.png'
    },
    titulo: 'Titulo del Post',
    fechaActualiza: new Date()
  }, {
    categoria: {
      seo: '',
      icono: 'disk.png'
    },
    titulo: 'Titulo del Post',
    fechaActualiza: new Date()
  }];

  constructor() { }

  ngOnInit(): void {
  }

}
