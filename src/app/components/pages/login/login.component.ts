import { AuthLateralComponent } from '../auth-lateral/auth-lateral.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TurnstileComponent } from '../../addons/turnstile/turnstile.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NgClass, DatePipe } from '@angular/common';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLateralComponent,
    DatePipe,
    TurnstileComponent,
  ],
})
export class LoginComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private moderacionService = inject(IHttpModeracionService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly destroyRef = inject(DestroyRef);

  readonly hide = input<any>();
  /** Ruta interna a la que volver tras iniciar sesión (p. ej. el post privado que se quería ver). */
  readonly volverA = input<string | null>();

  public loginForm: FormGroup;
  /** Clave pública de Turnstile; null = el API no pide captcha. */
  readonly captchaSiteKey = signal<string | null>(null);
  private readonly captcha = viewChild<TurnstileComponent>('captcha');
  public error: string = '';
  /** Con valor: la contraseña fue correcta y falta el código de verificación en dos pasos. */
  public desafio2FA = '';
  public codigo2FA = '';
  public verificando2FA = false;
  /** Baneado: token para apelar sin sesión, el texto y si ya se envió. */
  public tokenApelacion = '';
  public mensajeApelacion = '';
  public enviandoApelacion = false;
  public apelacionEnviada = false;
  public baneo: any = {
    title: 'La cuenta se encuentra deshabilitada',
    causa: '',
    hasta: new Date(),
  };

  constructor() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      // Obligatorio solo si el API tiene captcha configurado (ver getCaptchaSiteKey).
      captcha: [''],
    });
  }

  ngOnInit(): void {
    this.displayService.setDisplay({
      mainMenu: false,
      footer: true,
      searchFooter: false,
      submenu: false,
      background: '',
    });

    this.securityService
      .getCaptchaSiteKey()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((clave) => {
        this.captchaSiteKey.set(clave);
        if (clave) {
          this.loginForm.controls['captcha'].setValidators(Validators.required);
          this.loginForm.controls['captcha'].updateValueAndValidity();
        }
      });
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { captcha, ...login } = this.loginForm.value as {
      userName: string;
      password: string;
      captcha: string;
    };
    this.error = '';

    this.securityService
      .loginUser(login, captcha)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          // Cada token de captcha sirve una sola vez: si no se entra, se pide otro.
          if (value === 'error' || 'error' in value) this.reiniciarCaptcha();

          if (value === 'error') {
            this.error =
              'Las credenciales son incorrectas, por favor corrige y vuelve a iniciar sesión';
            return;
          }

          if ('error' in value && value.error === 'baneado') {
            this.error = 'baneado';
            this.baneo = {
              title: 'La cuenta se encuentra deshabilitada',
              causa: value.razonBaneo,
              hasta: value.tiempoBaneado ?? null,
            };
            this.prepararApelacion(value.apelacion);
            return;
          }

          if ('error' in value && value.error === 'baneado_permanente') {
            this.error = 'baneado';
            this.baneo = {
              title: 'La cuenta se encuentra deshabilitada permanentemente',
              causa: value.razonBaneo,
              hasta: null,
            };
            this.prepararApelacion(value.apelacion);
            return;
          }

          if ('error' in value) {
            return;
          }

          if ('requiere2FA' in value) {
            this.desafio2FA = value.desafio;
            this.codigo2FA = '';
            setTimeout(() => document.getElementById('codigo-2fa')?.focus());
            return;
          }

          this.entrar(value);
        },
        error: () => this.reiniciarCaptcha(),
      });
  }

  captchaResponse(value: string): void {
    this.loginForm.patchValue({ captcha: value });
  }

  private reiniciarCaptcha(): void {
    this.loginForm.patchValue({ captcha: '' });
    this.captcha()?.reiniciar();
  }

  /** Segundo paso: el código de la app de autenticación (o uno de recuperación). */
  enviarCodigo2FA(): void {
    const codigo = this.codigo2FA.trim();
    if (!this.desafio2FA || !codigo || this.verificando2FA) return;
    this.verificando2FA = true;
    this.error = '';
    this.securityService
      .login2FA(this.desafio2FA, codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sesion) => this.entrar(sesion),
        error: (e: unknown) => {
          this.verificando2FA = false;
          this.error =
            e instanceof Error ? e.message : 'El código no es correcto';
          // Venció o hubo demasiados intentos: hay que volver a poner la contraseña.
          if (/vuelve a iniciar sesión/i.test(this.error)) this.desafio2FA = '';
        },
      });
  }

  private prepararApelacion(token: string | undefined): void {
    this.tokenApelacion = token ?? '';
    this.mensajeApelacion = '';
    this.apelacionEnviada = false;
  }

  /** Pide al equipo que revise el baneo (no hace falta sesión: vale el token del login). */
  apelarBaneo(): void {
    const mensaje = this.mensajeApelacion.trim();
    if (!this.tokenApelacion || mensaje.length < 20 || this.enviandoApelacion) return;
    this.enviandoApelacion = true;
    this.moderacionService
      .apelarBaneo(this.tokenApelacion, mensaje)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviandoApelacion = false;
          this.apelacionEnviada = true;
          this.tokenApelacion = '';
        },
        error: () => (this.enviandoApelacion = false),
      });
  }

  cancelar2FA(): void {
    this.desafio2FA = '';
    this.error = '';
  }

  private entrar(sesion: JwtUserModel): void {
    this.securityService.setUserToLocalStorage(sesion);
    // returnUrl lo ponen AuthGuard y SesionRequeridaService al mandar acá desde una página que exige sesión.
    const volverA =
      this.volverA() ?? this.route.snapshot.queryParamMap.get('returnUrl');
    window.location.href = esRutaInterna(volverA) ? volverA! : '';
  }
}

// Solo rutas del propio sitio: "//otro.com" o "https://..." permitirían usar el login para redirigir a un sitio ajeno.
function esRutaInterna(ruta: string | null | undefined): boolean {
  return (
    !!ruta &&
    ruta.startsWith('/') &&
    !ruta.startsWith('//') &&
    !ruta.startsWith('/\\')
  );
}
