import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeLastPostsComponent } from 'src/app/home/home-last-posts/home-last-posts.component';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

@Component({
  selector: 'section-home',
  templateUrl: './section-home.component.html',
  styleUrls: ['./section-home.component.scss']
})
export class SectionHomeComponent implements OnInit {
  public categoria: string = '';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private postsService: IHttpPostsService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: any) => {
      this.categoria = params.get('categoria');
      console.log(this.categoria);
    });
  }

}
