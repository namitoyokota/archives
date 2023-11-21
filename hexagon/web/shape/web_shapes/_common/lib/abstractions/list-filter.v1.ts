import { Filter$v1 } from '@galileo/web_common-libraries';
import { Shape$v1 } from './shape.v1';

export class ShapeListFilter$v1 extends Filter$v1<Shape$v1> {

  /**
   * Returns true if passes search
   */
  protected applySearchOperation(shape: Shape$v1): boolean {
    let passSearch = false;
    this.searchString = this.searchString.toLocaleLowerCase().trim();

    if (shape.name) {
      passSearch = shape.name.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
    }

    if (shape.description) {
      passSearch = shape.description?.toLocaleLowerCase()?.trim()?.includes(this.searchString) ? true : passSearch;
    }

    if (shape?.primaryContact?.firstName) {
      passSearch = shape.primaryContact.firstName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
    }

    if (shape?.primaryContact?.lastName) {
      passSearch = shape.primaryContact.lastName.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
    }

    if (shape?.primaryContact?.title) {
      passSearch = shape.primaryContact.title.toLocaleLowerCase().trim().includes(this.searchString) ? true : passSearch;
    }


    return passSearch;
  }
}
