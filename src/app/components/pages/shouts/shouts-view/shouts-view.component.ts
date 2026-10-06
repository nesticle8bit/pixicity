import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { environment } from 'src/environments/environment';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-shouts-view',
  templateUrl: './shouts-view.component.html',
  styleUrls: ['./shouts-view.component.scss'],
})
export class ShoutsViewComponent implements OnInit {
  public readonly publicUrl = environment.publicUrl;

  private readonly destroyRef = inject(DestroyRef);

  public currentUser?: JwtUserModel;
  public shout: any;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private activatedRoute: ActivatedRoute,
    private perfilService: IHttpPerfilService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private seoService: SEOService
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: false,
      background: '',
    });

    this.getParameters();
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getParameters(): void {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramsMap) => {
      this.getCurrentShout(+(paramsMap.get('id') ?? 0));
    });
  }

  getCurrentShout(shoutId: number): void {
    if (!shoutId) {
      return;
    }

    this.perfilService.getShoutById(shoutId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.shout = value;

      if (this.shout) {
        const texto = (this.shout.contenido || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const autor = this.shout.usuario?.userName ?? '';

        this.seoService.setSEO({
          title: texto ? texto.substring(0, 60) : `Shout de ${autor}`,
          description: texto
            ? texto.substring(0, 200)
            : `Shout de ${autor} en Taringa.`,
          type: 'article',
          imageURL: '',
          tags: [autor, 'shout', 'taringas'].filter(Boolean),
          canonical: `${location.origin}${location.pathname}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'SocialMediaPosting',
            headline: texto ? texto.substring(0, 110) : `Shout de ${autor}`,
            datePublished: this.shout.fechaRegistro,
            author: { '@type': 'Person', name: autor },
            publisher: { '@id': `${location.origin}/#organization` },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${location.origin}${location.pathname}` },
          },
        });
      }
      
      if(!this.shout) {
        window.location.href = '';
      }
    });
  }

  eliminarShout(): void {
    if (!this.notificationService.confirm('¿Seguro que deseas eliminar este shout?')) {
      return;
    }

    this.perfilService.deleteShout(this.shout.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('El shout ha sido eliminado exitosamente', 'Eliminado');
        window.location.href = '';
      }
    });
  }

  clipboard(text: string): void {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Texto copiado al portapapeles', '', {
      duration: 3 * 1000,
    });
  }
}
