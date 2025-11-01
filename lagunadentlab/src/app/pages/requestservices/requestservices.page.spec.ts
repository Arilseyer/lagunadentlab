import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestservicesPage } from './requestservices.page';

describe('RequestservicesPage', () => {
  let component: RequestservicesPage;
  let fixture: ComponentFixture<RequestservicesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestservicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
