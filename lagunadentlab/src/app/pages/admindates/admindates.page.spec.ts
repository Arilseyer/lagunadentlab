import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdmindatesPage } from './admindates.page';

describe('AdmindatesPage', () => {
  let component: AdmindatesPage;
  let fixture: ComponentFixture<AdmindatesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmindatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
