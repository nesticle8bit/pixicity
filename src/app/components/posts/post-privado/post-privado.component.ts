import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-post-privado',
  templateUrl: './post-privado.component.html',
  styleUrls: ['./post-privado.component.scss']
})
export class PostPrivadoComponent implements OnInit {
  /** URL del post que se intentó ver (la pone posts-view al redirigir aquí). */
  public volver: string | null = null;
  public conSesion = false;

  constructor(
    private seoService: SEOService,
    private route: ActivatedRoute,
    private router: Router,
    private securityService: IHttpSecurityService
  ) { }

  ngOnInit(): void {
    const volver = this.route.snapshot.queryParamMap.get('volver');
    this.volver = volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : null;
    this.conSesion = !!this.securityService.getCurrentUser()?.token;

    this.seoService.setSEO({
      title: 'Post privado',
      description: 'Este post es privado.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
      statusCode: 403,
    });
  }

  reintentar(): void {
    this.router.navigateByUrl(this.volver ?? '/');
  }
}
