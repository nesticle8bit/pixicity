import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { RichEditorComponent } from '../../../../shared/rich-editor/rich-editor.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PaginaAdmin } from 'src/app/models/admin/filas-admin.model';

type TipoPagina = 'routerLink' | 'link';

/** Las páginas internas se guardan con la ruta completa ("/paginas/dmca"). */
const PREFIJO = '/paginas/';

@Component({
    selector: 'app-dialog-create-update-paginas',
    templateUrl: './dialog-create-update-paginas.component.html',
    styleUrls: ['./dialog-create-update-paginas.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        MatDialogContent,
        RichEditorComponent,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        MatIcon,
    ],
})
export class DialogCreateUpdatePaginasComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogCreateUpdatePaginasComponent>>(MatDialogRef);
  private webService = inject(IHttpWebService);
  data = inject<PaginaAdmin | null>(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public readonly prefijo = PREFIJO;
  public readonly targets = [
    { valor: '_blank', texto: 'Nueva pestaña' },
    { valor: '_self', texto: 'Misma pestaña' },
  ];

  public formGroup: FormGroup;
  public guardando = false;
  /** El slug sigue al título hasta que el usuario lo edita a mano. */
  private slugManual = false;

  constructor() {
    this.formGroup = this.formBuilder.group(
      {
        id: 0,
        titulo: ['', [Validators.required, Validators.maxLength(120)]],
        slug: ['', Validators.required],
        tipo: ['routerLink' as TipoPagina],
        target: ['_self'],
        contenido: [''],
        eliminado: false,
      },
      { validators: (g) => this.validarPorTipo(g) },
    );
  }

  get esInterna(): boolean {
    return this.formGroup.value.tipo !== 'link';
  }

  ngOnInit(): void {
    if (this.data) {
      const tipo: TipoPagina = this.data.tipo === 'link' ? 'link' : 'routerLink';
      let slug = this.data.slug ?? '';
      if (tipo === 'routerLink') slug = slug.replace(/^\/?(paginas\/)?/, '');

      this.slugManual = true;
      this.formGroup.patchValue({
        id: this.data.id,
        titulo: this.data.titulo,
        slug,
        tipo,
        target: this.data.target || (tipo === 'link' ? '_blank' : '_self'),
        contenido: this.data.contenido,
        eliminado: this.data.eliminado ?? false,
      });
    }

    this.formGroup.get('titulo')!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((titulo: string) => {
      if (!this.slugManual && this.esInterna) {
        this.formGroup.get('slug')!.setValue(this.slugificar(titulo));
      }
    });
  }

  cambiarTipo(tipo: TipoPagina): void {
    if (tipo === this.formGroup.value.tipo) return;
    this.slugManual = tipo === 'link';
    this.formGroup.patchValue({
      tipo,
      target: tipo === 'link' ? '_blank' : '_self',
      slug: tipo === 'routerLink' ? this.slugificar(this.formGroup.value.titulo) : '',
    });
  }

  onSlugInput(): void {
    this.slugManual = true;
  }

  normalizarSlug(): void {
    if (!this.esInterna) return;
    const control = this.formGroup.get('slug')!;
    control.setValue(this.slugificar(control.value));
  }

  /** Ruta final tal como se guarda y se enlaza en el footer. */
  get destino(): string {
    const slug = (this.formGroup.value.slug ?? '').trim();
    if (!slug) return '';
    return this.esInterna ? PREFIJO + slug : slug;
  }

  invalido(campo: string): boolean {
    const c = this.formGroup.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  savePagina(): void {
    if (this.formGroup.invalid || this.guardando) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const value = { ...this.formGroup.value, slug: this.destino, contenido: this.formGroup.value.contenido ?? '' };

    this.guardando = true;
    this.webService
      .savePagina(value)
      .pipe(finalize(() => (this.guardando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success(
            value.id ? 'La página se ha actualizado correctamente' : 'La página se ha guardado correctamente',
            value.id ? 'Actualizar' : 'Guardar',
          );
          this.dialogRef.close(response);
        }
      });
  }

  private validarPorTipo(g: AbstractControl): ValidationErrors | null {
    const { tipo, slug, contenido } = g.value ?? {};
    const errores: ValidationErrors = {};
    const valor = (slug ?? '').trim();

    if (tipo === 'link') {
      if (valor && !/^(https?:\/\/|\/|mailto:)/i.test(valor)) errores['urlInvalida'] = true;
    } else {
      if (valor && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(valor)) errores['slugInvalido'] = true;
      if (!(contenido ?? '').replace(/<[^>]*>|&nbsp;/g, '').trim()) errores['contenidoRequerido'] = true;
    }
    return Object.keys(errores).length ? errores : null;
  }

  private slugificar(texto: string): string {
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80);
  }
}
