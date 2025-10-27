import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesMedidaModal } from './unidades-medida-modal';

describe('UnidadesMedidaModal', () => {
  let component: UnidadesMedidaModal;
  let fixture: ComponentFixture<UnidadesMedidaModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadesMedidaModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadesMedidaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
