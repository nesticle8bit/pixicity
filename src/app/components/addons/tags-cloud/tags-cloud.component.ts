import { Component, OnInit } from '@angular/core';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  selector: 'app-tags-cloud',
  templateUrl: './tags-cloud.component.html',
  styleUrls: ['./tags-cloud.component.scss'],
})
export class TagsCloudComponent implements OnInit {
  public cloudTags: any;

  constructor(private postService: IHttpPostsService) {}

  ngOnInit(): void {
    this.getCloudTags();
  }

  getCloudTags(): void {
    this.postService.getCloudTags().subscribe((value: any) => {
      this.cloudTags = value;

      if(this.cloudTags?.length > 0) {
        let max = 0;
        let min = 0;

        this.cloudTags = this.cloudTags.map((tags: any) => {
          if(tags.count > max) {
            max = tags.count;
            tags.class = 1;
          } else {
            tags.class = Math.floor(Math.random() * (5 - 1 + 1) + 1); // TODO
          }

          return tags;
        });
      }
    });
  }
}
