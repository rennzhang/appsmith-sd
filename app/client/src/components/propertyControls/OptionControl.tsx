import React from "react";
import type { ControlData, ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import type { DropdownOption } from "components/constants";
import { KeyValueComponent } from "./KeyValueComponent";
import { KeyValueComponentWithDrag } from "./KeyValueComponentWithDrag";

import { isDynamicValue } from "utils/DynamicBindingUtils";
import type { SegmentedControlOption } from "design-system";

class OptionControl extends BaseControl<
  ControlProps & { isDraggable: boolean }
> {
  render() {
    return this.props.isDraggable ? (
      <KeyValueComponentWithDrag
        pairs={this.props.propertyValue}
        updatePairs={this.updateOptions}
      />
    ) : (
      <KeyValueComponent
        pairs={this.props.propertyValue}
        updatePairs={this.updateOptions}
      />
    );
  }

  updateOptions = (
    options: SegmentedControlOption[],
    isUpdatedViaKeyboard = false,
  ) => {
    const updatePath =
      this.props.dataTreePath?.split(".").slice(1).join(".") || "options";
    this.updateProperty(updatePath, options, isUpdatedViaKeyboard);
  };

  static getControlType() {
    return "OPTION_INPUT";
  }

  static canDisplayValueInUI(config: ControlData, value: any): boolean {
    if (isDynamicValue(value)) return false;

    try {
      const pairs: DropdownOption[] = JSON.parse(value);
      for (const x of pairs) {
        const keys = Object.keys(x);
        if (!keys.includes("label") || !keys.includes("value")) {
          return false;
        }
      }
    } catch {
      return false;
    }

    return true;
  }
}

export default OptionControl;
