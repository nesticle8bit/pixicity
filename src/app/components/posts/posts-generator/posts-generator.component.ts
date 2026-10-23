import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  ];

  constructor() {
    this.formGroup = this.formBuilder.group({
      imagenInicial: '',
      informacion: '',
      image1: '',
      image2: '',
      image3: '',
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
      buildPost += this.sectionDivider('Bienvenidos');
      buildPost += `<img src='${form.imagenInicial}' alt='Imagen Principal del Post' title='Imagen Principal del Post' /><br/><br/>`;
    }

    if (form.informacion) {
      buildPost += this.sectionDivider('Información');
      buildPost += `<p>${form.informacion.replaceAll(
        '\n',
        '<br/>'
      )}</p><br/><br/>`;
    }

    if (form.image1 || form.image2 || form.image3) {
      buildPost += this.sectionDivider('Imágenes');

      if (form.image1) {
        buildPost += `<img src='${form.image1}' alt='Imagen' /><br/><br/>`;
      }

      if (form.image2) {
        buildPost += `<img src='${form.image2}' alt='Imagen' /><br/><br/>`;
      }

      if (form.image3) {
        buildPost += `<img src='${form.image3}' alt='Imagen' /><br/><br/>`;
      }
    }

    // Mismo bloque que inserta el editor: en el post se cambia por el reproductor al hacer clic
    const videos = [form.video1, form.video2].map((v: string) => videoYoutube(v)).filter((v) => !!v);
    if (videos.length) {
      buildPost += this.sectionDivider(videos.length > 1 ? 'Videos' : 'Video');
      videos.forEach((video) => (buildPost += videoNode(video!).outerHTML));
      buildPost += `<br/>`;
    }

    if (form.links) {
      buildPost += this.sectionDivider('Links de Descarga');

      let links = form.links.split('\n').filter((link: string) => link);

      if (links?.length > 0) {
        links.map((link: string) => {
          buildPost += `<a href='${link}'>${link}</a><br/>`;
        });
      }

      buildPost += `<br/><br/>`;
    }

    if (form.password) {
      buildPost += this.sectionDivider('Contraseña');
      buildPost += `🔐 <strong>Contraseña:</strong> ${form.password}<br/>`;
    }

    this.dialogRef.close(buildPost);
  }

  private sectionDivider(title: string): string {
    const variant = this.formGroup.value.divisor || 'lines';
    return `<div class="ph-sep ph-sep--${variant}"><span class="ph-sep__txt">${title}</span></div>`;
  }
}
