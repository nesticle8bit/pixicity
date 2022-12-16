import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from 'ngx-editor';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-create-update-categorias',
  templateUrl: './dialog-create-update-categorias.component.html',
  styleUrls: ['./dialog-create-update-categorias.component.scss'],
})
export class DialogCreateUpdateCategoriasComponent implements OnInit {
  public iconos: string[] = [
    'animaciones.png',
    'apuntes-monografias.png',
    'arte.png',
    'autos-motos.png',
    'baggage-cart-box-label.png',
    'box.png',
    'box-search-result.png',
    'celulares.png',
    'ciencia-educacion.png',
    'cohete.png',
    'comics.png',
    'deportes.png',
    'downloads-black.png',
    'downloads.png',
    'ebooks-tutoriales.png',
    'ecologia.png',
    'economia-negocios.png',
    'eye.png',
    'femme.png',
    'films.png',
    'guitar.png',
    'hazlotumismo.png',
    'humor.png',
    'imagenes.png',
    'inbox-film.png',
    'info.png',
    'juegos.png',
    'key.png',
    'links.png',
    'mac.png',
    'manga-anime.png',
    'mascotas.png',
    'money-bag-dollar.png',
    'musica.png',
    'new.png',
    'noticias.png',
    'offtopic.png',
    'paranormal.png',
    'pixicity.png',
    'popcorn.png',
    'rainbow.png',
    'recetas-cocina.png',
    'salud-bienestar.png',
    'solidaridad.png',
    'sticky.png',
    'truck-box-label.png',
    'turismo.png',
    'tux.png',
    'tv-peliculas-series.png',
    'videos-online.png',
    'world.png',
  ];
  public formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdateCategoriasComponent>,
    private parametrosService: IHttpParametrosService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: this.data?.id ? this.data?.id : 0,
      eliminado: this.data?.eliminado ? this.data?.eliminado : false,
      nombre: [this.data?.nombre, Validators.required],
      icono: [this.data?.icono, Validators.required],
      seo: [this.data?.seo, Validators.required],
    });
  }

  ngOnInit(): void {}

  saveCategoria(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const categoria = Object.assign({}, this.formGroup.value);

    this.parametrosService
      .saveCategoria(categoria)
      .subscribe((response: any) => {
        if (response) {
          Swal.fire({
            title: 'Guardado',
            text: 'La categoría se ha guardado correctamente',
            icon: 'success',
            timer: 3000,
          });

          this.dialogRef.close(true);
        }
      });
  }
}
