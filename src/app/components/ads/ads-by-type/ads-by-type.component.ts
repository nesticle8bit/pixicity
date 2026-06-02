import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  standalone: false,
  selector: 'ads-by-type',
  templateUrl: './ads-by-type.component.html',
  styleUrls: ['./ads-by-type.component.scss']
})
export class AdsByTypeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() type: string = '';
  @Input() class: string = '';
  @Input() hideTitle: boolean = false;

  public ads: string = '';

  constructor(
    private webService: IHttpWebService
  ) { }

  ngOnInit(): void {
    if(!this.type) {
      return;
    }

    this.webService.getAdsByType(this.type).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: string) => {
      this.ads = value;
    });
  }

}
