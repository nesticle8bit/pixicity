import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-url-link',
  templateUrl: './post-url-link.component.html',
  styleUrls: ['./post-url-link.component.scss'],
})
export class PostUrlLinkComponent implements OnInit {
  @Input() post = {
    id: 0,
    url: '',
    titulo: '',
    truncate: 70
  };

  @Input() categoria = {
    icono: '',
    nombre: '',
    seo: '',
  };

  constructor() {}

  ngOnInit(): void {}
}
