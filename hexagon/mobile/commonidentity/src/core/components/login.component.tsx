import React from 'react';
import WebView from 'react-native-webview';

import CookieManager from '@react-native-cookies/cookies';


import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { AccessTokenService } from '../services/access-token.service';
import { EnvironmentService } from '../services/environment.service';

import { RootView } from '../../styles/login.component.style'

export const LoginScreen = () => {
  const environmentSrv = ServiceManager$v1.get(EnvironmentService);

  /** Base URL to login screen of the webapp */
  const BASE_URL = `${environmentSrv.snapShotBaseURL()}/webroot`;

  /** Authorize call backe url */
  const AUTH_CALLBACK = `/api/commonIdentities/connect/authorize/callback`;

  /** URL to get cookie */
  const COOKIES = `${BASE_URL}/api/commonIdentities`;

  /** Authorization cookie */
  let authCookie: string;

  /** Is user logged in */
  let loggedIn = false;

  /** Is the webview loading */
  let loading = false;

  /** Access token service */
  const accessTokenSrv = ServiceManager$v1.get(AccessTokenService);

  /**
   * Handles error with showing web view
   */
  const handleError = () => {
    console.error('Error: Not a valid base URL');
    accessTokenSrv.logOut();
  };

  return (
    <RootView>
      <WebView
        source={{ uri: BASE_URL }}
        sharedCookiesEnabled
        javaScriptEnabledAndroid={true}
        setBuiltInZoomControls={false}
        userAgent={
          'Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19 '
        }
        startInLoadingState
        onError={handleError}
        onHttpError={handleError}
        onNavigationStateChange={(event) => {
          if (event.url.includes(AUTH_CALLBACK) && !loggedIn && !loading) {
            loading = true;
          }
          if (event.url === BASE_URL && !loggedIn) {
            loggedIn = true;

            CookieManager.get(COOKIES, true).then(c => {
              authCookie = c['Authentication.Session']?.value as string;
              accessTokenSrv.setAuthCookieAsync(authCookie);
            })
          }
        }}
      />
    </RootView>
  );
};
