import { AuthenticationAppState, getAdapter$v1 } from "@galileo/mobile_commonidentity";
import React from "react";
import { Text } from "react-native";

/**
 * Loading screen while the application starts up
 */
export const AppLoadingScreen = ({ navigation }: any) => {

  React.useEffect(() => {
    // Based on the authentication state navigate to the correct screen
    getAdapter$v1().authenticationInit$.subscribe((state: AuthenticationAppState) => {
      if (state === AuthenticationAppState.authenticated) {
        navigation.replace('Secure');
      } else if (state === AuthenticationAppState.unauthenticated) {
        navigation.replace('LogIn');
      }
    });
  });

  return (
    <>
      <Text>HxGN Connect Mobile</Text>
      <Text>Loading...</Text>
    </>
  );
}
