import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenreIconComponent } from './genre-icon.component';

describe('GenreIconComponent', () => {
  let component: GenreIconComponent;
  let fixture: ComponentFixture<GenreIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenreIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenreIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
