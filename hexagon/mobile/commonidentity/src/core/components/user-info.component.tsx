import { ServiceManager$v1 } from "@galileo/mobile_dynamic-injection-engine";
import { UserInfo$v1, UserPresence$v1, UserStore$v1 } from "@galileo/platform_commonidentity";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { UserIcon } from "./icon.component";

/**
 * This is a test component that shows some info about a user
 */
export const UserInfo = () => {
  const [user, setUser] = useState<UserInfo$v1>();
  const [userCount, setUserCount] = useState<number>();
  const [userStatus, setUserStatus] = useState<UserPresence$v1>();

  const styles = StyleSheet.create({
      host: {
        display: 'flex',
        flexDirection: 'row',
        padding: 10
      },
      displayName: {
        fontSize: 30
      },
      info: {
        marginLeft: 10
      },
      extraInfo: {
        backgroundColor: '#666',
        padding: 5
      },
      whiteText: {
        color: '#fff',
        fontWeight: '700'
      }
  });

  let activeUserSub: Subscription;
  let userCountSub: Subscription;

  React.useEffect(() => {
    const userStoreSrv = ServiceManager$v1.get(UserStore$v1);
    if (!activeUserSub) {
      activeUserSub = userStoreSrv.activeUser$.subscribe(user => {
          setUser(user);
          if (user?.activeTenant && user?.status) {
            setUserStatus(user?.status[user?.activeTenant]?.userPresence);
          }

      });
    }

    if (!userCountSub) {
      userCountSub = userStoreSrv.entity$.pipe(
        map(users => users?.length)
      ).subscribe((count: number) => {
        setUserCount(count);
      })
    }

    return () => {
      if (userStoreSrv) {
        activeUserSub.unsubscribe();
      }
    }
  },[]);

  return(
    <>
      <View style={styles.host}>
        <UserIcon iconURI={user?.profileImage}></UserIcon>
        <View style={styles.info}>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text>{user?.accountUserName}</Text>
        </View>
      </View>
      <View style={styles.extraInfo}>
        <Text style={styles.whiteText}>User State: {userStatus}</Text>
        <Text style={styles.whiteText}>Total Users: {userCount}</Text>
      </View>

    </>
  );
}
