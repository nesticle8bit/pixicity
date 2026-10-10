import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostDetalle } from 'src/app/models/posts/post-vm.model';

@Component({
    selector: 'app-posts-tags',
    templateUrl: './posts-tags.component.html',
    styleUrls: ['./posts-tags.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsTagsComponent {
  readonly post = input<PostDetalle | null>(null);
}
