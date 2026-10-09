import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** La confirmación debe coincidir con la contraseña nueva. */
export const passwordsIguales: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group?.get('newPassword')?.value;
  const confirmPass = group?.get('confirmPassword')?.value;

  if (!pass || !confirmPass) {
    return null;
  }

  return pass === confirmPass ? null : { notSame: true };
};

/** Cuenta > Cambiar contraseña. */
@Component({
  selector: 'app-account-password',
  templateUrl: './account-password.component.html',
  styleUrls: ['../account.component.scss'],
  imports: [ReactiveFormsModule, MatButton, MatIcon, MatError],
})
export class AccountPasswordComponent {
  private securityService = inject(IHttpSecurityService);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public formGroupCambiarContrasena = this.formBuilder.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: [''],
    },
    { validators: passwordsIguales }
  );

  changePassword(): void {
    const { currentPassword, newPassword } = this.formGroupCambiarContrasena.getRawValue();

    this.securityService
      .changePassword({ currentPassword: currentPassword ?? '', newPassword: newPassword ?? '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.formGroupCambiarContrasena.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
          this.notificationService.success('La contraseña ha sido actualizada correctamente', 'Actualizado');
        }
      });
  }
}
