import { ChangeDetectionStrategy, Component, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NsfwService } from 'src/app/services/shared/nsfw.service';
import { EDAD_NSFW, edadDesde } from 'src/app/shared/helpers/edad';

/** /cuenta → Contenido sensible: ver la media de los shouts NSFW sin difuminar (solo 18+ con la fecha cargada). */
@Component({
  selector: 'app-account-nsfw',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggle, RouterLink],
  template: `
    <section class="ns">
      <div class="ns__item">
        <span>
          <span class="ns__label" id="ns-mostrar">Mostrar contenido NSFW sin difuminar</span>
          <span class="ns__detalle">Las fotos y videos de los shouts marcados NSFW se verán directamente, sin tener que tocar "Mostrar".</span>
        </span>
        <mat-slide-toggle [checked]="activo()" [disabled]="guardando() || bloqueado()"
          aria-labelledby="ns-mostrar" (change)="cambiar($event.checked)" />
      </div>

      @if (edad() === null) {
        <p class="ns__aviso">
          Para activarlo agrega tu fecha de nacimiento en
          <a routerLink="/cuenta" [queryParams]="{ seccion: 'datos' }">Datos de la cuenta</a>.
        </p>
      } @else if (edad()! < edadMinima) {
        <p class="ns__aviso">El contenido NSFW es solo para mayores de {{ edadMinima }} años.</p>
      }
    </section>
  `,
  styles: `
    .ns { max-width: 560px; padding: 16px 4px; }
    .ns__item {
      display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px;
      border: 1px solid light-dark(#e3e9ed, #354652); border-radius: 10px;
    }
    .ns__label { display: block; font-size: 0.9rem; font-weight: 700; color: light-dark(#26323a, #c7d2da); }
    .ns__detalle { display: block; font-size: 0.78rem; color: light-dark(#5d6b75, #aeaeae); }
    .ns__aviso { margin: 10px 2px 0; font-size: 0.82rem; color: light-dark(#8a5a00, #e0b35c); }
  `,
})
export class AccountNsfwComponent {
  readonly nsfw = inject(NsfwService);
  private readonly destroyRef = inject(DestroyRef);

  readonly edadMinima = EDAD_NSFW;
  /** undefined = cargando; null = sin fecha de nacimiento. */
  readonly edad = signal<number | null | undefined>(undefined);
  readonly guardando = signal(false);
  /** Lo que muestra el toggle: sigue a la sesión, y vuelve atrás si el API rechaza el cambio. */
  readonly activo = linkedSignal(() => this.nsfw.mostrar());

  constructor() {
    inject(IHttpSecurityService)
      .getLoggedUserByJwt()
      .pipe(takeUntilDestroyed())
      .subscribe((u) => {
        this.edad.set(edadDesde(u?.fechaNacimiento));
        // La cuenta manda: corrige la sesión guardada si quedó vieja (otro dispositivo, fecha cambiada).
        if (u) this.nsfw.recordar(!!u.mostrarNsfw);
      });
  }

  /** Apagarlo siempre se puede; encenderlo, solo con 18+ (el API lo vuelve a comprobar). */
  bloqueado(): boolean {
    const edad = this.edad();
    return !this.activo() && (edad == null || edad < EDAD_NSFW);
  }

  cambiar(mostrar: boolean): void {
    this.activo.set(mostrar);
    this.guardando.set(true);
    this.nsfw
      .establecer(mostrar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.guardando.set(false),
        // El interceptor ya muestra el motivo; el toggle vuelve al valor guardado.
        error: () => {
          this.guardando.set(false);
          this.activo.set(!mostrar);
        },
      });
  }
}
