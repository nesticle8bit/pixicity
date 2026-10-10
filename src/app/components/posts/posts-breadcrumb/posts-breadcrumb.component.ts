import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-posts-breadcrumb',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './posts-breadcrumb.component.html',
    styleUrls: ['./posts-breadcrumb.component.scss'],
    imports: [RouterLink, TimeAgoPipe]
})
export class PostsBreadcrumbComponent implements OnInit {
  readonly post = input<any>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
