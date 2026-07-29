import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLicenses } from './client-licenses';

describe('ClientLicenses', () => {
  let component: ClientLicenses;
  let fixture: ComponentFixture<ClientLicenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLicenses],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientLicenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
