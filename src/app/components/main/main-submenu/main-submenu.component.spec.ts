import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSubmenuComponent } from './main-submenu.component';

describe('MainSubmenuComponent', () => {
  let component: MainSubmenuComponent;
  let fixture: ComponentFixture<MainSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainSubmenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
