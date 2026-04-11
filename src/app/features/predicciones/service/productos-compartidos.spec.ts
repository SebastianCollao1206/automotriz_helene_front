import { TestBed } from '@angular/core/testing';

import { ProductosCompartidos } from './productos-compartidos';

describe('ProductosCompartidos', () => {
  let service: ProductosCompartidos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosCompartidos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
