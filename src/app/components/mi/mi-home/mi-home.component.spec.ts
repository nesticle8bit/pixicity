import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiHomeComponent } from './mi-home.component';

describe('MiHomeComponent', () => {
  let component: MiHomeComponent;
  let fixture: ComponentFixture<MiHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
