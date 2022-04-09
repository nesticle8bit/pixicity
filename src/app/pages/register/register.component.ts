import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/security/user.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public configuracion: any;
  public formGroup: FormGroup;

  public dias: any[] = [];
  public meses: any[] = [
    {
      label: 'Enero',
      value: '01'
    },
    {
      label: 'Febrero',
      value: '02'
    },
    {
      label: 'Marzo',
      value: '03'
    },
    {
      label: 'Abril',
      value: '04'
    },
    {
      label: 'Mayo',
      value: '05'
    },
    {
      label: 'Junio',
      value: '06'
    },
    {
      label: 'Julio',
      value: '07'
    },
    {
      label: 'Agosto',
      value: '08'
    },
    {
      label: 'Septiembre',
      value: '09'
    },
    {
      label: 'Octubre',
      value: '10'
    },
    {
      label: 'Noviembre',
      value: '11'
    },
    {
      label: 'Diciembre',
      value: '12'
    }
  ];

  public years: any[] = [];
  public generos: any[] = [{
    value: 1,
    label: 'Masculino'
  },
  {
    value: 2,
    label: 'Femenino'
  },
  {
    value: 3,
    label: 'Otro'
  }];
  public paises: any[] = [];
  public estados: any[] = [];
  public currentFocus: string = '';

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private generalService: IHttpGeneralService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dia: [undefined, Validators.required],
      mes: [undefined, Validators.required],
      año: [undefined, Validators.required],
      genero: [undefined, Validators.required],
      paisId: [undefined, Validators.required],
      estadoId: [undefined, Validators.required],
      captcha: ['', Validators.required],
      termsConditions: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.displayService.setDisplay({
      mainMenu: false,
      footer: true,
      searchFooter: false,
      submenu: false,
      background: ''
    });

    for (let index = 0; index < 31; index++) {
      this.dias.push(index + 1);
    }

    for (let index = new Date().getFullYear() - 1; index > 1919; index--) {
      this.years.push(index);
    }

    this.getPaises();
    this.getConfiguracion();
  }

  getConfiguracion(): void {
    this.generalService.getConfiguracion().subscribe((value: any) => {
      this.configuracion = value;
    });
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().subscribe((values: any) => {
      this.paises = values;
    });
  }

  getEstadosByPais(pais: any): void {
    if (!pais) {
      return;
    }

    this.parametrosService.getEstadosByPais(pais.id).subscribe((values: any) => {
      this.estados = values;
    });
  }

  registerUser(): void {
    const user: UserModel = Object.assign({}, this.formGroup.value);
    console.log(user);

    user.fechaNacimiento = `${user.dia}/${user.mes}/${user.año}`;

    this.securityService.registerUser(user).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Guardado',
          text: 'Se ha creado un usuario correctamente',
          icon: 'success',
          timer: 3000
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  onFocus(target: any): void {
    this.currentFocus = target;
  }

  removePopover(): void {
    this.currentFocus = '';
  }
}
