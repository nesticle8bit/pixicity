import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-follow-button',
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.scss'],
})
export class FollowButtonComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() icon: boolean = false;

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

  @Output() followingChange = new EventEmitter<boolean>();

  public isFollowing: boolean = false;
  public currentUser: any;
  constructor(private securityService: IHttpSecurityService) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  isFollowingTheUser(userName: string): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.securityService
      .isFollowingTheUser(userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        this.isFollowing = value;
      });
  }

  followUser(status: boolean): void {
    let follow = {
      userName: this.userName,
    };

    this.securityService.seguirUsuario(follow).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.isFollowing = !this.isFollowing;
        this.followingChange.emit(this.isFollowing);
      }
    });
  }
}
