import React, { memo, useCallback, useContext, useMemo } from "react";
import { isEqual, omit } from "lodash";

import FormContext from "../FormContext";
import Field from "widgets/Antd/JSONFormWidget/component/Field";
import type { SwitchComponentProps as AntdSwitchComponentProps } from "widgets/Antd/Form/SwitchWidget/component";
import SwitchComponent from "widgets/Antd/Form/SwitchWidget/component";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, SwitchWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Colors } from "constants/Colors";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import { simpleDiff } from "widgets/Antd/tools/tool";

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
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const onSwitchChange = useCallback(
    (value: boolean) => {
      callbackRef.current.updateFormData({
        [name]: value,
      });

      if (schemaItem.onSwitchChange) {
        callbackRef.current.executeAction({
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
    [name, schemaItem.onSwitchChange],
  );

  const onSwitchClick = useCallback(
    (val: boolean, e: React.MouseEvent) => {
      if (schemaItem.onSwitchClick) {
        callbackRef.current.executeAction({
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
    [schemaItem.onSwitchClick],
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
    [schemaItem, commonProps],
  );

  return fieldComponent;
}

const arePropsEqual = (
  prevProps: SwitchFieldProps,
  nextProps: SwitchFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    diffProps &&
      console.log("SwitchField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
        isSame: isEqual(prevProps, nextProps),
      });
  }
  return (
    prevProps.name === nextProps.name &&
    prevProps.passedDefaultValue === nextProps.passedDefaultValue &&
    JSON.stringify(prevProps.schemaItem) ===
      JSON.stringify(nextProps.schemaItem)
  );
};
const MemoizedSwitchField: FieldComponent<SwitchComponentProps> = memo(
  SwitchField,
  arePropsEqual,
);
MemoizedSwitchField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedSwitchField;
