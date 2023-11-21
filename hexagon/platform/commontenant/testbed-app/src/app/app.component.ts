import { Component } from '@angular/core';
import { TokenManager$v1 } from '@galileo/platform_common-http';
import { DataSharingDataAccessor$v1, Tenant$v1, TenantDataAccessor$v1, JargonDataAccessor$v1, SharingCriteriaDataAccessor$v1 } from '@galileo/platform_commontenant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  existingTenant = new Tenant$v1();

  constructor() {
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('97877a759c6b1b8039648475879b55d93c82a13156c1c60fac7c2b49e727de2f', 86400);

    const dataSharingDataAccessor = new DataSharingDataAccessor$v1(tokenManager);
    const jargonDataAccessor = new JargonDataAccessor$v1(tokenManager);
    const sharingCriteriaDataAccessor = new SharingCriteriaDataAccessor$v1(tokenManager);
    const tenantDataAccessor = new TenantDataAccessor$v1(tokenManager);

    tenantDataAccessor.getDetailedList$().subscribe(tenants => {
      if (tenants?.length) {
        // Store existing tenant
        this.existingTenant = tenants[0];

        // this.testDataSharingDataAccessorAsync(dataSharingDataAccessor);
        // this.testJargonDataAccessorAsync(jargonDataAccessor);
        // this.testSharingCriteriaDataAccessorAsync(sharingCriteriaDataAccessor);
        // this.testTenantDataAccessorAsync(tenantDataAccessor);
      }
    })
  }

  async testDataSharingDataAccessorAsync(dataSharing: DataSharingDataAccessor$v1) {
    dataSharing.getSharees$().subscribe(tenants => {
      console.info('List of sharees', tenants);
    });

    dataSharing.getCapabilityManifests$().subscribe(capabilities => {
      console.info('Capability list', capabilities);
    });

    dataSharing.getLicensedOperations$().subscribe(list => {
      console.info('List of capability operations', list);
    });
  }

  async testJargonDataAccessorAsync(jargon: JargonDataAccessor$v1) {
    console.log(this.existingTenant);

    jargon.update(this.existingTenant).subscribe(tenant => {
      console.info('Updated tenant', tenant);
    });
  }

  async testSharingCriteriaDataAccessorAsync(sharingCriteria: SharingCriteriaDataAccessor$v1) {
    sharingCriteria.get$().subscribe(async criteria => {
      console.info('Sharing criteria', criteria);

      if (criteria?.length) {
        const existingCriteria = criteria[0];
        existingCriteria.capabilityId = '123';

        const createdCriteria = await sharingCriteria.create$(existingCriteria).toPromise();
        console.info('Created criteria', createdCriteria);

        const updatedCriteria = await sharingCriteria.update$(createdCriteria).toPromise();
        console.info('Updated criteria', updatedCriteria);

        sharingCriteria.delete$([updatedCriteria[0].sharingCriteriaId as string]);
      }
    });

    sharingCriteria.getShareeIds$().subscribe(tenantIds => {
      console.info('List of shared tenants', tenantIds);
    });

    sharingCriteria.getMap$().subscribe(capabilityMap => {
      console.info('Capability map', capabilityMap);
    });
  }

  async testTenantDataAccessorAsync(tenant: TenantDataAccessor$v1) {
    tenant.get$(this.existingTenant.id).subscribe(tenant => {
      console.info('Found tenant', tenant);
    });

    // get from access token

    tenant.getUserTenants$().subscribe(tenants => {
      console.info('Tenants for user', tenants);
    });

    tenant.getList$().subscribe(tenants => {
      console.info('List of tenants', tenants);
    });

    tenant.getDetailedList$().subscribe(tenants => {
      console.info('List of tenants in detail', tenants);
    });

    tenant.getNetworks$().subscribe(networks => {
      console.info('Data sharing networks', networks);
    });

    tenant.getApplications$().subscribe(applications => {
      console.info('Application list', applications);
    });

    tenant.getIndustries$().subscribe(industries => {
      console.info('Industries list', industries);
    });
  }
}
