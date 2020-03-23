import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAnotComponent } from './registro-anot.component';

describe('RegistroAnotComponent', () => {
  let component: RegistroAnotComponent;
  let fixture: ComponentFixture<RegistroAnotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAnotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAnotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
