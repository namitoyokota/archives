
/**
 * Get import mapping of capabilities that can be lazy loaded.
 */
export function getImportMapping(): Map<string, () => Promise<any>> {

  const imports = new Map<string, () => Promise<any>>();

  imports.set('@hxgn/commonidentity',
    () => {
      return import('@galileo/mobile_commonidentity').then(c => {
        c.coreInit();
      });
    }
  );

  return imports;
}
