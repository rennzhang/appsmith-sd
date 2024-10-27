import React, { useCallback, useEffect } from "react";

import type { BaseInputComponentProps } from "./BaseInputField";
import BaseInputField, { EMAIL_REGEX, parseRegex } from "./BaseInputField";
import type { BaseFieldComponentProps } from "../constants";
import {
  ComponentDefaultMap,
  FieldType,
  AntdInputWidgetConfig,
  AutoCompleteWidgetConfig,
} from "../constants";
import { isNil, omit } from "lodash";
import { isEmpty } from "../helper";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
type InputComponentProps = BaseInputComponentProps & {
  iconName?: string;
  iconAlign?: string;
  type: string;
};

export type InputFieldProps = BaseFieldComponentProps<InputComponentProps>;

type IsValidOptions = {
  fieldType: FieldType;
};

const COMPONENT_DEFAULT_VALUES = {
  ...omit(AntdInputWidgetConfig.defaults, "defaultValue"),
  ...omit(AutoCompleteWidgetConfig.defaults, "defaultValue"),
  inputType: InputTypes.TEXT_INPUT,
  iconAlign: "left",
  isDisabled: false,
  isRequired: false,
  isSpellCheck: false,
  isVisible: true,
  labelText: "",
  type: AntdInputWidgetConfig.type,
};

export const isValid = (
  schemaItem: InputFieldProps["schemaItem"],
  inputValue?: string | null,
) => {
  let hasValidValue, value;
  switch (schemaItem.fieldType) {
    case FieldType.NUMBER_INPUT:
      try {
        value = Number(inputValue);
        hasValidValue = !isEmpty(inputValue) && Number.isFinite(value);
        break;
      } catch (e) {
        return false;
      }
    default:
      value = inputValue;
      hasValidValue = !isEmpty(inputValue);
      break;
  }

  if (schemaItem.isRequired && !hasValidValue) {
    return false;
  }

  if (isEmpty(inputValue)) {
    return true;
  }

  if (typeof schemaItem.validation === "boolean" && !schemaItem.validation) {
    return false;
  }

  const parsedRegex = parseRegex(schemaItem.regex);

  switch (schemaItem.fieldType) {
    case FieldType.AUTOCOMPLETE_INPUT:
      if (!EMAIL_REGEX.test(inputValue)) {
        /* email should conform to generic email regex */
        return false;
      } else if (parsedRegex) {
        /* email should conform to user specified regex */
        return parsedRegex.test(inputValue);
      } else {
        return true;
      }
    case FieldType.NUMBER_INPUT:
      if (typeof value !== "number") return false;

      if (
        !isNil(schemaItem.maxNum) &&
        Number.isFinite(schemaItem.maxNum) &&
        schemaItem.maxNum < value
      ) {
        return false;
      } else if (
        !isNil(schemaItem.minNum) &&
        Number.isFinite(schemaItem.minNum) &&
        schemaItem.minNum > value
      ) {
        return false;
      } else if (parsedRegex) {
        return parsedRegex.test(inputValue);
      } else {
        return hasValidValue;
      }
    default:
      if (parsedRegex) {
        return parsedRegex.test(inputValue);
      } else {
        return hasValidValue;
      }
  }
};

function isValidType(value: string, options?: IsValidOptions) {
  if (options?.fieldType === FieldType.AUTOCOMPLETE_INPUT && value) {
    return EMAIL_REGEX.test(value);
  }

  return false;
}

function InputField({
  fieldClassName,
  formIsRequird,
  name,
  passedDefaultValue,
  propertyPath,
  schemaItem,
}: InputFieldProps) {
  const transformValue = useCallback(
    (inputValue: string) => {
      let value;
      switch (schemaItem.fieldType) {
        case FieldType.NUMBER_INPUT:
          try {
            if (isNil(inputValue) || inputValue === "") {
              value = null;
            } else {
              value = Number(inputValue);

              if (isNaN(value)) {
                value = null;
              }
            }
            break;
          } catch (e) {
            value = inputValue;
          }
          break;
        default:
          value = inputValue;
          break;
      }

      return {
        text: inputValue,
        value,
      };
    },
    [schemaItem.fieldType],
  );

  return (
    <BaseInputField
      fieldClassName={fieldClassName}
      formIsRequird={formIsRequird}
      isValid={isValid}
      name={name}
      passedDefaultValue={passedDefaultValue}
      propertyPath={propertyPath}
      schemaItem={schemaItem}
      transformValue={transformValue}
    />
  );
}

InputField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;
InputField.isValidType = isValidType;

export default InputField;
