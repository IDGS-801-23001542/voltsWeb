import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientQuotes } from './client-quotes';

describe('ClientQuotes', () => {
  let component: ClientQuotes;
  let fixture: ComponentFixture<ClientQuotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientQuotes],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientQuotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
