import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-last-posts',
  templateUrl: './home-last-posts.component.html',
  styleUrls: ['./home-last-posts.component.scss']
})
export class HomeLastPostsComponent implements OnInit {
  public lastPosts: any = [];

  constructor() { }

  ngOnInit(): void {
    for (let index = 0; index < 28; index++) {
      this.lastPosts.push({
        title: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
      });
    }
  }
}
