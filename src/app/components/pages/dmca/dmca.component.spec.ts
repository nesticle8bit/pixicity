import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DMCAComponent } from './dmca.component';

describe('DMCAComponent', () => {
  let component: DMCAComponent;
  let fixture: ComponentFixture<DMCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DMCAComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DMCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
