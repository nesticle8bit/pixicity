import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageContactoComponent } from './page-contacto.component';

describe('PageContactoComponent', () => {
  let component: PageContactoComponent;
  let fixture: ComponentFixture<PageContactoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageContactoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
