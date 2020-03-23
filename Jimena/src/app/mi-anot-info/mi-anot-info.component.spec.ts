import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiAnotInfoComponent } from './mi-anot-info.component';

describe('MiAnotInfoComponent', () => {
  let component: MiAnotInfoComponent;
  let fixture: ComponentFixture<MiAnotInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiAnotInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiAnotInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
