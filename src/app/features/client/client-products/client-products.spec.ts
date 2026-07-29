import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProducts } from './client-products';

describe('ClientProducts', () => {
  let component: ClientProducts;
  let fixture: ComponentFixture<ClientProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProducts],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
