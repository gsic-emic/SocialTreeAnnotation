import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCompletaComponent } from './lista-completa.component';

describe('ListaCompletaComponent', () => {
  let component: ListaCompletaComponent;
  let fixture: ComponentFixture<ListaCompletaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaCompletaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCompletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
