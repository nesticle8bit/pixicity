import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnVivoComponent } from './en-vivo.component';

describe('EnVivoComponent', () => {
  let component: EnVivoComponent;
  let fixture: ComponentFixture<EnVivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnVivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnVivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
