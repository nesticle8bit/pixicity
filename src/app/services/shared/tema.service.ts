import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { enNavegador } from '../../shared/helpers/plataforma';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';

/** Lo que elige el usuario. "sistema" sigue a prefers-color-scheme. */
export type PreferenciaTema = 'light' | 'dark' | 'sistema';

const CLAVE = 'tema';
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
