import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DialogAfiliarseComponent } from 'src/app/components/dialogs/dialog-afiliarse/dialog-afiliarse.component';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-home-afiliados',
    templateUrl: './home-afiliados.component.html',
    styleUrls: ['./home-afiliados.component.scss'],
    imports: [MatTooltip, MatButton],
})
export class HomeAfiliadosComponent implements OnInit {
  private webService = inject(IHttpWebService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  public afiliados: any[] = [];

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
    this.webService.getAfiliados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.afiliados = response;
    });
  }

  hit(afiliado: any): void {
    this.webService.hitAfiliado(afiliado.codigo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((url) => {
      window.open(url, '_blank');
    });
  }
}
