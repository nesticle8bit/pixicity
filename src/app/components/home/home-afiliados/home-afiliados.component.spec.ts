import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAfiliadosComponent } from './home-afiliados.component';

describe('HomeAfiliadosComponent', () => {
  let component: HomeAfiliadosComponent;
  let fixture: ComponentFixture<HomeAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeAfiliadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
