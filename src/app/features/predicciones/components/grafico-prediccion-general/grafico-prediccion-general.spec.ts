import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoPrediccionGeneral } from './grafico-prediccion-general';

describe('GraficoPrediccionGeneral', () => {
  let component: GraficoPrediccionGeneral;
  let fixture: ComponentFixture<GraficoPrediccionGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoPrediccionGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoPrediccionGeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
