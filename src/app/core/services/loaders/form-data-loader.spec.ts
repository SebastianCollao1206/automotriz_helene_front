import { TestBed } from '@angular/core/testing';

import { FormDataLoader } from './form-data-loader';

describe('FormDataLoader', () => {
  let service: FormDataLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormDataLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
