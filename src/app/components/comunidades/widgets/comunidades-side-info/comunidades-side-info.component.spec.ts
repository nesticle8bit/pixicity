import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunidadesSideInfoComponent } from './comunidades-side-info.component';

describe('ComunidadesSideInfoComponent', () => {
  let component: ComunidadesSideInfoComponent;
  let fixture: ComponentFixture<ComunidadesSideInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComunidadesSideInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComunidadesSideInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
