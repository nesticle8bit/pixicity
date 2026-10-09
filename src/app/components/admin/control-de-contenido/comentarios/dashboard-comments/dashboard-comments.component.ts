import { Component, OnInit } from '@angular/core';
import { TableCommentsComponent } from '../table-comments/table-comments.component';

@Component({
    selector: 'app-dashboard-comments',
    templateUrl: './dashboard-comments.component.html',
    styleUrls: ['./dashboard-comments.component.scss'],
    imports: [TableCommentsComponent]
})
export class DashboardCommentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
