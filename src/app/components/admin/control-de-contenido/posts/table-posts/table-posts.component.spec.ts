import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePostsComponent } from './table-posts.component';

describe('TablePostsComponent', () => {
  let component: TablePostsComponent;
  let fixture: ComponentFixture<TablePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TablePostsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
