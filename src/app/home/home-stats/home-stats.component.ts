import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-stats',
  templateUrl: './home-stats.component.html',
  styleUrls: ['./home-stats.component.scss']
})
export class HomeStatsComponent implements OnInit {
  public estadisticas: any;
  
  constructor(
    private generalService: IHttpGeneralService
  ) { }

  ngOnInit(): void {
    this.generalService.getEstadisticas().subscribe((values: any) => {
      this.estadisticas = values;
    });
  }

}
