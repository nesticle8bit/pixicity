import { ComponentRef, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { UsuarioAvatarViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { MencionesListaComponent } from './menciones-lista.component';

/** "@nombre" justo antes del cursor (al inicio o después de algo que no sea letra/@). */
const TOKEN = /(^|[^\w@])@(\w{1,30})$/;
let siguienteId = 0;

/**
 * Autocompletar @menciones en un textarea: al escribir "@ab" sugiere usuarios cuyo nombre empieza así.
 * ↑/↓ recorren, Enter o Tab eligen, Escape cierra. Al elegir reemplaza "@ab" por "@nombre " y avisa a ngModel con
 * un evento input. Las menciones ya notifican al usuario al guardar el comentario (API).
 */
@Directive({
  selector: 'textarea[appMenciones]',
  host: {
    '(input)': 'alEscribir()',
    '(click)': 'alEscribir()',
    '(keydown)': 'tecla($event)',
    '(blur)': 'cerrar()',
    'aria-autocomplete': 'list',
    '[attr.aria-expanded]': 'abierto()',
    '[attr.aria-controls]': 'abierto() ? idLista : null',
    '[attr.aria-activedescendant]': 'abierto() ? idLista + "-" + activa() : null',
  },
})
export class MencionesDirective {
  private readonly el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly perfilService = inject(IHttpUsuarioPerfilService);

  readonly idLista = `menciones-${++siguienteId}`;
  readonly sugerencias = signal<UsuarioAvatarViewModel[]>([]);
  readonly activa = signal(0);
  readonly abierto = signal(false);

  private readonly consultas = new Subject<string>();
  private overlayRef: OverlayRef | null = null;
  private lista: ComponentRef<MencionesListaComponent> | null = null;

  constructor() {
    this.consultas
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((q) => (q ? this.perfilService.sugerirMenciones(q) : of([]))),
        takeUntilDestroyed(),
      )
      .subscribe((usuarios) => {
        // Si mientras llegaba la respuesta el cursor dejó de estar en una mención, no se abre.
        if (!this.token()) usuarios = [];
        this.sugerencias.set(usuarios);
        this.activa.set(0);
        usuarios.length ? this.abrir() : this.cerrar();
      });

    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  alEscribir(): void {
    const token = this.token();
    this.consultas.next(token?.texto ?? '');
    if (!token) this.cerrar();
  }

  tecla(e: KeyboardEvent): void {
    if (!this.abierto()) return;
    const total = this.sugerencias().length;

    switch (e.key) {
      case 'ArrowDown':
        this.activa.set((this.activa() + 1) % total);
        break;
      case 'ArrowUp':
        this.activa.set((this.activa() - 1 + total) % total);
        break;
      case 'Enter':
      case 'Tab':
        this.elegir(this.sugerencias()[this.activa()]);
        break;
      case 'Escape':
        this.cerrar();
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.actualizarLista();
  }

  elegir(usuario: UsuarioAvatarViewModel): void {
    const campo = this.el.nativeElement;
    const token = this.token();
    if (!token) return this.cerrar();

    const fin = campo.selectionStart;
    const insertado = `@${usuario.userName} `;
    campo.value = campo.value.slice(0, token.inicio) + insertado + campo.value.slice(fin);
    const cursor = token.inicio + insertado.length;
    campo.setSelectionRange(cursor, cursor);
    this.cerrar();
    // ngModel / formControl escuchan "input".
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  }

  cerrar(): void {
    this.abierto.set(false);
    this.overlayRef?.detach();
    this.lista = null;
  }

  private token(): { inicio: number; texto: string } | null {
    const campo = this.el.nativeElement;
    if (campo.selectionStart !== campo.selectionEnd) return null;
    const antes = campo.value.slice(0, campo.selectionStart);
    const m = TOKEN.exec(antes);
    return m ? { inicio: antes.length - m[2].length - 1, texto: m[2] } : null;
  }

  private abrir(): void {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.el)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
          ])
          .withPush(true)
          .withViewportMargin(8),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
    }
    if (!this.lista) {
      this.lista = this.overlayRef.attach(new ComponentPortal(MencionesListaComponent));
      this.lista.setInput('idLista', this.idLista);
      this.lista.instance.elegido.subscribe((u) => this.elegir(u));
    }
    this.abierto.set(true);
    this.actualizarLista();
  }

  private actualizarLista(): void {
    if (!this.lista) return;
    this.lista.setInput('sugerencias', this.sugerencias());
    this.lista.setInput('activa', this.activa());
  }
}
