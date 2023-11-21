import { CommonmapMailboxService } from './commonmap.mailbox';

describe('CommonmapMailboxService', () => {
  let service: CommonmapMailboxService;

  beforeEach(() => {
    service = new CommonmapMailboxService();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
