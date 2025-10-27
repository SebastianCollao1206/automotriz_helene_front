import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesMedidaTable } from './unidades-medida-table';

describe('UnidadesMedidaTable', () => {
  let component: UnidadesMedidaTable;
  let fixture: ComponentFixture<UnidadesMedidaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadesMedidaTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadesMedidaTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
