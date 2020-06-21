import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaListaComponent } from './mapa-lista.component';

describe('MapaListaComponent', () => {
  let component: MapaListaComponent;
  let fixture: ComponentFixture<MapaListaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapaListaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
