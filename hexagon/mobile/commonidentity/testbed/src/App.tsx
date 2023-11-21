import * as React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

import { initCore, getAdapter$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { getImportMapping } from './importer';
import { RootNavigator } from './navigation/root-navigator';


export default function App() {

  React.useEffect(() => {
    initCore(getImportMapping());

    getAdapter$v1().loadCapabilityCoreAsync('@hxgn/commonidentity');
  }, [])

  return (
    <>
      <View style={styles.testbedBar}>
        <Text>HXGN - TEST BED</Text>
      </View>
      {

      }
      <RootNavigator/>

      {/* <ScrollView>
        <ColorCircle$v1 color="yellow"></ColorCircle$v1>
        <Portal$v1 capabilityId="@hxgn/commonidentity" componentName="@hxgn/commonidentity/color/v1" componentData="blue"></Portal$v1>
        <Portal$v1 capabilityId="@hxgn/commonidentity" componentName="@hxgn/commonidentity/color/v1" componentData="green"></Portal$v1>
        <Portal$v1 capabilityId="@hxgn/commonidentity" componentName="@hxgn/commonidentity/color/v1" componentData="pink"></Portal$v1>
        <Portal$v1 capabilityId="@hxgn/commonidentity" componentName="@hxgn/commonidentity/color/v1" componentData="#666"></Portal$v1>
      </ScrollView> */}
    </>
  );
}
const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  container: {
    flex: 4,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center' // if you want to fill rows left to right
  },
  userBox: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20
  },
  portal: {
    padding: 20
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
  },
  testbedBar: {
    height: 30,
    textAlign: 'center',
    padding: 5,
    width: '100%',
    backgroundColor: '#666',
    color: '#fff',
  }
});
