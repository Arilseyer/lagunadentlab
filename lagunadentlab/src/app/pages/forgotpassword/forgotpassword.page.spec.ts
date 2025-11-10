import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotpasswordPage } from './forgotpassword.page';

describe('ForgotpasswordPage', () => {
  let component: ForgotpasswordPage;
  let fixture: ComponentFixture<ForgotpasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotpasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
