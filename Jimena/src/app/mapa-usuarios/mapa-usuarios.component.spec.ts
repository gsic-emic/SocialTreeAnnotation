import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaUsuariosComponent } from './mapa-usuarios.component';

describe('MapaUsuariosComponent', () => {
  let component: MapaUsuariosComponent;
  let fixture: ComponentFixture<MapaUsuariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapaUsuariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
