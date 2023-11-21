
/** @deprecated Should use FilterOperationType$v2 now */
export enum FilterOperationType$v1 {
  equals = 'Equals',
  contains = 'Contains'
}

/** @deprecated Should use FilterOperation$v2 now */
export class FilterOperation$v1 {

  /** What property this filter applies to */
  property?: string;

  /** The type of filter operation */
  type?: FilterOperationType$v1;

  /** String operation */
  operationString?: string;

  constructor(params: FilterOperation$v1 = {} as FilterOperation$v1) {
      const {
          property,
          type = null,
          operationString = ''
      } = params;

      this.property = property;
      this.type = type;
      this.operationString = operationString;
  }
}
