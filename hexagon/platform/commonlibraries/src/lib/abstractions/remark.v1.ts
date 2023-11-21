import { PostStyle$v1 } from './post-style.v1';

export class Remark$v1 {
  /** The first name of the author of remark */
  authorFirstName?: string;

  /** The middle name of the author of remark */
  authorMiddleName?: string;

  /** The last name of the author of remark */
  authorLastName?: string;

  /** The text contents of the remark */
  text?: string;

  /** The time the remark was made */
  createdTime?: Date;

  /** Remark priority style */
  priority?: PostStyle$v1;

  constructor(params: Remark$v1 = {} as Remark$v1) {
    const {
      authorFirstName = null,
      authorMiddleName = null,
      authorLastName = null,
      text = null,
      createdTime = null,
      priority = PostStyle$v1.normal,
    } = params;

    this.authorFirstName = authorFirstName;
    this.authorMiddleName = authorMiddleName;
    this.authorLastName = authorLastName;
    this.text = text;
    this.createdTime = createdTime;
    this.priority = priority;
  }
}

// TODO: remove this after changes have been made to web_common-libraries
export enum RemarkPriority$v1 {
  normal = 'normal',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}
