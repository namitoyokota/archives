import { RolesExpiration } from './invitation.v1';

export class InvitationRoles$v1 {
  /** The invitation's id */
  invitationId?: string;

  /** The roles assign to the invited user */
  roles?: RolesExpiration | string[];

  constructor(params: InvitationRoles$v1 = {} as InvitationRoles$v1) {
    const { invitationId = null, roles = null } = params;

    this.invitationId = invitationId;
    this.roles = roles;
  }
}
