export enum ShapeListTranslationTokens {
  createNewSmartShape = 'shape-manager.component.createNewSmartShape',
  cloneSmartShape = 'shape-manager.component.cloneSmartShape',
  search = 'shape-manager.component.searchSmartShapes',
  deleteShape = 'shape-manager.component.deleteShape',
  copy = 'shape-manager.component.copy',
  missingData = 'shape-manager.component.missingData',
  discardChanges = 'shape-manager.component.discardChanges',
  managedInternally = 'shape-main.component.managedInternally',
}


export interface ShapeListTranslatedTokens {
  search: string;
  copy: string;
  missingData: string;
}
