import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent implements OnInit {
  public display!: DisplayComponentModel;
  public formGroup: FormGroup;
  public paginas: any[] = [];
  public configuracion: any = {
    footer: ''
  };

  constructor(
    private displayService: DisplayComponentService,
    private webService: IHttpWebService,
    private viewPort: ViewportScroller,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({
      search: '',
    });
  }

  ngOnInit(): void {
    this.displayService
      .getDisplay()
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });

    this.getPaginas();
    this.getFooter();
  }

  getPaginas(): void {
    this.webService.getAllPaginas().subscribe((response: any) => {
      this.paginas = response;
    });
  }

  getFooter(): void {
    this.webService.getConfiguracionFooter().subscribe((response: any) => {
      this.configuracion.footer = response;
    });
  }

  goToHeaven(): void {
    this.viewPort.scrollToPosition([0, 0]);
  }

  search(): void {
    const obj = Object.assign({}, this.formGroup.value);

    if (!obj?.search) {
      return;
    }

    this.router.navigate([`/buscar/posts/${obj.search}`]);
  }
}
