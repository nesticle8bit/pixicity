import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SEOService } from 'src/app/services/shared/seo.service';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PostSimpleViewModel } from 'src/app/models/posts/post-vm.model';
import { PostRankListComponent } from '../post-rank-list/post-rank-list.component';

@Component({
    selector: 'app-post-not-found',
    templateUrl: './post-not-found.component.html',
    styleUrls: ['./post-not-found.component.scss'],
    imports: [PostRankListComponent],
})
export class PostNotFoundComponent implements OnInit {
  private seoService = inject(SEOService);
  private postService = inject(IHttpPostsService);
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public relacionados: PostSimpleViewModel[] = [];

  ngOnInit(): void {
    // noindex + status 404 real en el prerender: sin esto Google lo lee como
    // soft 404 y desconfia del resto del sitio.
    this.seoService.setSEO({
      title: 'Post no encontrado',
      description: 'El post que buscas no existe o fue eliminado.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
      statusCode: 404,
    });

    // El slug del post buscado (posts/404/:nombre-post) da las palabras; sin slug (ruta **)
    // el API devuelve los más votados.
    const slug = this.route.snapshot.paramMap.get('nombre-post') ?? '';
    this.postService.getPostsRelatedByTitle(slug.replace(/-/g, ' '), true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((posts) => this.relacionados = posts);
  }
}
