import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubimageComponent } from './subimage.component';

describe('SubimageComponent', () => {
  let component: SubimageComponent;
  let fixture: ComponentFixture<SubimageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubimageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
