import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

type Paso = 'cargando' | 'inactivo' | 'configurando' | 'codigos' | 'activo';

/**
 * /cuenta → Verificación en dos pasos: generar la clave para la app (Google Authenticator, Authy…), confirmarla con un
 * código, mostrar los códigos de recuperación una vez, y desactivarla con contraseña + código.
 */
@Component({
  selector: 'app-account-dos-factores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './account-dos-factores.component.html',
  styleUrl: './account-dos-factores.component.scss',
})
export class AccountDosFactoresComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly paso = signal<Paso>('cargando');
  readonly secreto = signal('');
  readonly uri = signal('');
  readonly codigosRecuperacion = signal<string[]>([]);
  readonly error = signal('');
  readonly enviando = signal(false);

  codigo = '';
  password = '';

  constructor() {
    this.securityService
      .getEstado2FA()
      .pipe(takeUntilDestroyed())
      .subscribe((e) => this.paso.set(e.activo ? 'activo' : 'inactivo'));
  }

  /** La clave agrupada de a 4 para copiarla a mano sin perderse. */
  secretoAgrupado(): string {
    return this.secreto().replace(/(.{4})/g, '$1 ').trim();
  }

  empezar(): void {
    this.ejecutar(this.securityService.configurar2FA(), (r) => {
      this.secreto.set(r.secreto);
      this.uri.set(r.uri);
      this.codigo = '';
      this.paso.set('configurando');
    });
  }

  activar(): void {
    this.ejecutar(this.securityService.activar2FA(this.codigo.trim()), (r) => {
      this.codigosRecuperacion.set(r.codigosRecuperacion);
      this.paso.set('codigos');
      this.notificationService.success('La verificación en dos pasos quedó activa', 'Seguridad');
    });
  }

  terminar(): void {
    this.codigosRecuperacion.set([]);
    this.secreto.set('');
    this.paso.set('activo');
  }

  copiarCodigos(): void {
    void navigator.clipboard?.writeText(this.codigosRecuperacion().join('\n'));
    this.notificationService.success('Códigos copiados', 'Seguridad');
  }

  desactivar(): void {
    this.ejecutar(this.securityService.desactivar2FA(this.password, this.codigo.trim()), () => {
      this.password = '';
      this.codigo = '';
      this.paso.set('inactivo');
      this.notificationService.success('La verificación en dos pasos quedó desactivada', 'Seguridad');
    });
  }

  private ejecutar<T>(pedido: import('rxjs').Observable<T>, alTerminar: (r: T) => void): void {
    if (this.enviando()) return;
    this.enviando.set(true);
    this.error.set('');
    pedido.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r) => {
        this.enviando.set(false);
        alTerminar(r);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(e instanceof Error ? e.message : 'No se pudo completar');
      },
    });
  }
}
