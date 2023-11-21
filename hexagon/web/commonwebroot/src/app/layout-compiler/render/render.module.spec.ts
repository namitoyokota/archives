import { RenderModule } from './render.module';

describe('RenderModule', () => {
  let renderModule: RenderModule;

  beforeEach(() => {
    renderModule = new RenderModule();
  });

  it('should create an instance', () => {
    expect(renderModule).toBeTruthy();
  });
});
