import { TestBed } from '@angular/core/testing';

import { Prediccion } from './prediccion';

describe('Prediccion', () => {
  let service: Prediccion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Prediccion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
