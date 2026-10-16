import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ComunidadCard } from 'src/app/models/comunidades/comunidad.model';
import { SugerenciaUsuario, Tendencia } from 'src/app/models/mi/mi-vm.model';
import { idUsuarioSesion } from 'src/app/models/security/jwtUser.model';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';

type Paso = 'comunidades' | 'personas' | 'primer-shout';

interface Elegible {
  procesando?: boolean;
  elegido?: boolean;
}

/**
 * /bienvenida: el primer ingreso después de registrarse. Un usuario nuevo llegaba a un muro vacío; acá se une a
 * comunidades, sigue a gente y publica su primer shout antes de ir a /mi. Todo es opcional (se puede saltear).
 */
@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  imports: [RouterLink, DecimalPipe, UserAvatarComponent, CargandoComponent, ShoutComposerComponent],
})
export class BienvenidaComponent {
  private readonly comunidadesService = inject(IHttpComunidadesService);
  private readonly miService = inject(IHttpMiService);
  private readonly usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly usuario = inject(IHttpSecurityService).getCurrentUser()?.usuario;
  readonly usuarioId = idUsuarioSesion(this.usuario) ?? 0;
  /** Sin el correo confirmado el API rechaza unirse/seguir/publicar: se avisa en vez de fallar en silencio. */
  readonly sinConfirmar = this.usuario?.emailConfirmado === false;

  readonly pasos: { id: Paso; titulo: string }[] = [
    { id: 'comunidades', titulo: 'Comunidades' },
    { id: 'personas', titulo: 'A quién seguir' },
    { id: 'primer-shout', titulo: 'Tu primer shout' },
  ];
  readonly paso = signal<Paso>('comunidades');
  readonly indice = computed(() => this.pasos.findIndex((p) => p.id === this.paso()));

  readonly comunidades = signal<(ComunidadCard & Elegible)[] | null>(null);
  readonly personas = signal<(SugerenciaUsuario & Elegible)[] | null>(null);
  readonly tendencias = signal<Tendencia[]>([]);
  readonly publicado = signal(false);

  readonly unidas = computed(() => (this.comunidades() ?? []).filter((c) => c.elegido).length);
  readonly seguidas = computed(() => (this.personas() ?? []).filter((p) => p.elegido).length);

  constructor() {
    inject(DisplayComponentService).setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: false, background: '' });
    inject(SEOService).setSEO({ title: 'Bienvenida', description: 'Primeros pasos en la comunidad', type: 'website', imageURL: '', tags: [], noIndex: true });

    this.comunidadesService
      .getTopComunidades(9)
      .pipe(catchError(() => of([])), takeUntilDestroyed())
      .subscribe((l) => this.comunidades.set(l));
    this.miService
      .getSugerencias(9)
      .pipe(catchError(() => of([])), takeUntilDestroyed())
      .subscribe((l) => this.personas.set(l));
    this.miService
      .getTendencias(8, 'mejores')
      .pipe(takeUntilDestroyed())
      .subscribe((l) => this.tendencias.set(l));
  }

  irA(paso: Paso): void {
    this.paso.set(paso);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  siguiente(): void {
    const i = this.indice();
    if (i < this.pasos.length - 1) this.irA(this.pasos[i + 1].id);
    else this.terminar();
  }

  terminar(): void {
    this.router.navigate(['/mi']);
  }

  alternarComunidad(c: ComunidadCard & Elegible): void {
    if (c.procesando) return;
    this.actualizar(this.comunidades, c.id, { procesando: true });
    const pedido = c.elegido ? this.comunidadesService.abandonar(c.id) : this.comunidadesService.unirme(c.id);
    pedido.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.actualizar(this.comunidades, c.id, { procesando: false, elegido: !c.elegido }),
      error: () => this.actualizar(this.comunidades, c.id, { procesando: false }),
    });
  }

  alternarPersona(p: SugerenciaUsuario & Elegible): void {
    if (p.procesando) return;
    this.personas.update((l) => l?.map((x) => (x.userName === p.userName ? { ...x, procesando: true } : x)) ?? null);
    this.usuarioPerfilService
      .seguirUsuario({ userName: p.userName })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.personas.update((l) => l?.map((x) => (x.userName === p.userName ? { ...x, procesando: false, elegido: !p.elegido } : x)) ?? null),
        error: () => this.personas.update((l) => l?.map((x) => (x.userName === p.userName ? { ...x, procesando: false } : x)) ?? null),
      });
  }

  private actualizar(lista: typeof this.comunidades, id: number, cambios: Elegible): void {
    lista.update((l) => l?.map((x) => (x.id === id ? { ...x, ...cambios } : x)) ?? null);
  }
}
