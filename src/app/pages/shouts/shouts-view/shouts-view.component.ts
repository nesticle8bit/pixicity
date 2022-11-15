import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shouts-view',
  templateUrl: './shouts-view.component.html',
  styleUrls: ['./shouts-view.component.scss'],
})
export class ShoutsViewComponent implements OnInit {
  public currentUser: any;
  public shout: any;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    @Inject(PLATFORM_ID) private platformId: any,
    private perfilService: IHttpPerfilService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
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
    this.activatedRoute.paramMap.subscribe((paramsMap: any) => {
      this.getCurrentShout(paramsMap.params?.id);
    });
  }

  getCurrentShout(shoutId: number): void {
    if (!shoutId) {
      return;
    }

    this.perfilService.getShoutById(shoutId).subscribe((value: any) => {
      this.shout = value;

      if (!this.shout) {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = '';
        }
      }
    });
  }

  eliminarShout(): void {
    Swal.fire({
      title: 'Eliminar Shout',
      text: '¿Seguro que deseas eliminar este shout?',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
      cancelButtonText: `Cancelar`,
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService
          .deleteShout(this.shout.id)
          .subscribe((response: any) => {
            if (response) {
              Swal.fire({
                title: 'Eliminado',
                text: 'El shout ha sido eliminado exitosamente',
                icon: 'success',
                timer: 3000,
              }).then(() => {
                if (isPlatformBrowser(this.platformId)) {
                  window.location.href = '';
                }
              });
            }
          });
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
