import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSectionPlaceholder } from './client-section-placeholder';

describe('ClientSectionPlaceholder', () => {
  let component: ClientSectionPlaceholder;
  let fixture: ComponentFixture<ClientSectionPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSectionPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientSectionPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
