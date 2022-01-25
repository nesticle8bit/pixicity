import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'section-home',
  templateUrl: './section-home.component.html',
  styleUrls: ['./section-home.component.scss']
})
export class SectionHomeComponent implements OnInit {
  public categoria: string = '';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private displayService: DisplayComponentService
  ) { }

  ngOnInit(): void {
    this.displayService.setDisplay(this.displayComponent);

    this.activatedRoute.paramMap.subscribe((params: any) => {
      this.categoria = params.get('categoria');
    });
  }

}
