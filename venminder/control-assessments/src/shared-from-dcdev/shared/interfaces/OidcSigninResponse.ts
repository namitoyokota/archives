export class OidcSigninResponse {
    constructor(
        public tokenRenewed: boolean,
        public tokenType: string,
        public accessToken: string
    ) { }
}
