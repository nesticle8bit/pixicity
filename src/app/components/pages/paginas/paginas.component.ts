import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-paginas',
  templateUrl: './paginas.component.html',
  styleUrls: ['./paginas.component.scss'],
})
export class PaginasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public slug: string = '';
  public pagina: any;

  constructor(
    private displayService: DisplayComponentService,
    private activatedRoute: ActivatedRoute,
    private webService: IHttpWebService
  ) {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: any) => {
      this.slug = params.params.slug;
      this.getPaginaBySlug();
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {}

  getPaginaBySlug(): void {
    this.webService
      .getPaginaBySlug(`/paginas/${this.slug}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          response.fechaActualiza = response.fechaActualiza
            ? response.fechaActualiza
            : response.fechaRegistro;
          this.pagina = response;
          return;
        }
      });
  }
}
