import { Aurelia, inject, Container } from 'aurelia-framework';
import { NavigationInstruction, Redirect, Next, Router } from 'aurelia-router';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { LoggedInUser } from '../models/userInfo';
import { isNullOrUndefined } from '../utilities/globals';
import appsettings from '../../../../config/appsettings.json';


export class AuthorizeStep {

    public userInfo: LoggedInUser;
    public userIsLoggedIn: boolean = false;
    public roleAuthorizers: Map<string, IRoleAuthorizer> = new Map<string, IRoleAuthorizer>();

    constructor(
        @inject(Aurelia) public aurelia: Aurelia,
        @inject(Router) private router: Router,
        @inject(AuthService) private authService: AuthService,
        @inject(UserService) private userService: UserService
    ) {
        this.roleAuthorizers.set("DC", new VmAdminRoleAuthorizer(aurelia.container, router));
    }

    public async run(navigationInstruction: NavigationInstruction, next: Next): Promise<any> {
        let isRouteAccessable = true;
        const allInstructions = navigationInstruction.getAllInstructions();
        const routeRequiresUserBeLoggedIn = allInstructions.some((i) => i.config.settings.auth);
        const routeRequiresUserBeLoggedOut = allInstructions.some((i) => i.config.settings.unAuth);

        this.userIsLoggedIn = await this.authService.isLoggedIn();

        if (this.userIsLoggedIn) {
            if (routeRequiresUserBeLoggedOut) {
                //debugger;
                return next.cancel(new Redirect(appsettings.RsdUrl + `/user/logout`));
            } else {
                isRouteAccessable = await this.checkIfRouteIsAccessibleForUser(allInstructions, navigationInstruction);
            }
        }
        else if (routeRequiresUserBeLoggedIn) {
            //debugger;
            // needs to be redirected to login page.
            return next.cancel(new Redirect(appsettings.RsdUrl + `/user/login?returnUrl=${encodeURIComponent(appsettings.Control_Assessments_Templates)}`));
        }

        if (isRouteAccessable) {
            return next();
        } else {
            return next.cancel(new Redirect(appsettings.RsdUrl + '/user/dashboard'));
        }
    }

    private async checkIfRouteIsAccessibleForUser(allInstructions: NavigationInstruction[], navigationInstruction: NavigationInstruction) {
        const user = await this.userService.getUserInfo();
        let isRouteAccessable = this.checkRoles(allInstructions, user);
        if (isRouteAccessable) {
            for (let i = 0; i < user.roles.length; i++) {
                const role = user.roles[i];
                if (this.roleAuthorizers.has(role.name)) {
                    isRouteAccessable = await this.roleAuthorizers.get(role.name).checkIsRouteAccessible(allInstructions, navigationInstruction, user);
                    if (isRouteAccessable) {
                        return true;
                    }
                }
            }
        }
        return isRouteAccessable
    }

    public checkRoles(allInstructions: NavigationInstruction[], user: LoggedInUser): boolean {
        let roles = new Set<string>();
        allInstructions.forEach(navigationInstruction => {
            if (navigationInstruction.config
                && navigationInstruction.config.settings
                && navigationInstruction.config.settings.roles
                && navigationInstruction.config.settings.roles.length > 0) {
                navigationInstruction.config.settings.roles.forEach(role => {
                    if (!roles.has(role))
                        roles.add(role);
                });
            }
        })

        let hasAccess = roles.size == 0;
        roles.forEach(role => {
            if (user.isInRoleByName(role))
                hasAccess = true;
        });

        return hasAccess;
    }
}

export class VmAdminRoleAuthorizer implements IRoleAuthorizer {

    constructor(private diContainer: Container, private router: Router) {
    }

    public async checkIsRouteAccessible(allInstructions: NavigationInstruction[], navigationInstruction: NavigationInstruction, user: LoggedInUser): Promise<boolean> {
        let venminderUserRoles: Map<string, boolean> = new Map<string, boolean>();
        allInstructions.forEach(i => {
            const vmRoles: string[] = (i?.config?.settings?.venminderRoles ?? []);
            vmRoles.forEach(r => {
                if (!venminderUserRoles.has(r)) {
                    venminderUserRoles.set(r, true);
                }
            })
        });
        const uniqueRolesRequiredForRouteAccess = Array.from(venminderUserRoles.keys());
        const firstRequiredRoleTheUserDoesNotHave = uniqueRolesRequiredForRouteAccess.find(r => isNullOrUndefined(user.venminderRoles.find(role => role.roleID == r || role.name == r)));
        return isNullOrUndefined(firstRequiredRoleTheUserDoesNotHave);
    }
}

export interface IRoleAuthorizer {
    checkIsRouteAccessible(allInstructions: NavigationInstruction[], navigationInstruction: NavigationInstruction, user: LoggedInUser): Promise<boolean>;
}