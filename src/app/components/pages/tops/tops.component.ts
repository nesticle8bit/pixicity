import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { RouterLink } from '@angular/router';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { SelectLabelDirective, SelectOptionDirective } from '../../shared/select-autocomplete/select-template.directives';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-tops',
    templateUrl: './tops.component.html',
    styleUrls: ['./tops.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        SelectAutocompleteComponent,
        SelectLabelDirective,
        SelectOptionDirective,
        MatRadioGroup,
        MatRadioButton,
        AdsByTypeComponent,
        TruncatePipe,
    ],
})
export class TopsComponent implements OnInit {
  private httpParametrosService = inject(IHttpParametrosService);
  private displayService = inject(DisplayComponentService);
  private postService = inject(IHttpPostsService);
  private formBuilder = inject(FormBuilder);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public categorias: any[] = [];
  public topPosts: any;
  public date: string = 'all';

  constructor() {
    this.seoService.setSEO({
      title: 'Tops | Los mejores posts de Taringa',
      description:
        'Ranking de los posts más votados de Taringa: filtrá por categoría y por período para ver lo mejor de la comunidad.',
      type: 'website',
      imageURL: '',
      tags: ['tops', 'mejores posts', 'ranking', 'taringa'],
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });

    this.formGroup = this.formBuilder.group({
      date: 'all',
      categoria: undefined,
    });
  }

  ngOnInit(): void {
    this.getTopPosts();
    this.getCategorias();
  }

  getTopPosts(date: string = ''): void {
    const categoriaId = this.formGroup.value.categoria;
    this.date = date;

    this.postService
      .getTopPosts(date, categoriaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.topPosts = response;
      });
  }

  getCategorias(): void {
    this.httpParametrosService
      .getCategoriasDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.categorias = values;
      });
  }
}
