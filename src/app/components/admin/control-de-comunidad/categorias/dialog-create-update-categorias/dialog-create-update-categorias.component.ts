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
    'address-book-open.png',
    'android.png',
    'animaciones.png',
    'apuntes-monografias.png',
    'arte.png',
    'autos-motos.png',
    'baggage-cart-box-label.png',
    'beaker.png',
    'billboard.png',
    'book-open-bookmark.png',
    'book-open-list.png',
    'book-open-text-image.png',
    'books-brown.png',
    'box.png',
    'box-search-result.png',
    'briefcase.png',
    'camera.png',
    'celulares.png',
    'ciencia-educacion.png',
    'clapperboard.png',
    'cohete.png',
    'comics.png',
    'controller-d-pad.png',
    'deportes.png',
    'downloads.png',
    'downloads-black.png',
    'e-book-reader-white.png',
    'ebooks-tutoriales.png',
    'ecologia.png',
    'economia-negocios.png',
    'eye.png',
    'femme.png',
    'films.png',
    'folder.png',
    'folder-open-film.png',
    'guitar.png',
    'hamburger.png',
    'hazlotumismo.png',
    'humor.png',
    'imagenes.png',
    'inbox-film.png',
    'info.png',
    'juegos.png',
    'joystick.png',
    'key.png',
    'license-key.png',
    'links.png',
    'mac.png',
    'magnet.png',
    'magnet-blue.png',
    'manga-anime.png',
    'mascotas.png',
    'media-player.png',
    'money-bag-dollar.png',
    'money-coin.png',
    'musica.png',
    'new.png',
    'noticias.png',
    'offtopic.png',
    'paranormal.png',
    'pixicity.png',
    'plate-cutlery.png',
    'popcorn.png',
    'rainbow.png',
    'recetas-cocina.png',
    'salud-bienestar.png',
    'solidaridad.png',
    'stamp.png',
    'sticky.png',
    'television-test.png',
    'tie.png',
    'tie-warm.png',
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
