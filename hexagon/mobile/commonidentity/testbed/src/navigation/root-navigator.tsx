import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppLoadingScreen } from '../screens/app-loading-screen.component';
import { LogInScreen } from '../screens/log-in-screen.component';
import { TestBedScreen } from '../screens/test-bed-screen.component';



const Stack = createNativeStackNavigator();
export const RootNavigator = () => {


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Loading" component={AppLoadingScreen} options={{headerShown: false}} />
        <Stack.Screen name="Secure" component={TestBedScreen} options={{headerShown: false}} />
        <Stack.Screen name="LogIn" component={LogInScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}
