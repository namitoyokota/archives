import { Component } from '@angular/core';
import { TokenManager$v1 } from '@galileo/platform_common-http';

import { AccessTokenDataAccessor$v1, Group$v1, GroupDataAccessor$v1, GroupVisibility$v1, InviteDataAccessor$v1, PersonalizationDataAccessor$v1, UserPersonalization$v1, UsersGroups$v1 } from '@galileo/platform_commonidentity';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'testbed-app';
  tenantId = '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a';

  userGroup = {
    "groups": [

    ],
    "users": [
      {
        "id": "cfa52a0f-f640-4c5c-bcfc-843932bc39e4",
        "displayName": "Test B2C User 1",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser1",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "14a9ef9f-5e82-4a82-990d-5b856ac12afc",
        "displayName": "Test B2C User 2",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser2",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "14e81b08-4776-4c61-ac0c-3c1db2d30264",
        "displayName": "Test B2C User 3",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser3",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "8a01c94c-da5b-4911-9e8c-5d44bdad6339",
        "displayName": "Test B2C User 4",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser4",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "e74309d3-ac9e-4386-8d39-efae5a21e6e6",
        "displayName": "Test B2C User 5",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser5",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "f0c2f112-b563-47d0-bab4-740c6420fecd",
        "displayName": "Test B2C User 6",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser6",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "8269e301-5c49-45c5-b6b1-fd03b970a604",
        "displayName": "Test B2C User 7",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser7",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "1320cd06-4c17-4f2e-8b58-b4d3fe5c2dfc",
        "displayName": "Test B2C User 8",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser8",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "24b31907-5919-4fa9-961b-f1be28f9e179",
        "displayName": "Test B2C User 9",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser9",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "894b0e71-8d5b-4844-b9f4-c8327729a92e",
        "displayName": "Test B2C User 10",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser10",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "fb66eb32-f8bc-48e7-9c47-e0852fa85816",
        "displayName": "Test B2C User 1",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser1",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "07d9c3be-ee7c-4b07-ba7a-44457f218709",
        "displayName": "Test B2C User 2",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser2",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "2c6283ea-4013-46ba-a432-210cab6be475",
        "displayName": "Test B2C User 3",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser3",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "05c39b6c-48f6-4af2-b502-f82472e28833",
        "displayName": "Test B2C User 4",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser4",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "029307dc-20f0-4b72-a871-0634a3a16ce4",
        "displayName": "Test B2C User 5",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser5",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "c4339776-9cb2-4a1e-ad5f-4a764b382002",
        "displayName": "Test B2C User 6",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser6",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "6a487f92-0ced-4524-b85f-6bee213a8c27",
        "displayName": "Test B2C User 7",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser7",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "e2bd5919-1a57-42c2-866d-65f9b82076b4",
        "displayName": "Test B2C User 8",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser8",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "9a282551-1a56-4ca9-85e1-5c02b9dfb545",
        "displayName": "Test B2C User 9",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser9",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      },
      {
        "id": "0c5fc670-561d-496e-a292-ffd78dcb5a15",
        "displayName": "Test B2C User 10",
        "title": "",
        "activeTenant": "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
        "tenantIds": [
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a"
        ],
        "profileImage": null,
        "email": "",
        "phone": "",
        "familyName": "",
        "givenName": "",
        "accountUserName": "TestB2CUser10",
        "visibilities": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Internal"
        },
        "presences": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": "Offline"
        },
        "status": {
          "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a": {
            "avStatus": "Unavailable",
            "userPresence": "Offline"
          }
        }
      }
    ]
  }

  constructor() {
    const tokenManager = new TokenManager$v1();
    const cookie = 'CfDJ8I3QtCIrLmxNhMFA8-Xus3eZwuDiG1ZBJdlCGAeMpQDl-a9_aqQWZse7NfHapknThwMKMIJSlrGa8l-580H6PktGC9xA3YETr_OYMhQ91nr3_pEewNgt-XFI-xTc8FWDhY5sUaI53UuWCSw9Eh0G1EffyFjeJs2jJp-Vl2G5w8FR7k0RW3yNLagrzMw5_KTWt4eovEm02SHPHyvvAHxKZjS-Q6XrhBC0EO638wiv1oIfjL3VAWAftgbprijhCYxA0EvA1WVNAl1pLb4oEnzMGtz0fsRV79JMa9vJolrOhuxbU95NNsyNvH_angyDjdg_oQ';
    const da = new AccessTokenDataAccessor$v1(tokenManager as any, 'https://dev.hxgnconnect.com/webroot');
    da.get$(cookie).toPromise().then(r => {
      console.info('r', r);
    })

    //tokenManager.setToken('92de73797073b104078ff550a7c95c522048327325777885512818e00e509a07', 86400);

    // const personalizationAccessor = new PersonalizationDataAccessor$v1(tokenManager as any);
    // const invitationAccessor = new InviteDataAccessor$v1(tokenManager as any);
    // const groupAccessor = new GroupDataAccessor$v1(tokenManager as any);

    //this.testGroupDataAccessorAsync(groupAccessor);
    // this.testInviteDataAccessorAsync(invitationAccessor);
    // this.testPersonalizationAccessorAsync(personalizationAccessor);

    // const userGroup = new UsersGroups$v1(this.userGroup as any);
    // console.info(userGroup);
  }

  async testGroupDataAccessorAsync(group: GroupDataAccessor$v1) {
    await group.get$().toPromise().then(list => {
      console.info('Full list', list);
    });

    const updateGroupA = new Group$v1({
      id: "72a8f6fe-caca-4a90-8a5e-23fd29d5c44d",
      name: "test",
      tenantId: "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
      description: "I am a update",
      priorityIndex: 1,
      visibility: GroupVisibility$v1.internal,
      tombstoned: false
    } as Group$v1);

    const updateGroupB = new Group$v1({
      id: "2E710735-F13B-43C9-8F3B-AF8B4F36CA72",
      name: "Group1",
      groupIconUrl: "https://galileolocalcommonstore.blob.core.windows.net/public-jleshko/groupIcons/1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a/2E710735-F13B-43C9-8F3B-AF8B4F36CA72",
      tenantId: "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
      description: "Test group for Hexagon tenant",
      priorityIndex: 0,
      visibility: GroupVisibility$v1.internal,
      tombstoned: false
    } as Group$v1);

    await group.update$([updateGroupA, updateGroupB]).toPromise().then(group => {
      console.info('group', group);
    })

    await group.get$(['72a8f6fe-caca-4a90-8a5e-23fd29d5c44d']).toPromise().then(list => {
      console.info('Search list', list);
    });
  }

  async testInviteDataAccessorAsync(invitationAccessor: InviteDataAccessor$v1) {
    // await invitationAccessor.create$([
    //   {
    //     "email": "",
    //     "roles": {
    //       "liveShare:Operator": new Date('9999-12-31T23:59:59.9999999+00:00')
    //     },
    //     "expiration": new Date('2022-08-26T14:43:42.6094827+00:00')
    //   }
    // ]).toPromise();

    // await invitationAccessor.get$().toPromise().then(list => {
    //   console.info('Get invites', list);
    // });

    await invitationAccessor.createAdmin$(this.tenantId).subscribe();

    // invitationAccessor.delete$([
    //   'b6ecc37f-e105-4582-82a2-0b53dd3981d3', '497f5fb7-d08c-48ef-aec3-21b49a03b8a6'
    // ]).subscribe();
  }

  async testPersonalizationAccessorAsync(personalizationAccessor: PersonalizationDataAccessor$v1) {
    await personalizationAccessor.upsert$(new UserPersonalization$v1({
      userId: 'a329132d-ef4f-42f7-b258-2ae5a5d28901',
      capabilityKey: 'abc123-efg',
      personalizationSettings: 'this is a test string 2'
    } as UserPersonalization$v1)).toPromise();

    await personalizationAccessor.get$(
      'a329132d-ef4f-42f7-b258-2ae5a5d28901',
      'abc123-efg'
    ).toPromise().then(setting => {
      console.info('Setting', setting);
    });

    await personalizationAccessor.delete$(
      'a329132d-ef4f-42f7-b258-2ae5a5d28901',
      'abc123-efg'
    ).toPromise();

    await personalizationAccessor.get$(
      'a329132d-ef4f-42f7-b258-2ae5a5d28901',
      'abc123-efg'
    ).toPromise().then(setting => {
      console.info('Setting', setting);
    });
  }
}
