# Webroot

Webroot is the core UI application for Live Share. It serves as an integration point for all the capabilities.

## Local Development
The webroot can be run locally using the angular cli.

1. Run the yarn buildAngular command. This will install all the needed dependencies and will also integrate all the available capabilities. 
2. You can now start the local server by calling yarn start.

You can also test your capability locally before deploying it to npm.

3. Follow the fist steps above. Now build your capability using yarn build.
4. Copy the contents of the dist folder into the node_module folder. The path inside the node_module folder will depend on the name of your capability. For example @galileo/alarms will be put into the "node_module\@galileo folder.
5. Run yarn buildAngularFiles This will integrate your capability into web root.
6. You can now run webroot with yarn start. 

## Integration
Capabilities integrate into the webroot primarily using a build-definition.json file. This file should only be added to your project when it is ready to be part of webroot.

### Creating the File
The build-definition.json file should be added under the projects folder at the same level as the assets folder.

![Example image of where the file should be placed](data:image/png;base64,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)

***In order to have the build-definition.json file delivered with your npm package the ng-package.json file needs to be updated. Add "build-definition.json" to the assets list.***

### Example ng-package.json
``` json
{
    "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
    "dest": "../../dist/commonidentity",
    "lib": {
        "entryFile": "src/public-api.ts"
    },
    "assets": [
        "assets",
        "build-definition.json"
    ]
}

```

### Example build-definition.json
```jsonc
{
    // Feature modules tells the webroot to create a lazy code chunks.
    // Your capability should have at least one feature module for the core. Each admin feature your capability has will also need a feature module.
    "featureModules": [
        {
            // This is the entry point into the feature.
            "entryPointId": "@galileo/commonkeywords/_core",

            // This is the id used to load the feature. It is the capability id for the core feature
            "chunkId": "@hxgn/commonkeywords",

            // This is the main angular module into the entry point. It should start with the capability name minus the @hxgn/.
            "module": "CommonkeywordsCoreModule"
        },
        {
            "entryPointId": "@galileo/commonkeywords/admin",

            // Admin features should have /admin/{{feature name}} appended to the capability.
            "chunkId": "@hxgn/commonkeywords/admin/icon-manager",
            "module": "IconManagementModule"
        }
    ],

    // Admin feature routing sets up routing to your admin feature.
    "adminFeatureRouting": [
        {
            // The path used to route to the feature. The below example would end up routing to hxgnconnect.com/webroot/admin/keywords/iconManager
            "path": "keywords/iconManager",
            "data": {
                // This is the component name that will be used to inject the admin component.
                "adminComponent": "@hxgn/commonkeywords/admin/iconmanager/v1",

                // This is the entry point (chunkId) that will inject the admin component 
                "adminId": "@hxgn/commonkeywords/admin",

                // Localization token for the title of the admin feature.
                "adminTitle": "commonKeyword-iconManagement.component.iconManager",

                // The claim used to limit access to the admin page. Only users with the claim listed here will be able to access the admin page
                "claim": "uiIconManagerAccess",

                // The capability id that the claim belongs to.
                "capabilityId": "@hxgn/commonkeywords"
            },

            // The guards that can be used to protect the admin feature. It is recommended that every admin feature be protected with a claim guard.
            //      1. ClaimGuard$v1 enforces that the claim listed above is on the user object.
            //      2. OnboardingGuard$v1 enforces that the onboarding process is complete before allowing access
            "canActivate": ["ClaimGuard$v1", "OnboardingGuard$v1"],

            // The guards that protect against a user leaving an admin page
            //      1. DirtyGuard$v1 will check the admin page for any unsaved changes and prompt the user if needed.
            // NOTE: If the dirty guard is not require leave as an empty list []
            "canDeactivate": ["DirtyGuard$v1"]
        }
    ]
}
```

### Menu Integration
Menu items are dynamically added to the UI. This is done by settings in the capability manifest. There are two place in the UI that a menu item can be added. The main admin menu that can be accessed from the hamburger on the admin page and the quick link panel on the admin home page.

#### Admin Menu
The admin menu support organizing menu items by sections and by nesting a menu item under another. Use one of the below values to set the section property.

Live Share supports 3 different sections:
- System
- Onboarding
- Troubleshooting

To nest an item set the parentId property to the be the id of the item it should be nested under.

**Note: A parent menu item cannot have a route associated with it.**

To add a menu item add the following JSON to the compatible section of the capability manifest.

### Example Capability manifest JSON
```jsonc
{
    "compatible": [
        {
            "CapabilityId": "webroot",
            "Options": {
                "adminMenuItems": [
                    {
                        // This is where the UI will be routed to when the menu item is clicked.
                        "path": "/admin/organizationManager",

                        // Id of the item this item should be nested under
                        "parentId": "accessDataSharing",

                        // Translation token of the name that is shown on the menu item
                        "nameToken": "commonTenant-orgManager.component.organizationManager",

                        // The section the menu item will be put under
                        "section": "Onboarding",

                        // Optional: Path to icon that will be shown on the admin menu
                        "menuIconUrl": "assets/commontenant-core/admin-menu/organization-manager-icon.svg",

                        // Optional: Provide a quick link icon to have a menu item showup in the quick link panel
                        "quickLinkIconUrl": "assets/commontenant-core/admin-menu/quick-link-organization-manager-icon.svg",

                        // The claim that is used to limit access to page.
                        "claimGuard": "uiTenantManagementAccess",

                        // Optional: If the feature is hidden behind a feature flag add it here.
                        "featureFlag": "FF_CommonTenant_2",

                        // A flag that is true if the menu items is only for provisioners of the system
                        "provisioner": true
                    }
                ]
            }
        }
    ]
}
```