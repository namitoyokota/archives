/**
 * Object representing personnel
 */
export class Person$v1 {
  /** First name of the individual */
  firstName?: string;

  /** Middle name of the individual */
  middleName?: string;

  /** Last name of the individual */
  lastName?: string;

  /** Title of the individual */
  title?: string;

  /** Email of the individual */
  email?: string;

  /** Phone number of the individual */
  phone?: string;

  constructor(params: Person$v1 = {} as Person$v1) {
    const {
      firstName = null,
      middleName = null,
      lastName = null,
      title = null,
      email = null,
      phone = null,
    } = params;

    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.title = title;
    this.email = email;
    this.phone = phone;
  }
}
