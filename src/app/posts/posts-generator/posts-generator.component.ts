import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators } from 'ngx-editor';

@Component({
  selector: 'app-posts-generator',
  templateUrl: './posts-generator.component.html',
  styleUrls: ['./posts-generator.component.scss'],
})
export class PostsGeneratorComponent implements OnInit {
  public formGroup: FormGroup;

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
    });
  }

  ngOnInit(): void {}

  generarPost(): void {
    const form = Object.assign({}, this.formGroup.value);
    let buildPost = ``;

    if (form.imagenInicial) {
      buildPost += `<img src='https://i.imgur.com/m7UFsBF.png' alt='Bienvenidos a Pixicity!' title='Bienvenidos a Pixicity!' /><br/>`;
      buildPost += `<img src='${form.imagenInicial}' alt='Imagen Principal del Post' title='Imagen Principal del Post' /><br/><br/>`;
    }

    if (form.informacion) {
      buildPost += `<img src='https://i.imgur.com/WDamJPN.png' alt='Información' title='Información' />`;
      buildPost += `<p>${form.informacion.replaceAll('\n', '<br/>')}</p><br/><br/>`;
    }

    if (form.image1 || form.image2 || form.image3) {
      buildPost += `<img src='https://i.imgur.com/7QlX8rE.png' alt='Imágenes' title='Imágenes' />`;

      if (form.image1) {
        buildPost += `<img src='${form.image1}' alt='Imagen' /><br/>`;
      }

      if (form.image2) {
        buildPost += `<img src='${form.image2}' alt='Imagen' /><br/>`;
      }

      if (form.image3) {
        buildPost += `<img src='${form.image3}' alt='Imagen' /><br/>`;
      }
    }

    if (form.links) {
      buildPost += `<img src='https://i.imgur.com/Vzhycg4.png' alt='Links de Descarga' title='Links de Descarga' />`;
      buildPost += `${form.links.replaceAll('\n', '<br/>')}<br/><br/>`;
    }

    if (form.password) {
      buildPost += `<img src='https://i.imgur.com/EJuzny4.png' alt='Contraseña' title='Contraseña' />`;
      buildPost += `🔐 <strong>Contraseña:</strong> ${form.password}<br/><br/>`;
    }

    this.dialogRef.close(buildPost);
  }
}
