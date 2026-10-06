import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';

/** Lista paginada de seguidores del usuario o de usuarios que sigue. */
@Component({
  standalone: false,
  selector: 'app-profile-follows',
  templateUrl: './profile-follows.component.html',
  styleUrls: ['./profile-follows.component.scss'],
})
export class ProfileFollowsComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input() tipo: 'seguidores' | 'siguiendo' = 'seguidores';
  @Input() user: any;

  public usuarios: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private securityService: IHttpSecurityService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.user && (changes['user'] || changes['tipo'])) {
      this.getUsuarios();
    }
  }

  getUsuarios(): void {
    const request = this.tipo === 'siguiendo'
      ? this.securityService.getFollowingUsersByUserId(this.user.id)
      : this.securityService.getFollowersByUserId(this.user.id);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.usuarios = response?.data ?? [];
      this.totalCount = response?.pagination?.totalCount ?? 0;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }
}
