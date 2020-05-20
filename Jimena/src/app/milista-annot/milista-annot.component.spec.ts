import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilistaAnnotComponent } from './milista-annot.component';

describe('MilistaAnnotComponent', () => {
  let component: MilistaAnnotComponent;
  let fixture: ComponentFixture<MilistaAnnotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilistaAnnotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilistaAnnotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
