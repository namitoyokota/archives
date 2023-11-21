/**
 * This is the main testbed component. Change this as needed.
 */

import { getAdapter$v1, UserInfo } from "@galileo/mobile_commonidentity";
import React from "react";
import { Button } from "react-native";


 export const TestBedScreen = () => {

  return (
    <>
      <UserInfo></UserInfo>

      <Button
        onPress={() => {
          getAdapter$v1().logOut();
        }}
        title="Log Out"
      />
    </>
  );
}
