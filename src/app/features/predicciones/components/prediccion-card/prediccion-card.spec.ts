import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrediccionCard } from './prediccion-card';

describe('PrediccionCard', () => {
  let component: PrediccionCard;
  let fixture: ComponentFixture<PrediccionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrediccionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrediccionCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
