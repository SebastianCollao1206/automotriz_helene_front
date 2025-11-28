import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePrediccionTable } from './detalle-prediccion-table';

describe('DetallePrediccionTable', () => {
  let component: DetallePrediccionTable;
  let fixture: ComponentFixture<DetallePrediccionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePrediccionTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePrediccionTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
