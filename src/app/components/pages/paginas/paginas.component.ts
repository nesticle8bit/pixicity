import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-paginas',
  templateUrl: './paginas.component.html',
  styleUrls: ['./paginas.component.scss'],
})
export class PaginasComponent implements OnInit {
  public slug: string = '';
  public pagina: any;

  constructor(
    private displayService: DisplayComponentService,
    private activatedRoute: ActivatedRoute,
    private webService: IHttpWebService
  ) {
    this.activatedRoute.paramMap.subscribe((params: any) => {
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
