import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';

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
        <Text>HXGN - TESTBED</Text>
      </View>
      <RootNavigator/>
    </>
  );
}
const styles = StyleSheet.create({
  testbedBar: {
    height: 30,
    textAlign: 'center',
    padding: 5,
    width: '100%',
    backgroundColor: '#666',
    color: '#fff',
  }
});
