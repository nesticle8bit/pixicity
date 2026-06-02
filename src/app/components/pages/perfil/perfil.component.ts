import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public display: DisplayComponentModel = { mainMenu: true, footer: true, searchFooter: true, submenu: false, background: ''};
  public currentUser: any = {};
  public loggedUser: any = {};
  public currentSelection = 'shouts';

  constructor(
    private activatedRoute: ActivatedRoute,
    private securityService: IHttpSecurityService,
    private displayService: DisplayComponentService,
  ) {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values: any) => {
      this.getUserByUserName(values.get('userName'));
    });

    this.loggedUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.display);
  }

  getUserByUserName(userName: string): void {
    this.securityService.getUserByUserName(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.currentUser = value;

      this.display.background = this.currentUser.profileBackground;
      this.displayService.setDisplay(this.display);
    });
  }

  selectedChanged(value: string): void {
    this.currentSelection = value;
  }
}
