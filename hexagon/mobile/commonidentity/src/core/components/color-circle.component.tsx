import React from "react";
import { StyleSheet, View } from "react-native";

export interface ColorCircleProps {
  color: string;
}

export const ColorCircle = ({color = 'blue'}: ColorCircleProps) => {

  const styles = StyleSheet.create({
    host: {
      backgroundColor: color,
      height: 50,
      width: 50,
      borderRadius: 50/2,
    }
  });

  return (
    <View style={styles.host}></View>
  );
}
