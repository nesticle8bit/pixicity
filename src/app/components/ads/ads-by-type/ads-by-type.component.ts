import { Component, Input, OnInit } from '@angular/core';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  selector: 'ads-by-type',
  templateUrl: './ads-by-type.component.html',
  styleUrls: ['./ads-by-type.component.scss']
})
export class AdsByTypeComponent implements OnInit {
  @Input() type: string = '';
  @Input() hideTitle: boolean = false;

  public ads: string = '';

  constructor(
    private webService: IHttpWebService
  ) { }

  ngOnInit(): void {
    if(!this.type) {
      return;
    }

    this.webService.getAdsByType(this.type).subscribe((value: string) => {
      this.ads = value;
    });
  }

}
