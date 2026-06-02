import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  standalone: false,
  selector: 'app-home-last-comments',
  templateUrl: './home-last-comments.component.html',
  styleUrls: ['./home-last-comments.component.scss'],
})
export class HomeLastCommentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public refreshComments: boolean = false;
  public lastComments: any = [];

  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {
    this.getUltimosComentarios();
  }

  getUltimosComentarios(): void {
    this.refreshComments = true;

    this.postService
      .getUltimosComentarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((comentarios: any) => {
        this.lastComments = comentarios;
        this.refreshComments = false;
      });
  }
}
