import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoisTableComponent } from './rois-table.component';

describe('RoisTableComponent', () => {
  let component: RoisTableComponent;
  let fixture: ComponentFixture<RoisTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoisTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
