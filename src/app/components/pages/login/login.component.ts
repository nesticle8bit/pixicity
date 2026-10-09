import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NgClass, DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

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

  private readonly destroyRef = inject(DestroyRef);

  readonly hide = input<any>();
  /** Ruta interna a la que volver tras iniciar sesión (p. ej. el post privado que se quería ver). */
  readonly volverA = input<string | null>();

  public loginForm: FormGroup;
  public error: string = '';
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

      this.securityService.setUserToLocalStorage(value);
      const volverA = this.volverA();
      window.location.href = esRutaInterna(volverA) ? volverA! : '';
    });
  }
}

// Solo rutas del propio sitio: "//otro.com" o "https://..." permitirían usar el login para redirigir a un sitio ajeno.
function esRutaInterna(ruta: string | null | undefined): boolean {
  return !!ruta && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.startsWith('/\\');
}
