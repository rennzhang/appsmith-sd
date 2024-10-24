import { useCallback, useContext, useMemo } from "react";
import FormContext from "../FormContext";
import type { DatePickerWidgetProps } from "widgets/Antd/Form/DatePickerWidget/component";
import DatePickerComponent from "widgets/Antd/Form/DatePickerWidget/component";
import type {
  BaseFieldComponentProps,
  ComponentDefaultValuesFnProps,
} from "../constants";
import { DatePickerWidgetConfig } from "../constants";
import type { FieldComponentBaseProps, FieldEventProps } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { omit } from "lodash";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

import { DateFormatOptions } from "widgets/Antd/Form/DatePickerWidget/widget/data";
import dayjs from "dayjs";
import { ISO_DATE_FORMAT } from "constants/WidgetValidation";
import { dateFormatOptions } from "widgets/constants";

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
  console.log("日期isValidType", value);

  return DateFormatOptions.some(({ value: format }) =>
    dayjs(value, format, true).isValid(),
  );
};
function AntdTimePickerField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: DatePickerFieldProps) {
  const { executeAction, updateFormData } = useContext(FormContext);
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  const onDateChange = useCallback(
    (value: any) => {
      updateFormData({
        [name]: value,
      });

      if (schemaItem.onDateSelected && executeAction) {
        executeAction({
          triggerPropertyName: "onDateSelected",
          dynamicString: schemaItem.onDateSelected,
          event: {
            type: EventType.ON_SELECT,
          },
        });
      }
    },
    [executeAction, name, schemaItem.onDateSelected, updateFormData],
  );
  return (
    <DatePickerComponent
      {...schemaItem}
      {...commonProps}
      onChange={onDateChange}
    />
  );
}

AntdTimePickerField.componentDefaultValues = componentDefaultValues;
AntdTimePickerField.isValidType = isValidType;
export default AntdTimePickerField;
