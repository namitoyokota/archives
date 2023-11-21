import { CommonFaultPoliciesService } from './fault-policies.service';

describe('CommonFaultPoliciesService', () => {
  let service: CommonFaultPoliciesService;

  beforeEach(() => {
    service = new CommonFaultPoliciesService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
