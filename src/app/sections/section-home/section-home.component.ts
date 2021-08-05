import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeLastPostsComponent } from 'src/app/home/home-last-posts/home-last-posts.component';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';

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

  // @ViewChild(HomeLastPostsComponent) child!:HomeLastPostsComponent;
  
  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // this.activatedRoute.paramMap.subscribe((params: any) => {
    // });
  }

}
