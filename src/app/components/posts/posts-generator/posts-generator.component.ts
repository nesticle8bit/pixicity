import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-posts-generator',
  templateUrl: './posts-generator.component.html',
  styleUrls: ['./posts-generator.component.scss'],
})
export class PostsGeneratorComponent implements OnInit {
  public formGroup: FormGroup;

  public readonly dividers = [
    { id: 'lines', label: 'Líneas' },
    { id: 'dotted', label: 'Punteado' },
    { id: 'bar', label: 'Barra' },
    { id: 'side', label: 'Lateral' },
    { id: 'double', label: 'Doble línea' },
    { id: 'pill', label: 'Píldora' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PostsGeneratorComponent>
  ) {
    this.formGroup = this.formBuilder.group({
      imagenInicial: '',
      informacion: '',
      image1: '',
      image2: '',
      image3: '',
      links: '',
      password: '',
      divisor: 'lines',
    });
  }

  selectDivider(id: string): void {
    this.formGroup.patchValue({ divisor: id });
  }

  ngOnInit(): void {}

  generarPost(): void {
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
