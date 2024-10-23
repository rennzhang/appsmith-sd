import { useCallback, useContext, useMemo } from "react";
import FormContext from "../FormContext";
import type { TimePickerWidgetProps } from "widgets/Antd/Form/TimePickerWidget/component";
import TimePickerComponent from "widgets/Antd/Form/TimePickerWidget/component";
import type { BaseFieldComponentProps } from "../constants";
import { TimePickerWidgetConfig } from "../constants";
import type { FieldComponentBaseProps, FieldEventProps } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { omit } from "lodash";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

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
  const { executeAction, updateFormData } = useContext(FormContext);
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  const onTimeChange = useCallback(
    (value: any) => {
      updateFormData({
        [name]: value,
      });

      if (schemaItem.onTimeChange && executeAction) {
        executeAction({
          triggerPropertyName: "onTimeChange",
          dynamicString: schemaItem.onTimeChange,
          event: {
            type: EventType.ON_SELECT,
          },
        });
      }
    },
    [executeAction, name, schemaItem.onTimeChange, updateFormData],
  );
  return (
    <TimePickerComponent
      {...schemaItem}
      {...commonProps}
      onChange={onTimeChange}
    />
  );
}

AntdTimePickerField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default AntdTimePickerField;
