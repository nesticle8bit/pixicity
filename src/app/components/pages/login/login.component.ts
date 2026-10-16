import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NgClass, DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        MatButton,
        RouterLink,
        DatePipe,
    ],
})
export class LoginComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly destroyRef = inject(DestroyRef);

  readonly hide = input<any>();
  /** Ruta interna a la que volver tras iniciar sesión (p. ej. el post privado que se quería ver). */
  readonly volverA = input<string | null>();

  public loginForm: FormGroup;
  public error: string = '';
  /** Con valor: la contraseña fue correcta y falta el código de verificación en dos pasos. */
  public desafio2FA = '';
  public codigo2FA = '';
  public verificando2FA = false;
  public baneo: any = {
    title: 'La cuenta se encuentra deshabilitada',
    causa: '',
    hasta: new Date(),
  };

  constructor() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
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
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const login = Object.assign({}, this.loginForm.value);
    login.captcha = '';
    this.error = '';

    this.securityService.loginUser(login).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value === 'error') {
        this.error = 'Las credenciales son incorrectas, por favor corrige y vuelve a iniciar sesión';
        return;
      }

      if ('error' in value && value.error === 'baneado') {
        this.error = 'baneado';
        this.baneo = {
          title: 'La cuenta se encuentra deshabilitada',
          causa: value.razonBaneo,
          hasta: value.tiempoBaneado ?? null,
        };
        return;
      }

      if ('error' in value && value.error === 'baneado_permanente') {
        this.error = 'baneado';
        this.baneo = {
          title: 'La cuenta se encuentra deshabilitada permanentemente',
          causa: value.razonBaneo,
          hasta: null,
        };
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
    });
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
          this.error = e instanceof Error ? e.message : 'El código no es correcto';
          // Venció o hubo demasiados intentos: hay que volver a poner la contraseña.
          if (/vuelve a iniciar sesión/i.test(this.error)) this.desafio2FA = '';
        },
      });
  }

  cancelar2FA(): void {
    this.desafio2FA = '';
    this.error = '';
  }

  private entrar(sesion: JwtUserModel): void {
    this.securityService.setUserToLocalStorage(sesion);
    // returnUrl lo ponen AuthGuard y SesionRequeridaService al mandar acá desde una página que exige sesión.
    const volverA = this.volverA() ?? this.route.snapshot.queryParamMap.get('returnUrl');
    window.location.href = esRutaInterna(volverA) ? volverA! : '';
  }
}

// Solo rutas del propio sitio: "//otro.com" o "https://..." permitirían usar el login para redirigir a un sitio ajeno.
function esRutaInterna(ruta: string | null | undefined): boolean {
  return !!ruta && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.startsWith('/\\');
}
