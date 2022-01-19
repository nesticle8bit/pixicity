import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent implements OnInit {
  public display!: DisplayComponentModel;

  constructor(
    private displayService: DisplayComponentService,
    private viewPort: ViewportScroller
  ) {}

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
}
