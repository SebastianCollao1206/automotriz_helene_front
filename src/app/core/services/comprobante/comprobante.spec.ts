import { TestBed } from '@angular/core/testing';

import { Comprobante } from './comprobante';

describe('Comprobante', () => {
  let service: Comprobante;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Comprobante);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
