import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaUnidadesMedida } from './lista-unidades-medida';

describe('ListaUnidadesMedida', () => {
  let component: ListaUnidadesMedida;
  let fixture: ComponentFixture<ListaUnidadesMedida>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaUnidadesMedida]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaUnidadesMedida);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
