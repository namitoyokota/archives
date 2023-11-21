import { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

export function configure(config: FrameworkConfiguration) {
	config
		//.globalResources([
		//	PLATFORM.moduleName('resources/attributes/vm-visibility-attribute', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-disabled', 'global'),
		//	PLATFORM.moduleName('resources/attributes/file-drop-target', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-slide-toggle', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-fade-toggle', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-popover', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-show-more', 'global'),
		//	PLATFORM.moduleName('resources/elements/vm-files-picker/vm-files-picker', 'global'),
		//	PLATFORM.moduleName('resources/elements/vm-weight-slider/vm-weight-slider', 'global'),
		//	PLATFORM.moduleName('resources/elements/vm-no-op-validator/vm-no-op-validator', 'global'),
		//	PLATFORM.moduleName('resources/attributes/vm-enter-press', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/boolean', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/boolean-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/tax-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/currency-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/date-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/sort', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/filter', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/phone-number-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/phone-filter', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/text-transformer', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/missing-string-format', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/filter', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/filter-vm-select', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/item-search', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/vendor-profile-questions-text', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/filter-past-date', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/get-items', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/is-length-greater-than', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/is-length-less-than', 'global'),
		//	PLATFORM.moduleName('resources/value-converters/take', 'global'),
		//])
		.feature(PLATFORM.moduleName('shared-from-dcdev/resources/features/index', 'global'));
		//.feature(PLATFORM.moduleName('resources/features/aurelia-quill/index', 'global'));
}
