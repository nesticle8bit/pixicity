import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Input() hide: any;
  public loginForm: FormGroup;
  public error: string = '';
  public baneo: any = {
    title: 'La cuenta se encuentra deshabilitada',
    causa: '',
    hasta: new Date(),
  };

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required],
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

    this.securityService.loginUser(login).subscribe((value: any) => {
      this.loginForm.patchValue({
        captcha: '',
      });

      if (value === 'error') {
        this.error =
          'Las credenciales son incorrectas, por favor corrige y vuelve a iniciar sesión';
        return;
      }

      if (value?.error === 'baneado') {
        this.error = 'baneado';
        this.baneo = {
          title: 'La cuenta se encuentra deshabilitada',
          causa: value.razonBaneo,
          hasta: value.tiempoBaneado,
        };

        return;
      }

      if (value?.error === 'baneado_permanente') {
        this.error = 'baneado';

        this.baneo = {
          title: 'La cuenta se encuentra deshabilitada permanentemente',
          causa: value.razonBaneo,
          hasta: null,
        };

        return;
      }

      this.securityService.setUserToLocalStorage(value);
      window.location.href = '';
    });
  }

  captchaResponse(value: string): void {
    this.loginForm.patchValue({
      captcha: value,
    });
  }
}
