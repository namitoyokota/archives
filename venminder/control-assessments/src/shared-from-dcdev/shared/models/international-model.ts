

export enum PhoneNumberType {
	home = 1,
	work = 2,
	other = 3,
	mobile = 4,
};

import { Constants } from "shared-from-dcdev/shared/enums/constants";

export class CountryCode {
	constructor (
		public id: string = Constants.emptyGuid,
		public dialingCode: string = null,
		public country: string = null,
		public inTopGroup: boolean = false,
		public sortIndex: number = 0,
		public isUS: boolean = false
	) {
	}
	static create (item: CountryCode = null, preserveNull: boolean = false): CountryCode {
		return item == null
			? preserveNull ? null : new CountryCode()
			: new CountryCode(
				item.id,
				item.dialingCode,
				item.country,
				item.inTopGroup,
				item.sortIndex,
				item.isUS
			);
	}
};

export class PhoneNumber {
	constructor (
		public id: string = Constants.emptyGuid,
		public areaCode: string = null,
		public prefix: string = null,
		public suffix: string = null,
		public extension: string = null,
		public phoneNumberType: PhoneNumberType = <PhoneNumberType>1,
		public countryCodeID: string = null,
		public internationalPhoneNumber: string = null,
		public isUS: boolean = false,
		public dialingCode: string = null
	) {
	}
	static create (item: PhoneNumber = null, preserveNull: boolean = false): PhoneNumber {
		return item == null
			? preserveNull ? null : new PhoneNumber()
			: new PhoneNumber(
				item.id,
				item.areaCode,
				item.prefix,
				item.suffix,
				item.extension,
				item.phoneNumberType,
				item.countryCodeID,
				item.internationalPhoneNumber,
				item.isUS,
				item.dialingCode
			);
	}
// Class left open on purpose

	getFormattedNumber(includeType: boolean = true): string {

		var phoneNumber = "";
		var phoneType = "";
		var extension = this.extension != null && this.extension != "" ? " x" + this.extension : "";

		switch (this.phoneNumberType) {
			case PhoneNumberType.work:
				phoneType = "w";
				break;
			case PhoneNumberType.mobile:
				phoneType = "m";
				break;
			case PhoneNumberType.home:
				phoneType = "h";
				break;
			case PhoneNumberType.other:
				phoneType = "o";
				break;
		}

		if (this.dialingCode == "1") {
			phoneNumber = "+" + this.dialingCode + " " + this.areaCode + "-" + this.prefix + "-" + this.suffix + extension;
		}
		else {
			phoneNumber = "+" + this.dialingCode + " " + this.internationalPhoneNumber + extension;
		}

		if(includeType) {
			phoneNumber += " (" + phoneType + ")";
		}

		return phoneNumber;
	}

	getSimpleFormattedNumber(): string {

		var phoneNumber = "";
		var phoneType = "";
		var extension = this.extension != null && this.extension != "" ? " x" + this.extension : "";

		switch (this.phoneNumberType) {
			case PhoneNumberType.work:
				phoneType = "w";
				break;
			case PhoneNumberType.mobile:
				phoneType = "m";
				break;
			case PhoneNumberType.home:
				phoneType = "h";
				break;
			case PhoneNumberType.other:
				phoneType = "o";
				break;
		}

		if (this.dialingCode == "1") {
			phoneNumber = this.dialingCode + "-" + this.areaCode + "-" + this.prefix + "-" + this.suffix + extension;
		}
		else {
			phoneNumber = this.dialingCode + "-" + this.internationalPhoneNumber + extension;
		}

		return phoneNumber;
	}
}
export class State {
	constructor (
		public abbreviation: string = null,
		public name: string = null
	) {
	}
	static create (item: State = null, preserveNull: boolean = false): State {
		return item == null
			? preserveNull ? null : new State()
			: new State(
				item.abbreviation,
				item.name
			);
	}
};
