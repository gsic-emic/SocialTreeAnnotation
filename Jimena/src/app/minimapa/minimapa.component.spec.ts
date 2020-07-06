import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimapaComponent } from './minimapa.component';

describe('MinimapaComponent', () => {
  let component: MinimapaComponent;
  let fixture: ComponentFixture<MinimapaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
