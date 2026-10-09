import { Component, DestroyRef, inject, Input, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'ads-by-type',
    templateUrl: './ads-by-type.component.html',
    styleUrls: ['./ads-by-type.component.scss'],
    imports: [MatTooltip]
})
export class AdsByTypeComponent implements OnInit {
  private webService = inject(IHttpWebService);

  private readonly destroyRef = inject(DestroyRef);

  readonly type = input<string>('');
  @Input() class: string = '';
  readonly hideTitle = input<boolean>(false);

  public ads: string = '';

  ngOnInit(): void {
    const type = this.type();
    if(!type) {
      return;
    }

    this.webService.getAdsByType(type).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: string) => {
      this.ads = value;
    });
  }

}
