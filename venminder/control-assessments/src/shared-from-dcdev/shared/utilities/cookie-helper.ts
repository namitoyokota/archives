export interface CookieOptions {
    expires?: Date;
    expiry?: number;
    path: string;
    domain: string;
    secure: boolean;
    sameSite: "Lax" | "Strict" | "None";
}

export class CookieHelper {
    public static get(name: string) {
        let cookies: any = this.all();

        if (cookies && cookies[name]) {
            return cookies[name];
        }

        return null;
    }

    static set(name: string, value: string, options: CookieOptions) {
        let str = `${this.encode(name)}=${this.encode(value)}`;

        if (value === null) {
            options.expiry = -1;
        }

        if (options?.expiry && options.expiry >= 0 && !options.expires) {
            let expires = new Date();
            expires.setHours(expires.getHours() + options.expiry);
            options.expires = expires;
        }

        if (options?.path) {
            str += `; path=${options.path}`;
        }

        if (options?.domain) {
            str += `; domain=${options.domain}`;
        }

        if (options?.expires) {
            str += `; expires=${options.expires.toUTCString()}`;
        }

        if (options?.sameSite) {
            str += `; samesite=${options.sameSite}`;
            if (options.sameSite == "None") {
                options.secure = true;
            }
        }

        if (options?.secure) {
            str += '; secure';
        }

        document.cookie = str;
    }

    static delete(name: string, domain?: string, path?: string) {
        let cookieString = `${name} =;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

        if (domain) {
            cookieString += `; domain=${domain}`;
        }

        if (path) {
            cookieString += `; path=${path}`;
        }

        document.cookie = cookieString;
    }

    static all() {
        return this.parse(document.cookie);
    }

    static parse(str: string) {
        let obj: any = {};
        let pairs: any = str.split(/ *; */);
        let pair: any;

        if (pairs[0] === '') {
            return obj;
        }

        for (let i = 0; i < pairs.length; ++i) {
            pair = pairs[i].split('=');
            obj[this.decode(pair[0])] = this.decode(pair[1]);
        }

        return obj;
    }

    static encode(value: string) {
        try {
            return encodeURIComponent(value);
        } catch (e) {
            return null;
        }
    }

    static decode(value: string): any {
        try {
            return decodeURIComponent(value);
        } catch (e) {
            return null;
        }
    }
}