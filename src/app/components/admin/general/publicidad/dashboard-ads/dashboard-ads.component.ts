import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard-ads',
  templateUrl: './dashboard-ads.component.html',
  styleUrls: ['./dashboard-ads.component.scss']
})
export class DashboardAdsComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      scriptHeader: [''],
      scriptFooter: [''],
      banner300: [''],
      banner468: ['']
    });
  }

  ngOnInit(): void {
  }

}
