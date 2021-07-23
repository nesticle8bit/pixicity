import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-top-posts',
  templateUrl: './home-top-posts.component.html',
  styleUrls: ['./home-top-posts.component.scss']
})
export class HomeTopPostsComponent implements OnInit {
  public topPosts: any = [];

  constructor() { }

  ngOnInit(): void {
    for (let index = 0; index < 6; index++) {
      this.topPosts.push({
        title: `#${index + 1} Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
      });
    }
  }
}
