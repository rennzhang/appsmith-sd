import React, { useCallback, useContext, useMemo } from "react";
import { omit } from "lodash";

import FormContext from "../FormContext";
import type { CheckboxComponentProps as AntdCheckboxComponentProps } from "widgets/Antd/Form/CheckboxWidget/component";
import CheckboxComponent from "widgets/Antd/Form/CheckboxWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, CheckboxWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import type { CheckboxValueType } from "antd/es/checkbox/Group";

type CheckboxComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdCheckboxComponentProps;

type CheckboxFieldProps = BaseFieldComponentProps<CheckboxComponentProps>;

const COMPONENT_DEFAULT_VALUES: CheckboxComponentProps = {
  ...omit(CheckboxWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: CheckboxWidgetConfig.type,
  // defaultValue: [],
};

function CheckboxField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: CheckboxFieldProps) {
  const { executeAction, updateFormData } = useContext(FormContext);

  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const onCheckChange = useCallback(
    (value: CheckboxValueType[]) => {
      updateFormData({
        [name]: value,
      });

      if (schemaItem.onValueChange && executeAction) {
        executeAction({
          triggerPropertyName: "onValueChange",
          dynamicString: schemaItem.onValueChange,
          event: {
            type: EventType.ON_CHECK_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, name, schemaItem.onValueChange, updateFormData],
  );

  const fieldComponent = useMemo(() => {
    return (
      <CheckboxComponent
        {...schemaItem}
        {...commonProps}
        onChange={onCheckChange}
      />
    );
  }, [schemaItem, commonProps, onCheckChange]);

  return fieldComponent;
}

CheckboxField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default CheckboxField;
