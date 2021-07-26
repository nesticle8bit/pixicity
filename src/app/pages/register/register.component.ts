import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public formGroup: FormGroup;

  public days: any[] = [];
  public months: any[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  public years: any[] = [];
  public genres: any[] = [{
    value: 1,
    label: 'Masculino'
  },
  {
    value: 0,
    label: 'Femenino'
  }];

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.required],
      day: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required],
      genre: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      termsConditions: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    for (let index = 0; index < 31; index++) {
      this.days.push(index + 1);
    }

    for (let index = new Date().getFullYear(); index > 1920; index--) {
      this.years.push(index);
    }
  }

}
