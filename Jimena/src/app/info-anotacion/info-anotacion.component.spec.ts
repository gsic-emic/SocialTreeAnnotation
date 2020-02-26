import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAnotacionComponent } from './info-anotacion.component';

describe('InfoAnotacionComponent', () => {
  let component: InfoAnotacionComponent;
  let fixture: ComponentFixture<InfoAnotacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoAnotacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoAnotacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
