import React, { useEffect } from 'react';
import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { LoginScreen } from './login.component';
import { EnvironmentService } from '../services/environment.service';
import { first } from 'rxjs/operators';
import { RootView, TitleText, TextInput, ContinueButton, ContinueButtonText, SubTitleText } from '../../styles/environment.component.style'
import { ImageBackground } from 'react-native';

export const Environment = () => {
  /** Base URL */
  const [baseUrl, onChangeBaseUrl] = React.useState('');

  /** True if the environment is set */
  const [environmentSet, onChangeEnvironmentSet] = React.useState(false);

   /** Ref to environment srv */
  const environmentSrv = ServiceManager$v1.get(EnvironmentService);

  /**
   * Continue button clicked
   */
  const onContinue = () => {
    if (baseUrl) {
      environmentSrv.setBaseURL(baseUrl);
      onChangeEnvironmentSet(true);
    }
  };

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
      {!environmentSet ? (
        // Show environment selection
        <ImageBackground
        source={ require("../../assets/connect_EnviromentPage_gradient.png") }
        resizeMode="cover"
        style={ {flex: 1} }>
          <RootView>
            <TitleText>Welcome to Live Share</TitleText>
            <SubTitleText>Enter URL address for Connect environment here</SubTitleText>
            <TextInput
              placeholder="Example: hxgnconnect.com"
              onChangeText={onChangeBaseUrl}
              value={baseUrl}
            />
            <ContinueButton
              disabled={!baseUrl}
              onPress={onContinue}
              accessibilityLabel="Continue to login page">
              <ContinueButtonText>Go</ContinueButtonText>
            </ContinueButton>
          </RootView>
          </ImageBackground>
      ) : (
        // Environment has been set but still need to log in
        <LoginScreen></LoginScreen>
      )}
    </>
  );
};
