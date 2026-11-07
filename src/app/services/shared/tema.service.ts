import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { enNavegador } from '../../shared/helpers/plataforma';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';

/** Lo que elige el usuario. "sistema" sigue a prefers-color-scheme. */
export type PreferenciaTema = 'light' | 'dark' | 'sistema';

const CLAVE = 'tema';
const CLAVE_COLOR = 'tema-color';

/** Colores de la cabecera. El azul es el original (sin data-color). Sus tonos están en styles/_cabecera.scss. */
export const COLORES_TEMA = [
  { valor: 'azul', nombre: 'Azul', muestra: '#004160' },
  { valor: 'naranja', nombre: 'Naranja', muestra: '#b4480f' },
  { valor: 'rojo', nombre: 'Rojo', muestra: '#a81e2c' },
  { valor: 'rosa', nombre: 'Rosa', muestra: '#b0246f' },
  { valor: 'morado', nombre: 'Morado', muestra: '#6232a8' },
  { valor: 'turquesa', nombre: 'Turquesa', muestra: '#0b7a75' },
  { valor: 'verde', nombre: 'Verde', muestra: '#2c7a2e' },
  { valor: 'gris', nombre: 'Gris', muestra: '#4a5058' },
] as const;
export type ColorTema = (typeof COLORES_TEMA)[number]['valor'];
const CONSULTA_OSCURO = '(prefers-color-scheme: dark)';

/**
 * Tema claro/oscuro. Pone data-theme y data-bs-theme en <html> (los colores usan light-dark(), ver styles/_tema.scss).
 * El script de index.html aplica lo mismo antes de pintar; este servicio lo mantiene al día después:
 * - la preferencia vive en localStorage (también para visitantes) y se sincroniza entre pestañas;
 * - con sesión se guarda en la cuenta (PUT usuarios/me/tema) y al iniciar sesión en otro dispositivo se adopta.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private http = inject(HttpClient);
  private securityService = inject(IHttpSecurityService);

  readonly preferencia = signal<PreferenciaTema>('sistema');
  readonly color = signal<ColorTema>('azul');
  private readonly sistemaOscuro = signal(false);
  /** Tema que se ve ahora mismo. */
  readonly efectivo = computed<'light' | 'dark'>(() => {
    const p = this.preferencia();
    return p === 'sistema' ? (this.sistemaOscuro() ? 'dark' : 'light') : p;
  });

  private usuarioId: string | undefined;

  constructor() {
    if (!enNavegador()) return;

    this.preferencia.set(leerPreferencia());
    this.color.set(leerColor());
    const consulta = matchMedia(CONSULTA_OSCURO);
    this.sistemaOscuro.set(consulta.matches);
    consulta.addEventListener('change', (e) => {
      this.sistemaOscuro.set(e.matches);
      this.aplicar();
    });

    window.addEventListener('storage', (e) => {
      if (e.key === CLAVE) {
        this.preferencia.set(leerPreferencia());
        this.aplicar();
      }
      if (e.key === CLAVE_COLOR) {
        this.color.set(leerColor());
        this.aplicar();
      }
    });

    // La sesión guardada al cargar la página no cuenta como "inicio de sesión": manda el localStorage.
    this.usuarioId = this.securityService.getCurrentUser()?.usuario?.id;
    this.securityService.getCurrentUserAsObservable().subscribe((sesion) => {
      const usuario = sesion?.usuario;
      if (usuario?.id === this.usuarioId) return;
      this.usuarioId = usuario?.id;
      if (!usuario || !('tema' in usuario)) return;

      if (usuario.tema === 'light' || usuario.tema === 'dark') {
        this.establecer(usuario.tema, false);
      } else if (this.preferencia() !== 'sistema') {
        // La cuenta no tenía tema: se queda el que eligió como visitante.
        this.guardarEnCuenta(this.preferencia());
      }
    });

    this.aplicar();
  }

  establecer(preferencia: PreferenciaTema, guardarEnCuenta = true): void {
    this.preferencia.set(preferencia);
    try {
      if (preferencia === 'sistema') localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, preferencia);
    } catch { /* almacenamiento bloqueado: el tema dura lo que la pestaña */ }
    this.aplicar();
    if (guardarEnCuenta && this.securityService.getCurrentUser()?.usuario) this.guardarEnCuenta(preferencia);
  }

  /** En prueba: solo este usuario ve el selector. Solo oculta la interfaz, no es un permiso. */
  get puedeElegirColor(): boolean {
    return this.securityService.getCurrentUser()?.usuario?.userName?.toLowerCase() === 'gorgoroth';
  }

  /** Por ahora solo en este navegador. */
  establecerColor(color: ColorTema): void {
    this.color.set(color);
    try {
      if (color === 'azul') localStorage.removeItem(CLAVE_COLOR);
      else localStorage.setItem(CLAVE_COLOR, color);
    } catch { /* almacenamiento bloqueado: el color dura lo que la pestaña */ }
    this.aplicar();
  }

  /** Alterna claro/oscuro partiendo de lo que se ve (el botón de la cabecera). */
  alternar(): void {
    this.establecer(this.efectivo() === 'dark' ? 'light' : 'dark');
  }

  private guardarEnCuenta(preferencia: PreferenciaTema): void {
    this.http.put(`${environment.api}/api/usuarios/me/tema`, { tema: preferencia }).subscribe({ error: () => { } });
  }

  private aplicar(): void {
    const raiz = document.documentElement;
    raiz.setAttribute('data-theme', this.efectivo());
    raiz.setAttribute('data-bs-theme', this.efectivo());
    if (this.color() === 'azul') raiz.removeAttribute('data-color');
    else raiz.setAttribute('data-color', this.color());
  }
}

function leerColor(): ColorTema {
  try {
    const c = localStorage.getItem(CLAVE_COLOR);
    return COLORES_TEMA.find((x) => x.valor === c)?.valor ?? 'azul';
  } catch {
    return 'azul';
  }
}

function leerPreferencia(): PreferenciaTema {
  try {
    const t = localStorage.getItem(CLAVE);
    return t === 'light' || t === 'dark' ? t : 'sistema';
  } catch {
    return 'sistema';
  }
}
