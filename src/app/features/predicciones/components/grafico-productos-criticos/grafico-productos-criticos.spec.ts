import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoProductosCriticos } from './grafico-productos-criticos';

describe('GraficoProductosCriticos', () => {
  let component: GraficoProductosCriticos;
  let fixture: ComponentFixture<GraficoProductosCriticos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoProductosCriticos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoProductosCriticos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
