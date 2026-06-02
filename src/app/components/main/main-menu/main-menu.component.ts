import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public active: string = '';
  public currentUser: any;

  constructor(
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    this.currentUser = this.securityService.getCurrentUser();

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: any) => {
        if (val?.url) {
          this.active = val?.url;
        }
      });
  }

  ngOnInit(): void {}
}
