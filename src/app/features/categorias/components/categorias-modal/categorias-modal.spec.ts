import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasModal } from './categorias-modal';

describe('CategoriasModal', () => {
  let component: CategoriasModal;
  let fixture: ComponentFixture<CategoriasModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
