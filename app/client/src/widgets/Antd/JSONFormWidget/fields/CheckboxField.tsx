import React, { memo, useCallback, useContext, useMemo } from "react";
import { isEqual, omit } from "lodash";

import FormContext from "../FormContext";
import type { CheckboxComponentProps as AntdCheckboxComponentProps } from "widgets/Antd/Form/CheckboxWidget/component";
import CheckboxComponent from "widgets/Antd/Form/CheckboxWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, CheckboxWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import { simpleDiff } from "widgets/Antd/tools/tool";

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
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const onCheckChange = useCallback(
    (value: CheckboxValueType[]) => {
      callbackRef.current.updateFormData({
        [name]: value,
      });

      if (schemaItem.onValueChange) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onValueChange",
          dynamicString: schemaItem.onValueChange,
          event: {
            type: EventType.ON_CHECK_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [name, schemaItem.onValueChange],
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

const arePropsEqual = (
  prevProps: CheckboxFieldProps,
  nextProps: CheckboxFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    if (diffProps) {
      console.log("CheckboxField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
      });
    }
  }
  return isEqual(prevProps, nextProps);
};
const MemoizedCheckboxField: FieldComponent<CheckboxComponentProps> = memo(
  CheckboxField,
  arePropsEqual,
);
MemoizedCheckboxField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedCheckboxField;
