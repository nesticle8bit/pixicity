import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTimesSelectorComponent } from './top-times-selector.component';

describe('TopTimesSelectorComponent', () => {
  let component: TopTimesSelectorComponent;
  let fixture: ComponentFixture<TopTimesSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopTimesSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopTimesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
