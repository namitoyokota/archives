import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RenderComponent } from './render.component';

describe('RenderComponent', () => {
  let component: RenderComponent;
  const mockLayoutCompilerService = jasmine.createSpyObj(['loadTabModulesAsync', 'loadManifestViews']);

  beforeEach(() => {
    component = new RenderComponent(mockLayoutCompilerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
