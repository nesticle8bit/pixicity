import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-fotos-index',
  templateUrl: './fotos-index.component.html',
  styleUrls: ['./fotos-index.component.scss'],
})
export class FotosIndexComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public fotos: any[] = [];
  public pagination: any = {};
  public currentUser: any;
  public loading: boolean = false;
  public userName: string = '';

  private page: number = 1;
  private pageCount: number = 12;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private fotosService: IHttpFotosService,
    private route: ActivatedRoute
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.userName = params['userName'] || '';
      this.page = 1;
      this.loadFotos();
    });
  }

  loadFotos(): void {
    this.loading = true;
    const search = { page: this.page, pageCount: this.pageCount };

    const obs = this.userName
      ? this.fotosService.getFotosByUsuario(this.userName, search)
      : this.fotosService.getFotos(search);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        this.fotos = response?.data || [];
        this.pagination = response?.pagination || {};
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  goToPage(page: number): void {
    this.page = page;
    this.loadFotos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number[] {
    const total = this.pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}
