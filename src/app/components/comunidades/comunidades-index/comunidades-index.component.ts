import { Component } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-comunidades-index',
  templateUrl: './comunidades-index.component.html',
  styleUrls: ['./comunidades-index.component.scss'],
})
export class ComunidadesIndexComponent {
  constructor(private displayService: DisplayComponentService, private seoService: SEOService) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
    this.seoService.setSEO({
      title: 'Comunidades',
      description: 'Explora las comunidades de Taringas. Únete a temas que te interesan, participa y conecta con otros usuarios.',
      type: 'website',
      imageURL: '',
      tags: ['comunidades', 'foros', 'temas', 'taringas'],
    });
  }
}
