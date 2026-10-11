import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MuroPost } from 'src/app/models/mi/mi-vm.model';
import { UserPopoverDirective } from 'src/app/shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';

/** Post nuevo de alguien que sigues, en el muro de /mi: mismo globo que app-shout-card. */
@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatTooltip, UserPopoverDirective, UserAvatarComponent, DatePipe],
})
export class PostCardComponent {
  readonly post = input.required<MuroPost>();
  /** Cuándo se publicó (la fecha de la entrada del muro). */
  readonly fecha = input.required<string>();

  readonly autor = computed(() => this.post().autor.userName);
  readonly enlace = computed(() => ['/posts', this.post().categoriaSeo, this.post().id, this.post().url]);
}
