import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-profile-shouts',
  templateUrl: './profile-shouts.component.html',
  styleUrls: ['./profile-shouts.component.scss'],
})
export class ProfileShoutsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public reloadShouts: boolean = false;
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value && value.id) {
      this.formGroup.patchValue({
        perfilId: value.id,
      });
    }
  }

  get user(): any {
    return this._user;
  }

  public formGroup: FormGroup;
  public currentUser: any;

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: IHttpPerfilService,
    private securityService: IHttpSecurityService
  ) {
    this.formGroup = this.formBuilder.group({
      comentario: ['', Validators.required],
      perfilId: [0, Validators.required],
      tipo: 1,
      url: [''],
    });

    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  // Clasificación en cliente para la vista previa del composer (el backend la recalcula al guardar).
  detectarTipo(url: string): string {
    if (!url) return 'Texto';
    const u = url.toLowerCase();
    if (!/^https?:\/\//.test(u)) return 'Texto';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'Video';
    if (u.includes('spotify.com')) return 'Spotify';
    if (/\.(jpg|jpeg|png|gif|webp|bmp|avif)(\?.*)?$/.test(u)) return 'Foto';
    return 'Enlace';
  }

  createShout(): void {
    this.reloadShouts = false;
    const shout = Object.assign({}, this.formGroup.value);

    if (!shout || !shout.comentario) {
      return;
    }

    this.perfilService.createShout(shout).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          comentario: '',
          url: '',
        });

        this.reloadShouts = true;
      }
    });
  }
}
