import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLastPhotosComponent } from './home-last-photos.component';

describe('HomeLastPhotosComponent', () => {
  let component: HomeLastPhotosComponent;
  let fixture: ComponentFixture<HomeLastPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeLastPhotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLastPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
