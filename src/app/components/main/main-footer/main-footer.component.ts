import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent implements OnInit {
  public display!: DisplayComponentModel;
  public formGroup: FormGroup;

  constructor(
    private displayService: DisplayComponentService,
    private viewPort: ViewportScroller,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({
      search: ''
    });
  }

  ngOnInit(): void {
    this.displayService
      .getDisplay()
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });
  }

  goToHeaven(): void {
    this.viewPort.scrollToPosition([0, 0]);
  }

  search(): void {
    const obj = Object.assign({}, this.formGroup.value);

    if (!obj?.search) {
      return;
    }

    this.router.navigate([`/buscar/posts/${obj.search}`]);
  }
}
