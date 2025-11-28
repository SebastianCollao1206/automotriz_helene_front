import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePrediccion } from './detalle-prediccion';

describe('DetallePrediccion', () => {
  let component: DetallePrediccion;
  let fixture: ComponentFixture<DetallePrediccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePrediccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePrediccion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
