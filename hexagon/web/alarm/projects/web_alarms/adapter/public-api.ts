/*
* Public API Surface of alarms-adapter
*/

export * from './lib/adapter.module';
export * from './lib/adapter.v1.service';
export * from './lib/alarm-status/alarm-status.component';
export * from './lib/alarm-status/alarm-status.module';
export * from './lib/alarm-media/alarm-media.module';
export * from './lib/alarm-media/alarm-media.component';
export * from './lib/alarm-priority/alarm-priority.module';
export * from './lib/alarm-priority/alarm-priority.component';
export * from './lib/alarm-clear-icon/alarm-clear-icon.component';
export * from './lib/alarm-clear-icon/alarm-clear-icon.module';
export * from './lib/alarm-title/alarm-title.module';
export * from './lib/alarm-title/alarm-title.component';
export * from './lib/alarm-filter/alarm-filter.component';
export * from './lib/alarm-filter/alarm-filter.module';
export * from './lib/alarm-panel/alarm-panel.component';
export * from './lib/alarm-panel/alarm-panel.module';

export {
  Alarm$v1,
  capabilityId
} from '@galileo/web_alarms/_common';
