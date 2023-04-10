import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginasComponent } from './paginas.component';

describe('PaginasComponent', () => {
  let component: PaginasComponent;
  let fixture: ComponentFixture<PaginasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaginasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
