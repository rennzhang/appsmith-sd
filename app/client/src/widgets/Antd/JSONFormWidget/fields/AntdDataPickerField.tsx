import { memo, useCallback, useContext, useMemo } from "react";
import FormContext from "../FormContext";
import type { DatePickerWidgetProps } from "widgets/Antd/Form/DatePickerWidget/component";
import DatePickerComponent from "widgets/Antd/Form/DatePickerWidget/component";
import type {
  BaseFieldComponentProps,
  ComponentDefaultValuesFnProps,
  FieldComponent,
} from "../constants";
import { DatePickerWidgetConfig } from "../constants";
import type { FieldComponentBaseProps, FieldEventProps } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { isEqual, omit } from "lodash";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

import { DateFormatOptions } from "widgets/Antd/Form/DatePickerWidget/widget/data";
import dayjs from "dayjs";
import { ISO_DATE_FORMAT } from "constants/WidgetValidation";
import { dateFormatOptions } from "widgets/constants";
import React from "react";
import { simpleDiff } from "widgets/Antd/tools/tool";

type DatePickerComponentProps = DatePickerWidgetProps &
  FieldComponentBaseProps &
  FieldEventProps;

export type DatePickerFieldProps =
  BaseFieldComponentProps<DatePickerComponentProps>;

const COMPONENT_DEFAULT_VALUES: DatePickerComponentProps = {
  ...omit(DatePickerWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: DatePickerWidgetConfig.type,
};
const componentDefaultValues = ({
  bindingTemplate,
  isCustomField,
  skipDefaultValueProcessing,
  sourceData,
  sourceDataPath,
}: ComponentDefaultValuesFnProps<string>): DatePickerComponentProps => {
  let defaultValue;
  let dateFormat = COMPONENT_DEFAULT_VALUES.format;

  if (!isCustomField) {
    const targetFormat = dateFormatOptions.find(({ value: format }) => {
      return dayjs(sourceData, format, true).isValid();
    })?.value;

    if (targetFormat) {
      dateFormat = targetFormat;
    }

    if (sourceDataPath && !skipDefaultValueProcessing) {
      const { prefixTemplate, suffixTemplate } = bindingTemplate;
      const defaultValueString = `dayjs(${sourceDataPath}, "${dateFormat}")`;
      defaultValue = `${prefixTemplate}${defaultValueString}${suffixTemplate}`;
    }
  }

  return {
    ...COMPONENT_DEFAULT_VALUES,
    defaultValue: sourceData,
    format: dateFormat,
  };
};

export const isValidType = (value: string) => {
  const dateValidTypeResult = DateFormatOptions.some(({ value: format }) => {
    try {
      return dayjs(value, format, true).isValid();
    } catch (error) {
      return false;
    }
  });
  return dateValidTypeResult;
};
function AntdTimePickerField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: DatePickerFieldProps) {
  const { executeAction, updateFormData } = useContext(FormContext);
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  const onDateChange = useCallback(
    (value: any, dateString: string | string[]) => {
      callbackRef.current.updateFormData({
        [name]: dateString,
      });

      if (schemaItem.onDateSelected) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onDateSelected",
          dynamicString: schemaItem.onDateSelected,
          event: {
            type: EventType.ON_SELECT,
          },
        });
      }
    },
    [name, schemaItem.onDateSelected],
  );
  console.log("AntdTimePickerField", {
    schemaItem,
    commonProps,
    passedDefaultValue,
    name,
  });

  return (
    <DatePickerComponent
      {...schemaItem}
      {...commonProps}
      onChange={onDateChange}
    />
  );
}

const arePropsEqual = (
  prevProps: DatePickerFieldProps,
  nextProps: DatePickerFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    console.log("AntdDatePickerField memo diff", {
      p: prevProps,
      n: nextProps,
      diff: diffProps,
    });
  }
  return isEqual(prevProps, nextProps);
};
const MemoizedTimePickerField: FieldComponent<DatePickerComponentProps> = memo(
  AntdTimePickerField,
  arePropsEqual,
);
MemoizedTimePickerField.componentDefaultValues = componentDefaultValues;
MemoizedTimePickerField.isValidType = isValidType;

export default MemoizedTimePickerField;
