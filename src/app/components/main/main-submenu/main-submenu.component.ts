import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'main-submenu',
  templateUrl: './main-submenu.component.html',
  styleUrls: ['./main-submenu.component.scss'],
})
export class MainSubmenuComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public currentUser: any;
  public display!: DisplayComponentModel;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService
  ) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.displayService
      .getDisplay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });
  }
}
