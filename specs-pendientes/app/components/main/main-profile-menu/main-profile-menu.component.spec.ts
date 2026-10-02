import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainProfileMenuComponent } from './main-profile-menu.component';

describe('MainProfileMenuComponent', () => {
  let component: MainProfileMenuComponent;
  let fixture: ComponentFixture<MainProfileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MainProfileMenuComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainProfileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
