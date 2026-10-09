import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewportScroller, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
    selector: 'main-footer',
    templateUrl: './main-footer.component.html',
    styleUrls: ['./main-footer.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        NgClass,
    ],
})
export class MainFooterComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private webService = inject(IHttpWebService);
  private viewPort = inject(ViewportScroller);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  public display!: DisplayComponentModel;
  public formGroup: FormGroup;
  public paginas: any[] = [];
  public configuracion: any = {
    footer: '',
  };

  constructor() {
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
    this.webService.getAllPaginas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.paginas = response;
    });
  }

  getFooter(): void {
    this.webService.getConfiguracionFooter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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

    this.router.navigate(['/buscar', 'posts', obj.search]);
  }
}
