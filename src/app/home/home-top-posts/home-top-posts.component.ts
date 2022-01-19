import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { Component, OnInit } from '@angular/core';
import { TopPostModel } from 'src/app/models/web/topPost.model';

@Component({
  selector: 'app-home-top-posts',
  templateUrl: './home-top-posts.component.html',
  styleUrls: ['./home-top-posts.component.scss'],
})
export class HomeTopPostsComponent implements OnInit {
  public topPosts: TopPostModel[] = [];

  constructor(private httpWeb: IHttpWebService) {}

  ngOnInit(): void {
    this.getTopPosts();
  }

  getTopPosts(): void {
    this.httpWeb.getTopPosts().subscribe((value: TopPostModel[]) => {
      this.topPosts = value;
    });
  }
}
