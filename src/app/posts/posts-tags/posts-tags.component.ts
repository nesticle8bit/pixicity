import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-posts-tags',
  templateUrl: './posts-tags.component.html',
  styleUrls: ['./posts-tags.component.scss']
})
export class PostsTagsComponent implements OnInit {
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;
  }

  get post(): any {
    return this._post;
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
