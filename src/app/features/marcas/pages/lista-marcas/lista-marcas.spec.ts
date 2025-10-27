import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMarcas } from './lista-marcas';

describe('ListaMarcas', () => {
  let component: ListaMarcas;
  let fixture: ComponentFixture<ListaMarcas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMarcas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaMarcas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
