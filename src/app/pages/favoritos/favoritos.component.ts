import { Component, OnInit } from '@angular/core';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
  public favoritos: any[] = [];

  constructor(
    private httpGeneral: IHttpGeneralService
  ) { }

  ngOnInit(): void {
    this.httpGeneral.getFavoritosByUser().subscribe((response: any) => {
      this.favoritos = response.favoritos;
      console.log(this.favoritos);
    });
  }

}
