import { Component, OnInit } from '@angular/core';
import { TablePostsComponent } from '../table-posts/table-posts.component';

@Component({
    selector: 'app-dashboard-posts',
    templateUrl: './dashboard-posts.component.html',
    styleUrls: ['./dashboard-posts.component.scss'],
    imports: [TablePostsComponent]
})
export class DashboardPostsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
