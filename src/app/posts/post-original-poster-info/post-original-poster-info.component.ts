import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-original-poster-info',
  templateUrl: './post-original-poster-info.component.html',
  styleUrls: ['./post-original-poster-info.component.scss'],
})
export class PostOriginalPosterInfoComponent implements OnInit {
  private _post: any;

  @Input() set post(value: any) {
    this._post = value;

    if(value) {
      console.log(value);
    }
  }

  get post(): any {
    return this._post;
  }

  constructor() {}

  ngOnInit(): void {

  }
}
