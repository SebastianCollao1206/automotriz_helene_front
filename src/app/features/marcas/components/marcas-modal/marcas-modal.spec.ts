import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcasModal } from './marcas-modal';

describe('MarcasModal', () => {
  let component: MarcasModal;
  let fixture: ComponentFixture<MarcasModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcasModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcasModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
