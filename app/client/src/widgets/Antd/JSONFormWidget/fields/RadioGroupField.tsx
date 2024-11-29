import React, { memo, useCallback, useContext, useMemo } from "react";
import { Alignment } from "@blueprintjs/core";
import { isEqual, isNumber, omit } from "lodash";

import FormContext from "../FormContext";
import type { RadioGroupComponentProps as AntdRadioGroupComponentProps } from "widgets/Antd/Form/RadioWidget/component";
import RadioGroupComponent from "widgets/Antd/Form/RadioWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, RadioWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Colors } from "constants/Colors";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import type { RadioOption } from "widgets/RadioGroupWidget/constants";
import { simpleDiff } from "widgets/Antd/tools/tool";

type RadioGroupComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdRadioGroupComponentProps;

export type RadioGroupFieldProps =
  BaseFieldComponentProps<RadioGroupComponentProps>;

const COMPONENT_DEFAULT_VALUES: RadioGroupComponentProps = {
  ...omit(RadioWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  type: RadioWidgetConfig.type,
};

function RadioGroupField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: RadioGroupFieldProps) {
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const [updateSelectedValue] = useUpdateInternalMetaState({
    propertyName: `${name}.selectedValue`,
  });

  const isOptionsValueNumeric = isNumber(schemaItem?.options?.[0]?.value);

  const onSelectionChange = useCallback(
    (selectedValue: string) => {
      const value = selectedValue;
      console.log("onSelectionChange", value);

      callbackRef.current.updateFormData({
        [name]: value,
      });

      updateSelectedValue(value);

      if (schemaItem.onSelectionChange) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onSelectionChange",
          dynamicString: schemaItem.onSelectionChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [
      name,
      schemaItem.onSelectionChange,
      isOptionsValueNumeric,
      updateSelectedValue,
    ],
  );

  const fieldComponent = useMemo(() => {
    return (
      <RadioGroupComponent
        {...schemaItem}
        {...commonProps}
        onChange={onSelectionChange}
      />
    );
  }, [schemaItem, commonProps, onSelectionChange, fieldClassName]);

  return fieldComponent;
}

const arePropsEqual = (
  prevProps: RadioGroupFieldProps,
  nextProps: RadioGroupFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    if (diffProps) {
      console.log("RadioGroupField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
      });
    }
  }
  return isEqual(prevProps, nextProps);
};

const MemoizedRadioGroupField: FieldComponent<RadioGroupComponentProps> = memo(
  RadioGroupField,
  arePropsEqual,
);
MemoizedRadioGroupField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedRadioGroupField;
