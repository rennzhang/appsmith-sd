import React, { useCallback, useContext, useMemo } from "react";
import { omit } from "lodash";

import FormContext from "../FormContext";
import Field from "widgets/Antd/JSONFormWidget/component/Field";
import type { SwitchComponentProps as AntdSwitchComponentProps } from "widgets/Antd/Form/SwitchWidget/component";
import SwitchComponent from "widgets/Antd/Form/SwitchWidget/component";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, SwitchWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Colors } from "constants/Colors";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

type Merge<T, U> = Omit<T, keyof U> & U;

type SwitchComponentProps = Merge<
  FieldComponentBaseProps,
  Omit<AntdSwitchComponentProps, "controlSize" | "defaultValue">
>;

type SwitchFieldProps = BaseFieldComponentProps<SwitchComponentProps>;

const COMPONENT_DEFAULT_VALUES: SwitchComponentProps = {
  ...omit(SwitchWidgetConfig.defaults, ["defaultValue", "controlSize"]),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  type: SwitchWidgetConfig.type,
  controlSize: "default" as any,
};

function SwitchField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: SwitchFieldProps) {
  const { executeAction, updateFormData } = useContext(FormContext);

  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const onSwitchChange = useCallback(
    (value: boolean) => {
      updateFormData({
        [name]: value,
      });

      if (schemaItem.onSwitchChange && executeAction) {
        executeAction({
          triggerPropertyName: "onSwitchChange",
          dynamicString: schemaItem.onSwitchChange,
          event: {
            type: EventType.ON_SWITCH_CHANGE,
          },
          globalContext: {
            [name]: value,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, name, schemaItem.onSwitchChange, updateFormData],
  );

  const onSwitchClick = useCallback(
    (val: boolean, e: React.MouseEvent) => {
      if (schemaItem.onSwitchClick && executeAction) {
        executeAction({
          triggerPropertyName: "onSwitchClick",
          dynamicString: schemaItem.onSwitchClick,
          event: {
            type: EventType.ON_CLICK,
          },
          globalContext: {
            [name]: val,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, schemaItem.onSwitchClick],
  );

  const fieldComponent = useMemo(
    () => (
      <SwitchComponent
        {...schemaItem}
        {...commonProps}
        controlSize={commonProps.controlSize === "small" ? "small" : "default"}
        defaultValue={!!commonProps.defaultValue}
        handelClick={onSwitchClick}
        onChange={onSwitchChange}
      />
    ),
    [schemaItem, commonProps, onSwitchChange],
  );

  return fieldComponent;
}

SwitchField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default SwitchField;
