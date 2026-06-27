import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-comunidad-create',
  templateUrl: './comunidad-create.component.html',
  styleUrls: ['./comunidad-create.component.scss'],
})
export class ComunidadCreateComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public categorias: any[] = [];
  public subCategorias: any[] = [];
  public paises: any[] = [];
  public loading: boolean = false;

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private parametrosService: IHttpParametrosService,
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      nombreCorto: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      comunidadCategoriaId: [0, [Validators.required, Validators.min(1)]],
      comunidadSubCategoriaId: [null],
      paisId: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      acceso: [1, Validators.required],
      permisos: [3, Validators.required],
    });

    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => (this.categorias = v ?? []));
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => (this.paises = v ?? []));
  }

  onNombreChange(): void {
    // Sugerir nombre corto a partir del nombre si el usuario no lo tocó
    const slugCtrl = this.formGroup.get('nombreCorto');
    if (slugCtrl && !slugCtrl.dirty) {
      const slug = (this.formGroup.get('nombre')?.value || '')
        .toLowerCase().trim()
        .normalize('NFD')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      slugCtrl.setValue(slug);
    }
  }

  onCategoriaChange(): void {
    const categoriaId = +this.formGroup.get('comunidadCategoriaId')?.value;
    this.formGroup.get('comunidadSubCategoriaId')?.setValue(null);
    this.subCategorias = [];
    if (categoriaId > 0) {
      this.comunidadesService.getSubCategorias(categoriaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: any) => (this.subCategorias = v ?? []));
    }
  }

  crear(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notificationService.error('Revisa los campos obligatorios', 'Formulario incompleto');
      return;
    }

    this.loading = true;
    const model = Object.assign({}, this.formGroup.value);
    model.acceso = +model.acceso;
    model.permisos = +model.permisos;

    this.comunidadesService.saveComunidad(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Tu comunidad ha sido creada', 'Comunidad creada');
        this.router.navigate(['/comunidades', model.nombreCorto]);
      },
      error: () => { this.loading = false; },
    });
  }
}
