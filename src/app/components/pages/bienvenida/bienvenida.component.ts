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
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RepeticionFondo } from 'src/app/models/seguridad/seguridad-vm.model';
import { ArrastrarFondoDirective, PosicionFondo } from 'src/app/shared/directives/arrastrar-fondo.directive';
import { PORTADA_VALIDA, urlCss } from 'src/app/shared/helpers/url-css';

type Paso = 'perfil' | 'comunidades' | 'personas' | 'primer-shout';

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
  imports: [RouterLink, DecimalPipe, FormsModule, UserAvatarComponent, CargandoComponent, ShoutComposerComponent, ArrastrarFondoDirective],
})
export class BienvenidaComponent {
  private readonly comunidadesService = inject(IHttpComunidadesService);
  private readonly miService = inject(IHttpMiService);
  private readonly usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly dialog = inject(MatDialog);

  readonly usuario = this.securityService.getCurrentUser()?.usuario;
  readonly usuarioId = idUsuarioSesion(this.usuario) ?? 0;
  /** Sin el correo confirmado el API rechaza unirse/seguir/publicar: se avisa en vez de fallar en silencio. */
  readonly sinConfirmar = this.usuario?.emailConfirmado === false;

  readonly pasos: { id: Paso; titulo: string }[] = [
    { id: 'perfil', titulo: 'Tu perfil' },
    { id: 'comunidades', titulo: 'Comunidades' },
    { id: 'personas', titulo: 'A quién seguir' },
    { id: 'primer-shout', titulo: 'Tu primer shout' },
  ];
  readonly paso = signal<Paso>('perfil');

  // Paso "Tu perfil": avatar (mismo diálogo que /cuenta) y portada por URL, como en /perfil/:usuario.
  readonly avatar = signal<string | null>(this.usuario?.avatar ?? null);
  readonly portada = signal('');
  readonly portadaUrl = signal('');
  readonly posPortada = signal<PosicionFondo>({ x: 50, y: 50 });
  readonly guardandoPortada = signal(false);
  readonly portadaGuardada = signal(false);
  /** El fondo de página se reenvía tal cual al guardar la portada (el API guarda todo junto). */
  private fondoPagina: { url: string; repeticion: RepeticionFondo } = { url: '', repeticion: 'repeat' };
  readonly portadaValida = computed(() => (PORTADA_VALIDA.test(this.portadaUrl().trim()) ? this.portadaUrl().trim() : ''));
  readonly portadaInvalida = computed(() => !!this.portadaUrl().trim() && !this.portadaValida());
  /** Vista previa: lo que se está escribiendo si es válido; si no, la guardada. */
  readonly portadaCss = computed(() => urlCss(this.portadaValida() || this.portada()));
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

    if (this.usuario?.userName) {
      this.securityService
        .getUserByUserName(this.usuario.userName)
        .pipe(catchError(() => of(null)), takeUntilDestroyed())
        .subscribe((p) => {
          if (!p) return;
          this.avatar.set(p.avatar || null);
          this.portada.set(p.profileBackground ?? '');
          this.portadaUrl.set(p.profileBackground ?? '');
          this.posPortada.set({ x: p.profileBackgroundPosX ?? 50, y: p.profileBackgroundPosY ?? 50 });
          this.fondoPagina = { url: p.profilePageBackground ?? '', repeticion: p.profilePageBackgroundRepeat ?? 'repeat' };
        });
    }
  }

  async cambiarAvatar(): Promise<void> {
    const { DialogChangeAvatarComponent } = await import('../../dialogs/dialog-change-avatar/dialog-change-avatar.component');
    this.dialog
      .open(DialogChangeAvatarComponent, { width: '350px', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((avatar?: string) => {
        if (!avatar) return;
        this.avatar.set(avatar);
        const sesion = this.securityService.getCurrentUser();
        if (sesion.usuario) {
          sesion.usuario.avatar = avatar;
          this.securityService.setUserToLocalStorage(sesion);
        }
      });
  }

  guardarPortada(): void {
    if (this.portadaInvalida() || this.guardandoPortada()) return;
    const url = this.portadaValida();
    const { x, y } = this.posPortada();
    this.guardandoPortada.set(true);
    this.usuarioPerfilService
      .changeBackgroundProfile({
        profileBackground: url,
        profileBackgroundPosX: x,
        profileBackgroundPosY: y,
        profilePageBackground: this.fondoPagina.url,
        profilePageBackgroundRepeat: this.fondoPagina.repeticion,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.guardandoPortada.set(false);
          if (!ok) return;
          this.portada.set(url);
          this.portadaGuardada.set(true);
        },
        error: () => this.guardandoPortada.set(false),
      });
  }

  moverPortada(pos: PosicionFondo): void {
    this.posPortada.set(pos);
    this.portadaGuardada.set(false);
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
