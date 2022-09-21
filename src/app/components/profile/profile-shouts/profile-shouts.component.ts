import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from 'ngx-editor';

@Component({
  selector: 'app-profile-shouts',
  templateUrl: './profile-shouts.component.html',
  styleUrls: ['./profile-shouts.component.scss'],
})
export class ProfileShoutsComponent implements OnInit {
  @Output() getShouts = new EventEmitter<boolean>();

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

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: IHttpPerfilService
  ) {
    this.formGroup = this.formBuilder.group({
      comentario: ['', Validators.required],
      perfilId: [0, Validators.required],
      tipo: 1,
    });
  }

  ngOnInit(): void {}

  createShout(): void {
    const shout = Object.assign({}, this.formGroup.value);

    this.perfilService.createShout(shout).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          comentario: '',
        });

        this.getShouts.emit(true);
      }
    });
  }
}
