import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-update-paises',
  templateUrl: './dialog-update-paises.component.html',
  styleUrls: ['./dialog-update-paises.component.scss'],
})
export class DialogUpdatePaisesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogUpdatePaisesComponent>,
    private formBuilder: FormBuilder,
    private httpParametros: IHttpParametrosService,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      id: [undefined],
      nombre: ['', Validators.required],
      iso2: ['', [Validators.required, Validators.maxLength(2)]],
      iso3: ['', [Validators.required, Validators.maxLength(3)]],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        nombre: this.data.nombre,
        iso2: this.data.isO2,
        iso3: this.data.isO3,
      });
    }
  }

  savePais(): void {
    if(this.formGroup.invalid) {
      return;
    }

    const pais = Object.assign({}, this.formGroup.value);
    pais.iso2 = pais.iso2?.toUpperCase();
    pais.iso3 = pais.iso3?.toUpperCase();

    if(pais.id) {
      this.httpParametros.updatePais(pais).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El pais se ha actualizado correctamente', 'Actualizar');
          this.dialogRef.close(pais);
        }
      });
    } else {
      this.httpParametros.savePais(pais).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('El pais se ha guardado correctamente', 'Guardar');
          this.dialogRef.close(pais);
        }
      });
    }
  }
}
