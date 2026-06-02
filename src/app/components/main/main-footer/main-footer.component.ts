import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewportScroller } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  standalone: false,
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public display!: DisplayComponentModel;
  public formGroup: FormGroup;
  public paginas: any[] = [];
  public configuracion: any = {
    footer: '',
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });

    this.getPaginas();
    this.getFooter();
  }

  getPaginas(): void {
    this.webService.getAllPaginas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.paginas = response;
    });
  }

  getFooter(): void {
    this.webService.getConfiguracionFooter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
