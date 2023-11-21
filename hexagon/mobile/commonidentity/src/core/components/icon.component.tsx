import { ServiceManager$v1 } from "@galileo/mobile_dynamic-injection-engine";
import React, { useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import { first } from "rxjs/operators";
import { EnvironmentService } from "../services/environment.service";

// Icon component
export const UserIcon = (iconURI: any = '') => {
  /** Base URL */
  const [baseUrl, onChangeBaseUrl] = React.useState('');

  /** Ref to environment srv */
  const environmentSrv = ServiceManager$v1.get(EnvironmentService);

  const styles = StyleSheet.create({
    image: {
      height: 60,
      width: 60,
      borderRadius: 60/2,
    }
  });

  useEffect(() => {
    if (!baseUrl) {
      environmentSrv.baseURL$.pipe(
        first()
      ).subscribe((url: string) => {
        onChangeBaseUrl(url);
      })
    }
  });

  return (
    <>
      {!!iconURI && <Image style={styles.image} source={{ uri: baseUrl + (iconURI as any).iconURI }} resizeMode="cover"></Image>}
    </>

  );

}
