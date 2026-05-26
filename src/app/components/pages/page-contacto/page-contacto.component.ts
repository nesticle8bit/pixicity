import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-page-contacto',
  templateUrl: './page-contacto.component.html',
  styleUrls: ['./page-contacto.component.scss'],
})
export class PageContactoComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private displayService: DisplayComponentService,
    private generalService: IHttpGeneralService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      medio: '',
      comentarios: ['', Validators.required],
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {}

  contacto(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const form = Object.assign({}, this.formGroup.value);

    this.generalService.saveContacto(form).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('Se ha enviado correctamente los datos de contacto, pronto nos pondremos en contacto contigo, muchas gracias! 💖', 'Enviado');
        this.router.navigate(['']);
      }
    });
  }
}
