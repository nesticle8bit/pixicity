import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
    selector: 'app-page-contacto',
    templateUrl: './page-contacto.component.html',
    styleUrls: ['./page-contacto.component.scss'],
    imports: [FormsModule, ReactiveFormsModule],
})
export class PageContactoComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private generalService = inject(IHttpGeneralService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
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

    this.generalService.saveContacto(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('Se ha enviado correctamente los datos de contacto, pronto nos pondremos en contacto contigo, muchas gracias! 💖', 'Enviado');
        this.router.navigate(['']);
      }
    });
  }
}
