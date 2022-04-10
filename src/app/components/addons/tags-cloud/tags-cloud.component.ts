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

      if (this.cloudTags?.length > 0) {
        let array = this.cloudTags.map((value: any) => { return value.count });
        let max = Math.max(...array);

        this.cloudTags = this.cloudTags.map((tags: any) => {
          let count = tags.count;
          let percent = (count / max) * 100;

          if (percent < 20)
          {
              tags.class = 5;
          }
          else if (percent < 40)
          {
            tags.class = 4;
          }
          else if (percent < 60)
          {
            tags.class = 3;
          }
          else if (percent < 80)
          {
            tags.class = 2;
          }
          else
          {
            tags.class = 1;
          }

          return tags;
        });
      }
    });
  }
}
