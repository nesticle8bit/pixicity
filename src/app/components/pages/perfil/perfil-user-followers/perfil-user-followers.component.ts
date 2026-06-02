import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-perfil-user-followers',
  templateUrl: './perfil-user-followers.component.html',
  styleUrls: ['./perfil-user-followers.component.scss'],
})
export class PerfilUserFollowersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private _usuarioId: any;
  public followers: any[] = [];
  public totalCount: number = 0;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
      this.getSeguidores();
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {}

  getSeguidores(): void {
    if (!this._usuarioId) {
      return;
    }

    this.securityService
      .getLastFollowersByUserId(this._usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.followers = response.followers;
        this.totalCount = response.totalCount;
      });
  }
}
