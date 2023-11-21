import { Filter$v1 } from '@galileo/web_common-libraries';

import { Alarm$v1 } from './alarm.v1';

export class AlarmFilter$v1 extends Filter$v1<Alarm$v1> {
    /**
     * Returns true if passes search
     */
    protected applySearchOperation(alarm: Alarm$v1): boolean {
        let passSearch = false;
        this.searchString = this.searchString.toLocaleLowerCase().trim();

        if (alarm.title) {
            passSearch = alarm.title.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        if (alarm.location && alarm.location.formattedAddress) {
            passSearch = alarm.location.formattedAddress.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        if (alarm.priority) {
            passSearch = alarm.priority.toString().toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        // Look at all the remarks
        if (alarm.remarks) {
            for (const remark of alarm.remarks) {
                if (remark.text) {
                    passSearch = remark.text.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
                }

                if (remark.authorFirstName) {
                    passSearch = remark.authorFirstName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
                }

                if (remark.authorLastName) {
                    passSearch = remark.authorLastName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
                }
            }
        }

        if (alarm.primaryContact && alarm.primaryContact.firstName) {
            passSearch = alarm.primaryContact.firstName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        if (alarm.primaryContact && alarm.primaryContact.lastName) {
            passSearch = alarm.primaryContact.lastName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        if (alarm.primaryContact && alarm.primaryContact.title) {
            passSearch = alarm.primaryContact.title.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
        }

        return passSearch;
    }
}
