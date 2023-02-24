import { Component, OnInit } from '@angular/core';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';

@Component({
  selector: 'app-main-ultimas-noticias',
  templateUrl: './main-ultimas-noticias.component.html',
  styleUrls: ['./main-ultimas-noticias.component.scss'],
})
export class MainUltimasNoticiasComponent implements OnInit {
  public noticias: any[] = [];

  constructor(private noticiasService: IHttpNoticiasService) {}

  ngOnInit(): void {
    this.getNoticias();
  }

  getNoticias(): void {
    this.noticiasService.getAllNoticias().subscribe((response: any) => {
      this.noticias = response;
    });
  }
}
