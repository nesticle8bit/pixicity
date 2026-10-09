import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SEOService } from 'src/app/services/shared/seo.service';
import { RegisterComponent } from '../../pages/register/register.component';
import { LoginComponent } from '../../pages/login/login.component';

@Component({
    selector: 'app-post-privado',
    templateUrl: './post-privado.component.html',
    styleUrls: ['./post-privado.component.scss'],
    imports: [RegisterComponent, LoginComponent]
})
export class PostPrivadoComponent implements OnInit {
  private seoService = inject(SEOService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private securityService = inject(IHttpSecurityService);

  /** URL del post que se intentó ver (la pone posts-view al redirigir aquí). */
  public volver: string | null = null;
  public conSesion = false;

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
