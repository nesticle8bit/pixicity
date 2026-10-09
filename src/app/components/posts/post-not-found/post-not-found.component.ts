import { Component, OnInit, inject } from '@angular/core';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
    selector: 'app-post-not-found',
    templateUrl: './post-not-found.component.html',
    styleUrls: ['./post-not-found.component.scss']
})
export class PostNotFoundComponent implements OnInit {
  private seoService = inject(SEOService);


  ngOnInit(): void {
    // noindex + status 404 real en el prerender: sin esto Google lo lee como
    // soft 404 y desconfia del resto del sitio.
    this.seoService.setSEO({
      title: 'Post no encontrado',
      description: 'El post que buscas no existe o fue eliminado.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
      statusCode: 404,
    });
  }

}
