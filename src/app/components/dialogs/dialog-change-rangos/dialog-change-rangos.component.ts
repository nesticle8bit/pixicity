import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-change-rangos',
  templateUrl: './dialog-change-rangos.component.html',
  styleUrls: ['./dialog-change-rangos.component.scss'],
})
export class DialogChangeRangosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public rangos: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogChangeRangosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private securityService: IHttpSecurityService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      id: 0,
      usuarioId: 0,
      icono: '',
      color: '',
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        usuarioId: this.data.usuarioId,
        icono: this.data.icono,
        color: this.data.color,
      });
    }

    this.securityService.getRangosDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.rangos = response;
    });
  }

  changeRango(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const obj = Object.assign({}, this.formGroup.value);

    this.securityService.changeRango(obj).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('El rango del usuario ha sido actualizado correctamente', 'Actualizado');

        this.dialogRef.close(obj.rango);
      }
    });
  }
}
