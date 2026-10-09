import { Component, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-posts-breadcrumb',
    templateUrl: './posts-breadcrumb.component.html',
    styleUrls: ['./posts-breadcrumb.component.scss'],
    imports: [RouterLink, TimeAgoPipe]
})
export class PostsBreadcrumbComponent implements OnInit {
  readonly post = input<any>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
