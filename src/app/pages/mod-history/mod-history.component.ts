import { Component, OnInit } from '@angular/core';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  selector: 'app-mod-history',
  templateUrl: './mod-history.component.html',
  styleUrls: ['./mod-history.component.scss'],
})
export class ModHistoryComponent implements OnInit {
  public posts: any[] = [];
  
  constructor(private webService: IHttpWebService) {}

  ngOnInit(): void {}

  getHistorialModeracion(): void {
    this.webService.getHistorialModeracion().subscribe((response: any) => {
      this.posts = response;
    });
  }
}
