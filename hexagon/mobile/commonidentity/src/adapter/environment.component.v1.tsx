import { Portal$v1 } from "@galileo/mobile_dynamic-injection-engine";
import React from "react";
import { capabilityId, InjectableComponentNames } from "../common";

/**
 * Versioned color circle that injects the real component from the core
 */
export function Environment$v1() {
  return (
    <Portal$v1 capabilityId={capabilityId}  componentName={InjectableComponentNames.environmentComponent}></Portal$v1>
  );
}
