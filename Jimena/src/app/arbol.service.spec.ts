import { TestBed } from '@angular/core/testing';

import { ArbolService } from './arbol.service';

describe('ArbolService', () => {
  let service: ArbolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArbolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
