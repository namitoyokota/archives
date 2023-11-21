export enum FilterOperationType$v2 {
  equals = 'Equals',
  contains = 'Contains'
}

export enum FilterInputType$v2 {
  input = 'input',
  dropdown = 'dropdown',
  date = 'date'
}

export class FilterOperation$v2 {

  /** What property this filter applies to */
  property?: string;

  /** The type of filter operation */
  type?: FilterOperationType$v2;

  /** String operation */
  operationString?: string;

  /** The type of input for the filter */
  inputType?: FilterInputType$v2;

  /** 
   * List of values if the inputType is a dropdown
   * Format: {val: id, string: display}
  */
  inputValues?: { val: string, display: string }[];

  constructor(params: FilterOperation$v2 = {} as FilterOperation$v2) {
    const {
      property,
      type = null,
      operationString = '',
      inputType = FilterInputType$v2.input,
      inputValues = []
    } = params;

    this.property = property;
    this.type = type;
    this.operationString = operationString;
    this.inputType = inputType;
    this.inputValues = inputValues;
  }
}
