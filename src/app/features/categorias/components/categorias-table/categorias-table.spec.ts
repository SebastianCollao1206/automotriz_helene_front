import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasTable } from './categorias-table';

describe('CategoriasTable', () => {
  let component: CategoriasTable;
  let fixture: ComponentFixture<CategoriasTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
