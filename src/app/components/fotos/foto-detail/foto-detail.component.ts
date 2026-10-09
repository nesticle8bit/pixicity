import { environment } from 'src/environments/environment';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { ShareButtonsComponent } from '../../addons/share-buttons/share-buttons.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FotoComentariosComponent } from '../foto-comentarios/foto-comentarios.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';

@Component({
    selector: 'app-foto-detail',
    templateUrl: './foto-detail.component.html',
    styleUrls: ['./foto-detail.component.scss'],
    imports: [ThumbPipe, 
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        ShareButtonsComponent,
        MatTooltip,
        NgClass,
        FotoComentariosComponent,
        DecimalPipe,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class FotoDetailComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private fotosService = inject(IHttpFotosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public foto: any = null;
  public currentUser?: JwtUserModel;
  public loading: boolean = true;
  public fotoId: number = 0;

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.fotoId = +params['id'];
      if (this.fotoId) {
        this.loadFoto();
      }
    });
  }

  loadFoto(): void {
    this.loading = true;
    this.fotosService.getFotoById(this.fotoId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.foto = response;
        this.loading = false;
        const rutaCanonica = this.router
          .createUrlTree(['/fotos', this.foto.usuario, this.foto.id, this.foto.url])
          .toString();

        if (decodeURIComponent(this.documento.location.pathname) !== decodeURIComponent(rutaCanonica.split('?')[0])) {
          this.router.navigateByUrl(rutaCanonica, { replaceUrl: true });
          return;
        }

        this.seoService.setSEO({
          title: this.foto.titulo,
          description: this.foto.descripcion
            ? this.foto.descripcion.replace(/<[^>]*>/g, '').substring(0, 200)
            : `Foto "${this.foto.titulo}" de ${this.foto.usuario} en Taringa.`,
          type: 'article',
          imageURL: this.foto.imageUrl || '',
          tags: [this.foto.titulo, this.foto.categoria, this.foto.usuario, 'fotos', 'taringas'].filter(Boolean),
          canonical: `${environment.publicUrl}${rutaCanonica}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [{
              '@type': 'ImageObject',
              name: this.foto.titulo,
              contentUrl: this.foto.imageUrl || undefined,
              uploadDate: this.foto.fechaRegistro,
              creditText: this.foto.usuario,
              author: { '@type': 'Person', name: this.foto.usuario },
              copyrightNotice: this.foto.usuario,
              license: `${environment.publicUrl}/paginas/terminos-y-condiciones`,
            }, {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Taringa!', item: `${environment.publicUrl}/` },
                { '@type': 'ListItem', position: 2, name: 'Fotos', item: `${environment.publicUrl}/fotos` },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: this.foto.titulo,
                  item: `${environment.publicUrl}${this.documento.location.pathname}`,
                },
              ],
            }],
          },
        });
        // Increment visit count (fire and forget)
        this.fotosService.incrementVisitas(this.fotoId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      },
      error: () => {
        this.loading = false;
        this.seoService.setSEO({
          title: 'Foto no encontrada',
          description: 'Esta foto no existe o fue eliminada.',
          type: 'website',
          imageURL: '',
          tags: [],
          noIndex: true,
          statusCode: 404,
        });
      },
    });
  }

  votar(cantidad: number): void {
    if (!this.currentUser?.usuario) return;

    this.fotosService.votarFoto(this.fotoId, cantidad).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response) {
          this.foto.votosPositivos = response.votosPositivos;
          this.foto.votosNegativos = response.votosNegativos;
          this.foto.miVoto = response.miVoto;
        }
      },
      error: () => {},
    });
  }

  eliminar(): void {
    if (!confirm('¿Eliminar esta foto?')) return;

    this.fotosService.deleteFoto(this.fotoId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['/fotos']),
      error: () => {},
    });
  }

  get esMio(): boolean {
    return this.currentUser?.usuario?.userName === this.foto?.usuario;
  }

  get esAdmin(): boolean {
    return this.currentUser?.usuario?.rango === 'Administrador';
  }
}
