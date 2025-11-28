import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoPediccionProducto } from './grafico-pediccion-producto';

describe('GraficoPediccionProducto', () => {
  let component: GraficoPediccionProducto;
  let fixture: ComponentFixture<GraficoPediccionProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoPediccionProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoPediccionProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
