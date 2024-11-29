import { memo, useCallback, useContext, useMemo, useRef } from "react";
import type { DraftValueType } from "rc-select/lib/Select";
import { isEqual, omit } from "lodash";

import FormContext from "../FormContext";
import type { SelectComponentProps as AntdSelectComponentProps } from "widgets/Antd/Form/SelectWidget/component";
import SelectComponent from "widgets/Antd/Form/SelectWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, SelectWidgetConfig } from "../constants";
import type { DropdownOption } from "widgets/MultiSelectTreeWidget/widget";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

import React from "react";
import { simpleDiff } from "widgets/Antd/tools/tool";

type SelectComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdSelectComponentProps;

export type SelectFieldProps = BaseFieldComponentProps<SelectComponentProps>;

const COMPONENT_DEFAULT_VALUES: SelectComponentProps = {
  // omit defaultValue
  ...omit(SelectWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: SelectWidgetConfig.type,
};

const isValid = (
  schemaItem: SelectFieldProps["schemaItem"],
  value: unknown[],
) => !schemaItem.isRequired || Boolean(value.length);

function AntdSelectField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: SelectFieldProps) {
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const options = Array.isArray(schemaItem.options) ? schemaItem.options : [];
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [updateFilterText] = useUpdateInternalMetaState({
    propertyName: `${name}.searchText`,
  });

  const onSearchHandler = useCallback(
    (value: string) => {
      updateFilterText(value);

      if (schemaItem.onOptionSearch) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onOptionSearch",
          dynamicString: schemaItem.onOptionSearch,
          event: {
            type: EventType.ON_SEARCH,
          },
        });
      }
    },
    [name, schemaItem.onOptionSearch, updateFilterText],
  );

  const onChangeHandler = useCallback(
    (values: DraftValueType) => {
      callbackRef.current.updateFormData({
        [name]: values,
      });

      if (schemaItem.onValueChange) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onValueChange",
          dynamicString: schemaItem.onValueChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [name, schemaItem.onValueChange],
  );

  const dropdownWidth = wrapperRef.current?.clientWidth;

  console.log("JSONFormWidget 选择器", {
    schemaItem,
    commonProps,
  });

  const fieldComponent = useMemo(() => {
    return (
      <SelectComponent
        {...schemaItem}
        {...commonProps}
        handleSearch={onSearchHandler}
        handleValueChange={onChangeHandler}
        options={options}
      />
    );
  }, [
    schemaItem,
    dropdownWidth,
    onChangeHandler,
    options,
    fieldClassName,
    commonProps,
  ]);

  return fieldComponent;
}

const arePropsEqual = (
  prevProps: SelectFieldProps,
  nextProps: SelectFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    diffProps &&
      console.log("AntdSelectField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
      });
  }
  return isEqual(prevProps, nextProps);
};
const MemoizedSelectField: FieldComponent<SelectComponentProps> = memo(
  AntdSelectField,
  arePropsEqual,
);
MemoizedSelectField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;
MemoizedSelectField.isValidType = isValid;

export default MemoizedSelectField;
