import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { PostsGeneratorComponent } from './posts-generator.component';

describe('PostsGeneratorComponent', () => {
  let component: PostsGeneratorComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<PostsGeneratorComponent>>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [PostsGeneratorComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
    component = TestBed.createComponent(PostsGeneratorComponent).componentInstance;
  });

  it('los videos son opcionales', () => {
    component.formGroup.patchValue({ informacion: 'hola' });
    component.generarPost();
    expect(dialogRef.close).toHaveBeenCalledWith(jasmine.stringMatching(/^(?!.*video-yt).*hola/s));
  });

  it('agrega una sección con los videos de YouTube', () => {
    component.formGroup.patchValue({ video1: 'https://youtu.be/dQw4w9WgXcQ', video2: 'https://www.youtube.com/shorts/aaaaaaaaaaa' });
    component.generarPost();
    const html: string = dialogRef.close.calls.mostRecent().args[0];
    expect(html).toContain('>Videos</span>');
    expect(html.match(/<figure class="video-yt"/g)?.length).toBe(2);
    expect(html).toContain('href="https://www.youtube.com/watch?v=aaaaaaaaaaa"');
  });

  it('no genera el post si un video no es de YouTube', () => {
    component.formGroup.patchValue({ video1: 'https://vimeo.com/1' });
    component.generarPost();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.videoInvalido()).toBeTrue();
  });
});
