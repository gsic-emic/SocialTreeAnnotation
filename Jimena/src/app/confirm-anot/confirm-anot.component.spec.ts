import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAnotComponent } from './confirm-anot.component';

describe('ConfirmAnotComponent', () => {
  let component: ConfirmAnotComponent;
  let fixture: ComponentFixture<ConfirmAnotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmAnotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAnotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
