import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPrivadoComponent } from './post-privado.component';

describe('PostPrivadoComponent', () => {
  let component: PostPrivadoComponent;
  let fixture: ComponentFixture<PostPrivadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostPrivadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPrivadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
