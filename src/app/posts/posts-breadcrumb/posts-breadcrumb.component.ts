import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-posts-breadcrumb',
  templateUrl: './posts-breadcrumb.component.html',
  styleUrls: ['./posts-breadcrumb.component.scss']
})
export class PostsBreadcrumbComponent implements OnInit {
  @Input() post: any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
