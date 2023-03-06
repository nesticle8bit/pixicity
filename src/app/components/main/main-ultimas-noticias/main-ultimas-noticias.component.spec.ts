import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainUltimasNoticiasComponent } from './main-ultimas-noticias.component';

describe('MainUltimasNoticiasComponent', () => {
  let component: MainUltimasNoticiasComponent;
  let fixture: ComponentFixture<MainUltimasNoticiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainUltimasNoticiasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainUltimasNoticiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
