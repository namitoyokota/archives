/*
* Public API Surface of commonrecovery-adapter
*/

export * from './lib/adapter.module';
export * from './lib/adapter.v1.service';
export * from './lib/tenant-recovery/tenant-recovery.module';
export * from './lib/tenant-recovery/tenant-recovery.component';

export {
    capabilityId, Claims
} from '@galileo/web_commonrecovery/_common';
