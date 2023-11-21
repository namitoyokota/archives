import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  const mockNavigationService = jasmine.createSpyObj(['openMainMenu']);

  beforeEach(() => {
    component = new AppComponent(mockNavigationService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
