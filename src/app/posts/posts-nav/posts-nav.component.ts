import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-posts-nav',
  templateUrl: './posts-nav.component.html',
  styleUrls: ['./posts-nav.component.scss']
})
export class PostsNavComponent implements OnInit {
  @Input() post: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  nextPost(postId: number): void {
    console.log(postId);
  }

  prevPost(postId: number): void {
    console.log(postId);
  }

  randomPost(): void {

  }
}
