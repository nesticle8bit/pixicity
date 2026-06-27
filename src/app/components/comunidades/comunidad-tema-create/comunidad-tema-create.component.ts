import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-comunidad-tema-create',
  templateUrl: './comunidad-tema-create.component.html',
  styleUrls: ['../comunidad-create/comunidad-create.component.scss'],
})
export class ComunidadTemaCreateComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public comunidad: any = null;
  public loading: boolean = false;
  public slug: string = '';
  public temaId: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      contenido: ['', [Validators.required]],
    });

    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params['slug'];
      this.temaId = +params['id'] || 0;

      this.comunidadesService.getComunidad(this.slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (c: any) => (this.comunidad = c),
        error: () => this.router.navigate(['/comunidades']),
      });

      if (this.temaId) {
        this.cargarTema(this.temaId);
      }
    });
  }

  cargarTema(id: number): void {
    this.comunidadesService.getTema(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (tema: any) => {
        this.formGroup.patchValue({
          titulo: tema.titulo,
          contenido: tema.contenido,
        });
      },
      error: () => this.router.navigate(['/comunidades', this.slug]),
    });
  }

  crear(): void {
    if (this.formGroup.invalid || !this.comunidad) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loading = true;
    const model: any = {
      id: this.temaId,
      comunidadId: this.comunidad.id,
      titulo: this.formGroup.get('titulo')?.value,
      contenido: this.formGroup.get('contenido')?.value,
    };

    this.comunidadesService.saveTema(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (id: any) => {
        if (this.temaId) {
          this.notificationService.success('Tu tema ha sido actualizado', 'Tema actualizado');
          this.router.navigate(['/comunidades', this.slug, 'tema', this.temaId, this.urlSeo(model.titulo)]);
        } else {
          this.notificationService.success('Tu tema ha sido publicado', 'Tema creado');
          this.router.navigate(['/comunidades', this.slug]);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private urlSeo(titulo: string): string {
    return (titulo || '')
      .toLowerCase()
      .replace(/ /g, '-').replace(/\//g, '-')
      .replace(/\(/g, '-').replace(/\)/g, '-')
      .replace(/á/g, 'a').replace(/é/g, 'e')
      .replace(/í/g, 'i').replace(/ó/g, 'o')
      .replace(/ú/g, 'u').replace(/ñ/g, 'n');
  }
}
