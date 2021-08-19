import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-posts-tags',
  templateUrl: './posts-tags.component.html',
  styleUrls: ['./posts-tags.component.scss']
})
export class PostsTagsComponent implements OnInit {
  @Input() post: any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
