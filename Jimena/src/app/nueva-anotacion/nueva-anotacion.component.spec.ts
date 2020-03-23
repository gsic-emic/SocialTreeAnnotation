import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaAnotacionComponent } from './nueva-anotacion.component';

describe('NuevaAnotacionComponent', () => {
  let component: NuevaAnotacionComponent;
  let fixture: ComponentFixture<NuevaAnotacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaAnotacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaAnotacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
