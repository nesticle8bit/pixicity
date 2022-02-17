import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-tops',
  templateUrl: './tops.component.html',
  styleUrls: ['./tops.component.scss'],
})
export class TopsComponent implements OnInit {
  public formGroup: FormGroup;
  public categorias: any[] = [];
  public topPosts: any;

  constructor(
    private httpParametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
    });

    this.formGroup = this.formBuilder.group({
      date: 'all',
      categoria: '',
    });
  }

  ngOnInit(): void {
    this.getTopPosts();
    this.getCategorias();
  }

  getTopPosts(date: string = ''): void {
    this.postService
      .getTopPosts(date)
      .subscribe((response: any) => {
        this.topPosts = response;
      });
  }

  getCategorias(): void {
    this.httpParametrosService
      .getCategoriasDropdown()
      .subscribe((values: any) => {
        this.categorias = values;
      });
  }
}
