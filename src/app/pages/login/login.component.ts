import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const login = Object.assign({}, this.loginForm.value);

    this.error = '';

    this.securityService.loginUser(login).subscribe((value: any) => {
      if (value === 'error') {
        this.error = 'Las credenciales son incorrectas, por favor corrige y vuelve a iniciar sesión';
        return;
      }

      this.securityService.setUserToLocalStorage(value);
      this.router.navigate(['']);
    });
  }
}
