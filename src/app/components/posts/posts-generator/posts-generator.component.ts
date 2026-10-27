import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { videoYoutube } from 'src/app/shared/helpers/youtube';
import { videoNode } from '../../shared/rich-editor/rich-editor-paste';

// Vacío es válido (los videos son opcionales); con algo escrito tiene que ser un enlace de YouTube
function enlaceYoutubeValidator(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value || '').trim();
  return !valor || videoYoutube(valor) ? null : { youtube: true };
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Una línea de "Links de descarga": el texto queda tal cual y solo las URLs pasan a ser enlaces
export function enlazar(linea: string): string {
  return linea
    .split(/(https?:\/\/[^\s<>"']+)/i)
    .map((parte, i) => {
      if (i % 2 === 0) return escaparHtml(parte);
      // Puntuación final ("…descarga.", "(link)") no es parte de la URL
      const [, url, cola] = parte.match(/^(.*?)([.,;:!?)\]]*)$/)!;
      const href = escaparHtml(url);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>${escaparHtml(cola)}`;
    })
    .join('');
}

@Component({
    selector: 'app-posts-generator',
    templateUrl: './posts-generator.component.html',
    styleUrls: ['./posts-generator.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class PostsGeneratorComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<PostsGeneratorComponent>>(MatDialogRef);

  public formGroup: FormGroup;

  public readonly dividers = [
    { id: 'lines', label: 'Líneas' },
    { id: 'dotted', label: 'Punteado' },
    { id: 'bar', label: 'Barra' },
    { id: 'side', label: 'Lateral' },
    { id: 'double', label: 'Doble línea' },
    { id: 'pill', label: 'Píldora' },
    { id: 'underline', label: 'Subrayado' },
    { id: 'dashed', label: 'Recuadro' },
    { id: 'tab', label: 'Pestaña' },
    { id: 'dark', label: 'Oscuro' },
    { id: 'stars', label: 'Estrellas' },
    { id: 'shadow', label: 'Tarjeta' },
  ];

  public readonly maxImagenes = 12;

  get imagenes(): FormArray {
    return this.formGroup.get('imagenes') as FormArray;
  }

  agregarImagen(): void {
    if (this.imagenes.length < this.maxImagenes) this.imagenes.push(this.formBuilder.control(''));
  }

  quitarImagen(i: number): void {
    this.imagenes.removeAt(i);
  }

  constructor() {
    this.formGroup = this.formBuilder.group({
      imagenInicial: '',
      informacion: '',
      imagenes: this.formBuilder.array(['', '', '']),
      video1: ['', enlaceYoutubeValidator],
      video2: ['', enlaceYoutubeValidator],
      links: '',
      password: '',
      divisor: 'lines',
    });
  }

  selectDivider(id: string): void {
    this.formGroup.patchValue({ divisor: id });
  }

  ngOnInit(): void {}

  videoInvalido(): boolean {
    return ['video1', 'video2'].some((n) => {
      const control = this.formGroup.get(n)!;
      return control.invalid && (control.dirty || control.touched);
    });
  }

  generarPost(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const form = Object.assign({}, this.formGroup.value);
    let buildPost = ``;

    if (form.imagenInicial) {
      buildPost += this.sectionDivider('👋', 'Bienvenidos');
      buildPost += `<img src='${form.imagenInicial}' alt='Imagen Principal del Post' title='Imagen Principal del Post' /><br/><br/>`;
    }

    if (form.informacion) {
      buildPost += this.sectionDivider('ℹ️', 'Información');
      buildPost += `<p>${form.informacion.replaceAll(
        '\n',
        '<br/>'
      )}</p><br/><br/>`;
    }

    const imagenes = (form.imagenes as string[]).map((i) => (i || '').trim()).filter((i) => !!i);
    if (imagenes.length) {
      buildPost += this.sectionDivider('🖼️', 'Imágenes');
      imagenes.forEach((imagen) => (buildPost += `<img src='${escaparHtml(imagen)}' alt='Imagen' /><br/><br/>`));
    }

    // Mismo bloque que inserta el editor: en el post se cambia por el reproductor al hacer clic
    const videos = [form.video1, form.video2].map((v: string) => videoYoutube(v)).filter((v) => !!v);
    if (videos.length) {
      buildPost += this.sectionDivider('🎬', videos.length > 1 ? 'Videos' : 'Video');
      videos.forEach((video) => (buildPost += videoNode(video!).outerHTML));
      buildPost += `<br/>`;
    }

    const lineas = (form.links || '').split('\n').map((l: string) => l.trim()).filter((l: string) => !!l);
    if (lineas.length) {
      buildPost += this.sectionDivider('📥', 'Links de Descarga');
      lineas.forEach((linea: string) => (buildPost += `${enlazar(linea)}<br/>`));
      buildPost += `<br/><br/>`;
    }

    if (form.password) {
      buildPost += this.sectionDivider('🔐', 'Contraseña');
      buildPost += `🔐 <strong>Contraseña:</strong> ${form.password}<br/>`;
    }

    this.dialogRef.close(buildPost);
  }

  private sectionDivider(icono: string, title: string): string {
    const variant = this.formGroup.value.divisor || 'lines';
    return `<div class="ph-sep ph-sep--${variant}"><span class="ph-sep__txt">${icono} ${title}</span></div>`;
  }
}
