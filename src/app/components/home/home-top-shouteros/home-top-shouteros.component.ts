import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { TopShoutero } from 'src/app/models/mi/mi-vm.model';
import { TopTimesSelectorComponent } from '../../sections/top-times-selector/top-times-selector.component';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';

/** Top 5 de usuarios por shouts publicados; arranca en el mes y cambia con el selector de tops. */
@Component({
    selector: 'app-home-top-shouteros',
    templateUrl: './home-top-shouteros.component.html',
    imports: [TopTimesSelectorComponent, RouterLink, MatTooltip, UserPopoverDirective, CountryFlagComponent],
})
export class HomeTopShouterosComponent implements OnInit {
  private miService = inject(IHttpMiService);
  private readonly destroyRef = inject(DestroyRef);

  public periodo = 'mes';
  public loading = false;
  public top: TopShoutero[] = [];

  ngOnInit(): void {
    this.cargar();
  }

  dateChanges(periodo: string): void {
    if (!periodo) return;
    this.periodo = periodo;
    this.cargar();
  }

  private cargar(): void {
    this.loading = true;
    this.miService.getTopShouteros(this.periodo, 5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (top) => { this.top = top; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
