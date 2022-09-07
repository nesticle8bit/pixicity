import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-follow-button',
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.scss'],
})
export class FollowButtonComponent implements OnInit {
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
    this.securityService
      .isFollowingTheUser(userName)
      .subscribe((value: any) => {
        this.isFollowing = value;
      });
  }

  followUser(status: boolean): void {
    let follow = {
      userName: this.userName,
    };

    this.securityService.seguirUsuario(follow).subscribe((response: any) => {
      if (response) {
        this.isFollowing = !this.isFollowing;
        this.followingChange.emit(this.isFollowing);
      }
    });
  }
}
