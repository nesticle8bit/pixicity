import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { RouterLink } from '@angular/router';
import { CloudTagViewModel } from 'src/app/models/posts/post-vm.model';

@Component({
    selector: 'app-tags-cloud',
    templateUrl: './tags-cloud.component.html',
    styleUrls: ['./tags-cloud.component.scss'],
    imports: [RouterLink],
})
export class TagsCloudComponent implements OnInit {
  private postService = inject(IHttpPostsService);

  private readonly destroyRef = inject(DestroyRef);

  public cloudTags: (CloudTagViewModel & { class: number })[] = [];

  ngOnInit(): void {
    this.getCloudTags();
  }

  getCloudTags(): void {
    this.postService.getCloudTags().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const tags = value ?? [];
      const max = Math.max(1, ...tags.map((t) => t.count));

      // Tamaño 1 (más grande) a 5 según el uso relativo al tag más usado: <20% → 5, <40% → 4, ... ≥80% → 1.
      this.cloudTags = tags.map((t) => ({ ...t, class: 5 - Math.min(4, Math.floor(((t.count / max) * 100) / 20)) }));
    });
  }
}
