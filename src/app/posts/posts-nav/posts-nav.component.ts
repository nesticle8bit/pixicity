import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts-nav',
  templateUrl: './posts-nav.component.html',
  styleUrls: ['./posts-nav.component.scss'],
})
export class PostsNavComponent implements OnInit {
  @Input() post: any;

  constructor(private postService: IHttpPostsService, private router: Router) {}

  ngOnInit(): void {}

  nextPost(postId: number): void {
    this.postService.nextPost(postId).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  prevPost(postId: number): void {
    this.postService.previousPost(postId).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }

  randomPost(postId: number): void {
    this.postService.randomPost(postId).subscribe((value: any) => {
      if (value) {
        this.router.navigate([
          '/posts/' + value.categoria.seo + '/' + value.id + '/' + value.url,
        ]);
      }
    });
  }
}
