import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunidadComponent } from './comunidad.component';

describe('ComunidadComponent', () => {
  let component: ComunidadComponent;
  let fixture: ComponentFixture<ComunidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComunidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
