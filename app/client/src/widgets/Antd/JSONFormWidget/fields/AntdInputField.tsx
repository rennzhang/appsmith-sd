import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import {
  FieldType,
  AntdInputWidgetConfig,
  AutoCompleteWidgetConfig,
  ActionUpdateDependency,
} from "../constants";
import { debounce, isEqual, isNil, omit } from "lodash";
import { isEmpty } from "../helper";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
import FormContext from "../FormContext";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
export type BaseInputComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdInputWidgetProps;
type InputComponentProps = BaseInputComponentProps & {
  iconName?: string;
  iconAlign?: string;
  type: string;
};
import useEvents from "./useBlurAndFocusEvents";
import { diff } from "deep-diff";
import type { AntdInputWidgetProps } from "widgets/Antd/Form/InputWidget/types";

export const EMAIL_REGEX = new RegExp(
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
);

export const parseRegex = (regex?: string) => {
  try {
    if (regex && typeof regex === "string") {
      const regexParts = regex.match(/(\/?)(.+)\1([a-z]*)/i);

      if (!regexParts) {
        return new RegExp(regex);
      } else {
        if (
          regexParts[3] &&
          !/^(?!.*?(.).*?\1)[gmisuy]+$/.test(regexParts[3])
        ) {
          return RegExp(regex);
        } else {
          return new RegExp(regexParts[2], regexParts[3]);
        }
      }
    }
  } catch (e) {
    return null;
  }

  return null;
};
export type InputFieldProps = BaseFieldComponentProps<InputComponentProps>;

type IsValidOptions = {
  fieldType: FieldType;
};

export const COMPONENT_DEFAULT_VALUES = {
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
const AntdInputComponent = React.lazy(
  () => import("widgets/Antd/Form/InputWidget/component"),
);

const AntdAutoCompleteComponent = React.lazy(
  () => import("widgets/Antd/Form/AutoCompleteWidget/component"),
);
function InputField({
  fieldClassName,
  name,
  passedDefaultValue,
  propertyPath,
  schemaItem,
}: InputFieldProps) {
  const { executeAction, formRef, updateFormData } = useContext(FormContext);

  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  const { onBlur: onBlurDynamicString, onFocus: onFocusDynamicString } =
    schemaItem;

  const { inputRef, onBlurHandler, onFocusHandler } = useEvents<
    HTMLInputElement | HTMLTextAreaElement
  >({
    onBlurDynamicString,
    onFocusDynamicString,
  });
  const focusChangeHandler = useCallback(
    (isFocused: boolean) => {
      if (isFocused) {
        onFocusHandler();
      } else {
        onBlurHandler();
      }
    },
    [onBlurHandler, onFocusHandler],
  );

  const keyDownHandler = useCallback(
    (
      e:
        | React.KeyboardEvent<HTMLTextAreaElement>
        | React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const isValueValid = formRef?.current?.getFieldError(name)?.length === 0;
      const { onEnterKeyPress, onSubmit } = schemaItem;
      const isEnterKey = e.key === "Enter";

      if (isEnterKey && onSubmit && isValueValid) {
        executeAction({
          triggerPropertyName: "onSubmit",
          dynamicString: onSubmit,
          event: {
            type: EventType.ON_ENTER_KEY_PRESS,
            callback: () => onTextChangeHandler("", "onSubmit"),
          },
        });
      }
    },
    [schemaItem.onSubmit, executeAction, name, formRef],
  );

  // 使用防抖包装 onTextChangeHandler
  const debouncedTextChangeHandler = useCallback(
    debounce((inputValue: string) => {
      updateFormData({
        [name]: inputValue,
      });
      const { onTextChanged } = schemaItem;
      if (onTextChanged && executeAction) {
        executeAction({
          triggerPropertyName: "onTextChange",
          dynamicString: onTextChanged,
          event: {
            type: EventType.ON_TEXT_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    }, 120),
    [name, schemaItem.onTextChanged],
  );
  // 包装更新函数
  const onTextChangeHandler = useCallback(
    (inputValue: string) => {
      debouncedTextChangeHandler(inputValue);
    },
    [debouncedTextChangeHandler],
  );
  const fieldComponent = useMemo(
    () => (
      <React.Suspense fallback={<div>Loading...</div>}>
        {schemaItem.fieldType === FieldType.AUTOCOMPLETE_INPUT ? (
          <AntdAutoCompleteComponent
            {...schemaItem}
            {...commonProps}
            inputRef={inputRef}
            onFocusChange={focusChangeHandler}
            onKeyDown={keyDownHandler}
            onValueChange={onTextChangeHandler}
          />
        ) : (
          <AntdInputComponent
            {...schemaItem}
            {...commonProps}
            inputRef={inputRef}
            onFocusChange={focusChangeHandler}
            onKeyDown={keyDownHandler}
            onValueChange={onTextChangeHandler}
          />
        )}
      </React.Suspense>
    ),
    [
      schemaItem,
      commonProps,
      inputRef,
      focusChangeHandler,
      keyDownHandler,
      onTextChangeHandler,
    ],
  );

  return fieldComponent;
}

const arePropsEqual = (
  prevProps: InputFieldProps,
  nextProps: InputFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = diff(prevProps, nextProps);
    diffProps &&
      console.log("InputField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
        isSame: isEqual(prevProps, nextProps),
      });
  }
  return isEqual(prevProps, nextProps);
};
const MemoizedInputField: FieldComponent<InputFieldProps> = memo(
  InputField,
  arePropsEqual,
);
MemoizedInputField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;
MemoizedInputField.isValidType = isValidType;

export default MemoizedInputField;
