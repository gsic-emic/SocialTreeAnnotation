import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAnnotComponent } from './add-annot.component';

describe('AddAnnotComponent', () => {
  let component: AddAnnotComponent;
  let fixture: ComponentFixture<AddAnnotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAnnotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAnnotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
