import { Injectable } from '@angular/core';
import { CommonlicensingAdapterService$v1 } from '@galileo/web_commonlicensing/adapter';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LicenseService {

  /** Flag that is true when there is a license for shapes */
  private isLicensed = new BehaviorSubject<boolean>(false);

  /** Flag that is true when there is a license for shapes */
  isLicensed$ = this.isLicensed.asObservable();

  private readonly licenseName = 'hxgnconnect_shape';

  constructor(
    private licenseAdapter: CommonlicensingAdapterService$v1
  ) {

    this.licenseAdapter.isFeatureLicensedAsync(this.licenseName).then((hasAccess: boolean) => {
      this.isLicensed.next(hasAccess);
    });

  }

}
