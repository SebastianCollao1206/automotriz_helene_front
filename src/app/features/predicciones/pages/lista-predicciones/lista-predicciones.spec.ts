import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPredicciones } from './lista-predicciones';

describe('ListaPredicciones', () => {
  let component: ListaPredicciones;
  let fixture: ComponentFixture<ListaPredicciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPredicciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPredicciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
