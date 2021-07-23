import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-last-comments',
  templateUrl: './home-last-comments.component.html',
  styleUrls: ['./home-last-comments.component.scss']
})
export class HomeLastCommentsComponent implements OnInit {
  public lastComments: any = [];

  constructor() { }

  ngOnInit(): void {
    for (let index = 0; index < 10; index++) {
      this.lastComments.push({
        user: `nesticle${index}bit`,
        comment: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. #${index}`
      });
    }
  }

}
