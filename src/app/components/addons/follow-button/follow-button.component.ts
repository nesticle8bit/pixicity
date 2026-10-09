import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  input,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-follow-button',
    templateUrl: './follow-button.component.html',
    styleUrls: ['./follow-button.component.scss'],
})
export class FollowButtonComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);

  readonly icon = input<boolean>(false);

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;

    if (value) {
      this.isFollowingTheUser(value);
    }
  }

  get userName(): any {
    return this._userName;
  }

  readonly followingChange = output<boolean>();

  public isFollowing: boolean = false;
  public currentUser?: JwtUserModel;
  constructor() {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  isFollowingTheUser(userName: string): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.usuarioPerfilService
      .isFollowingTheUser(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.isFollowing = value;
      });
  }

  followUser(status: boolean): void {
    let follow = {
      userName: this.userName,
    };

    this.usuarioPerfilService.seguirUsuario(follow).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.isFollowing = !this.isFollowing;
        this.followingChange.emit(this.isFollowing);
      }
    });
  }
}
