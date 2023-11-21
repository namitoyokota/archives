import { Portal$v1 } from "@galileo/mobile_dynamic-injection-engine";
import React from "react";
import { capabilityId, InjectableComponentNames } from "../common";

interface ColorCircleProps$v1 {
  color: string;
}

/**
 * Versioned color circle that injects the real component from the core
 */
export function ColorCircle$v1({color = 'blue'}: ColorCircleProps$v1) {
  return (
    <Portal$v1 capabilityId={capabilityId}  componentName={InjectableComponentNames.colorComponent} componentData={color}></Portal$v1>
  );
}
