import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
    selector: 'app-comunidad-edit',
    templateUrl: './comunidad-edit.component.html',
    styleUrls: ['../comunidad-create/comunidad-create.component.scss'],
    imports: [FormsModule, ReactiveFormsModule],
})
export class ComunidadEditComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private comunidadesService = inject(IHttpComunidadesService);
  private parametrosService = inject(IHttpParametrosService);
  private fotosService = inject(IHttpFotosService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public categorias: any[] = [];
  public subCategorias: any[] = [];
  public paises: any[] = [];
  public loading: boolean = false;
  public uploading: boolean = false;
  public comunidadId: number = 0;
  public nombreCorto: string = '';

  constructor() {
    this.formGroup = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      comunidadCategoriaId: [0, [Validators.required, Validators.min(1)]],
      comunidadSubCategoriaId: [null],
      paisId: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      acceso: [1, Validators.required],
      permisos: [3, Validators.required],
      imagen: [''],
    });

    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => (this.categorias = v ?? []));
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => (this.paises = v ?? []));

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.nombreCorto = params['slug'];
      this.cargar();
    });
  }

  cargar(): void {
    this.comunidadesService.getComunidad(this.nombreCorto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((c) => {
      this.comunidadId = c.id;
      this.formGroup.patchValue({
        id: c.id,
        nombre: c.nombre,
        comunidadCategoriaId: c.categoria?.id ?? 0,
        comunidadSubCategoriaId: c.subCategoria?.id ?? null,
        paisId: c.paisId ?? null,
        descripcion: c.descripcion,
        acceso: c.acceso,
        permisos: c.permisos,
        imagen: c.imagen ?? '',
      });
      if (c.categoria?.id) this.onCategoriaChange(c.subCategoria?.id ?? null);
    });
  }

  onCategoriaChange(keepSub: number | null = null): void {
    const categoriaId = +this.formGroup.get('comunidadCategoriaId')?.value;
    if (keepSub === null) this.formGroup.get('comunidadSubCategoriaId')?.setValue(null);
    this.subCategorias = [];
    if (categoriaId > 0) {
      this.comunidadesService.getSubCategorias(categoriaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => (this.subCategorias = v ?? []));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    this.fotosService.uploadImage(file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (url: string) => {
        this.formGroup.get('imagen')?.setValue(url);
        this.uploading = false;
        this.notificationService.success('Imagen subida', 'Listo');
      },
      error: () => { this.uploading = false; },
    });
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loading = true;
    const model = Object.assign({}, this.formGroup.value);
    model.acceso = +model.acceso;
    model.permisos = +model.permisos;

    this.comunidadesService.updateComunidad(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Comunidad actualizada', 'Guardado');
        this.router.navigate(['/comunidades', this.nombreCorto]);
      },
      error: () => { this.loading = false; },
    });
  }
}
