import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-dialog-afiliarse',
  templateUrl: './dialog-afiliarse.component.html',
  styleUrls: ['./dialog-afiliarse.component.scss'],
})
export class DialogAfiliarseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroupAfiliacion: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpGeneralService: IHttpGeneralService,
    public dialogRef: MatDialogRef<DialogAfiliarseComponent>
  ) {
    this.formGroupAfiliacion = this.formBuilder.group({
      titulo: ['', Validators.required],
      url: ['http://', Validators.required],
      banner: ['http://', Validators.required],
      descripcion: ['', Validators.required],
      captcha: ['', Validators.required],
      codigo: [],
    });
  }

  ngOnInit(): void {}

  enviarAfiliacion(): void {
    if (this.formGroupAfiliacion.invalid) {
      return;
    }

    const afiliacion = Object.assign({}, this.formGroupAfiliacion.value);
    afiliacion.captcha = '';

    this.httpGeneralService
      .saveAfiliacion(afiliacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.formGroupAfiliacion.patchValue({
            codigo: `<a href="https://taringas.net/?ref=${response}" target="_blank" title="Taringas!"><img src="https://taringas.net/assets/images/logo_ref.png"></a>`,
          });
        }
      });
  }

  captchaResponse(value: string): void {
    this.formGroupAfiliacion.patchValue({
      captcha: value,
    });
  }
}
