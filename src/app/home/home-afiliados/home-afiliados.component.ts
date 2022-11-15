import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAfiliarseComponent } from 'src/app/components/dialogs/dialog-afiliarse/dialog-afiliarse.component';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  selector: 'app-home-afiliados',
  templateUrl: './home-afiliados.component.html',
  styleUrls: ['./home-afiliados.component.scss'],
})
export class HomeAfiliadosComponent implements OnInit {
  public afiliados: any[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private webService: IHttpWebService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAfiliados();
  }

  afiliarse(): void {
    this.dialog.open(DialogAfiliarseComponent, {
      width: '500px',
      disableClose: true,
    });
  }

  getAfiliados(): void {
    this.webService.getAfiliados().subscribe((response: any) => {
      this.afiliados = response;
    });
  }

  hit(afiliado: any): void {
    this.webService.hitAfiliado(afiliado.codigo).subscribe((url: any) => {
      if (isPlatformBrowser(this.platformId)) {
        window.open(url, '_blank');
      }
    });
  }
}
