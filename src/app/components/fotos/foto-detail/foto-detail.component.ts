import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-foto-detail',
  templateUrl: './foto-detail.component.html',
  styleUrls: ['./foto-detail.component.scss'],
})
export class FotoDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public foto: any = null;
  public currentUser: any;
  public loading: boolean = true;
  public fotoId: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private fotosService: IHttpFotosService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
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
      next: (response: any) => {
        this.foto = response;
        this.loading = false;
        // Increment visit count (fire and forget)
        this.fotosService.incrementVisitas(this.fotoId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/fotos']);
      },
    });
  }

  votar(cantidad: number): void {
    if (!this.currentUser?.usuario) return;

    this.fotosService.votarFoto(this.fotoId, cantidad).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
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
