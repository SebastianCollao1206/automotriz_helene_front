import { TestBed } from '@angular/core/testing';

import { Paginacion } from './paginacion';

describe('Paginacion', () => {
  let service: Paginacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Paginacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
