import { Component, DestroyRef, inject, Input, OnInit, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { HomeDiscordComponent } from '../../home/home-discord/home-discord.component';
import { enNavegador } from '../../../shared/helpers/plataforma';
import { Anuncio, anuncioAlAzar, leerAnuncios } from '../ads-rotacion';
import { ContenidoSeoPipe } from '../../../shared/pipes/contenidoSeo.pipe';

@Component({
    selector: 'ads-by-type',
    templateUrl: './ads-by-type.component.html',
    styleUrls: ['./ads-by-type.component.scss'],
    imports: [MatTooltip, HomeDiscordComponent, ContenidoSeoPipe]
})
export class AdsByTypeComponent implements OnInit {
  private webService = inject(IHttpWebService);

  private readonly destroyRef = inject(DestroyRef);

  readonly type = input<string>('');
  @Input() class: string = '';
  readonly hideTitle = input<boolean>(false);

  /** Anuncio elegido al azar entre los configurados para este tamaño. */
  readonly anuncio = signal<Anuncio | null>(null);

  ngOnInit(): void {
    const type = this.type();
    // Solo en el navegador: el azar en el servidor no coincidiría con el del cliente al hidratar.
    if(!type || !enNavegador()) {
      return;
    }

    this.webService.getPublicidad(type).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: string) => {
      this.anuncio.set(anuncioAlAzar(leerAnuncios(value)));
    });
  }

}
