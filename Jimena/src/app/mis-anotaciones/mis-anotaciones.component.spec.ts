import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAnotacionesComponent } from './mis-anotaciones.component';

describe('MisAnotacionesComponent', () => {
  let component: MisAnotacionesComponent;
  let fixture: ComponentFixture<MisAnotacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MisAnotacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MisAnotacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
