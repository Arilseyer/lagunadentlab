import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavPage } from './nav.page';

describe('NavPage', () => {
  let component: NavPage;
  let fixture: ComponentFixture<NavPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
