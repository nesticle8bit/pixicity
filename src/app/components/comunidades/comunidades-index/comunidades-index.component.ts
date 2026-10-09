import { Component, inject } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { ComunidadesTemasRecientesComponent } from '../widgets/comunidades-temas-recientes/comunidades-temas-recientes.component';
import { ComunidadesStatsComponent } from '../widgets/comunidades-stats/comunidades-stats.component';
import { ComunidadesUltimosComentariosComponent } from '../widgets/comunidades-ultimos-comentarios/comunidades-ultimos-comentarios.component';
import { ComunidadesTopComponent } from '../widgets/comunidades-top/comunidades-top.component';
import { ComunidadesTopTemasComponent } from '../widgets/comunidades-top-temas/comunidades-top-temas.component';

@Component({
    selector: 'app-comunidades-index',
    templateUrl: './comunidades-index.component.html',
    styleUrls: ['./comunidades-index.component.scss'],
    imports: [
        ComunidadesTemasRecientesComponent,
        ComunidadesStatsComponent,
        ComunidadesUltimosComentariosComponent,
        ComunidadesTopComponent,
        ComunidadesTopTemasComponent,
    ],
})
export class ComunidadesIndexComponent {
  private displayService = inject(DisplayComponentService);
  private seoService = inject(SEOService);

  constructor() {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
    this.seoService.setSEO({
      title: 'Comunidades',
      description: 'Explora las comunidades de Taringa. Únete a temas que te interesan, participa y conecta con otros usuarios.',
      type: 'website',
      imageURL: '',
      tags: ['comunidades', 'foros', 'temas', 'taringas'],
    });
  }
}
