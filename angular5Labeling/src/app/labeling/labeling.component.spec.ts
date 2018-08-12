import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelingComponent } from './labeling.component';

describe('LabelingComponent', () => {
  let component: LabelingComponent;
  let fixture: ComponentFixture<LabelingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
