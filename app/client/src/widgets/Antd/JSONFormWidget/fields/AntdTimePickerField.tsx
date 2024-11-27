import { memo, useCallback, useContext, useMemo } from "react";
import FormContext from "../FormContext";
import type { TimePickerWidgetProps } from "widgets/Antd/Form/TimePickerWidget/component";
import TimePickerComponent from "widgets/Antd/Form/TimePickerWidget/component";
import type { BaseFieldComponentProps, FieldComponent } from "../constants";
import { TimePickerWidgetConfig } from "../constants";
import type { FieldComponentBaseProps, FieldEventProps } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { omit } from "lodash";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import React from "react";
import { simpleDiff } from "widgets/Antd/tools/tool";

type TimePickerComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  TimePickerWidgetProps;

export type TimePickerFieldProps =
  BaseFieldComponentProps<TimePickerComponentProps>;

const COMPONENT_DEFAULT_VALUES = {
  ...omit(TimePickerWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: TimePickerWidgetConfig.type,
};

function AntdTimePickerField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: TimePickerFieldProps) {
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  const onTimeChange = useCallback(
    (value: any, valueString: any) => {
      callbackRef.current.updateFormData({
        [name]: valueString,
      });

      if (schemaItem.onTimeChange) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onTimeChange",
          dynamicString: schemaItem.onTimeChange,
          event: {
            type: EventType.ON_SELECT,
          },
        });
      }
    },
    [name, schemaItem.onTimeChange],
  );
  return (
    <TimePickerComponent
      {...schemaItem}
      {...commonProps}
      onChange={onTimeChange}
    />
  );
}

const arePropsEqual = (
  prevProps: TimePickerFieldProps,
  nextProps: TimePickerFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    if (diffProps) {
      console.log("AntdTimePickerField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
      });
    }
  }
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};
const MemoizedTimePickerField: FieldComponent<TimePickerComponentProps> = memo(
  AntdTimePickerField,
  arePropsEqual,
);
MemoizedTimePickerField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedTimePickerField;
