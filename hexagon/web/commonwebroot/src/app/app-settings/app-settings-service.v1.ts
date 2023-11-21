import { Injectable } from '@angular/core';

@Injectable()
export class AppSettingsService$v1 {

  private productVersion: string = (window as any).productVersion;

  constructor() {}

  /**
   * Returns value of productVersion global variable
   */
  getProductVersion(): string {
    return this.productVersion;
  }
}