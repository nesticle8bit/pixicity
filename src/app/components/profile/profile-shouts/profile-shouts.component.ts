import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Validators } from 'ngx-editor';

@Component({
  selector: 'app-profile-shouts',
  templateUrl: './profile-shouts.component.html',
  styleUrls: ['./profile-shouts.component.scss'],
})
export class ProfileShoutsComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      mensaje: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  createShout(): void {
    const shout = Object.assign({}, this.formGroup.value);
  }
}
