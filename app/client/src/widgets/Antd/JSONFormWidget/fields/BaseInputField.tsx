import React, { useCallback, useContext, useEffect, useMemo } from "react";
import type { IconName } from "@blueprintjs/core";

import FormContext from "../FormContext";
import useEvents from "./useBlurAndFocusEvents";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
  SchemaItem,
} from "../constants";
import {
  ActionUpdateDependency,
  FieldType,
  AntdInputWidgetConfig,
  AutoCompleteWidgetConfig,
} from "../constants";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import type { AntdInputWidgetProps } from "widgets/Antd/Form/InputWidget/types";
import { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
export type BaseInputComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdInputWidgetProps;

export type OnValueChangeOptions = {
  fieldOnChangeHandler: (...event: any[]) => void;
  isValueValid: boolean;
};

type BaseInputFieldProps<TSchemaItem extends SchemaItem = SchemaItem> =
  BaseFieldComponentProps<BaseInputComponentProps & TSchemaItem> & {
    leftIcon?: IconName | JSX.Element;
    transformValue: (
      newValue: string,
      oldValue: string,
    ) => { text: string; value?: number | string | null | undefined };
    isValid: (schemaItem: TSchemaItem, value?: string | null) => boolean;
  };

type IsValidOptions = {
  fieldType: FieldType;
};

type StyledInputWrapperProps = {
  multiline: boolean;
};

const COMPONENT_DEFAULT_VALUES = {
  ...AntdInputWidgetConfig.defaults,
  ...AutoCompleteWidgetConfig.defaults,
  inputType: InputTypes.TEXT_INPUT,
  isDisabled: false,
  isRequired: false,
  isSpellCheck: false,
  isVisible: true,
  labelTextSize: BASE_LABEL_TEXT_SIZE,
  labelText: "",
};

// REGEX origin https://github.com/manishsaraan/email-validator/blob/master/index.js
export const EMAIL_REGEX = new RegExp(
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
);

export const parseRegex = (regex?: string) => {
  try {
    if (regex && typeof regex === "string") {
      /*
       * break up the regexp pattern into 4 parts: given regex, regex prefix , regex pattern, regex flags
       * Example /test/i will be split into ["/test/gi", "/", "test", "gi"]
       */
      const regexParts = regex.match(/(\/?)(.+)\1([a-z]*)/i);

      if (!regexParts) {
        return new RegExp(regex);
      } else {
        /*
         * if we don't have a regex flags (gmisuy), convert provided string into regexp directly
         */
        if (
          regexParts[3] &&
          !/^(?!.*?(.).*?\1)[gmisuy]+$/.test(regexParts[3])
        ) {
          return RegExp(regex);
        } else {
          /*
           * if we have a regex flags, use it to form regexp
           */
          return new RegExp(regexParts[2], regexParts[3]);
        }
      }
    }
  } catch (e) {
    return null;
  }

  return null;
};

function isValidType(value: string, options?: IsValidOptions) {
  if (options?.fieldType === FieldType.AUTOCOMPLETE_INPUT && value) {
    return EMAIL_REGEX.test(value);
  }

  return false;
}

// 1. 懒加载组件导入
const AntdInputComponent = React.lazy(
  () => import("widgets/Antd/Form/InputWidget/component"),
);
const AntdAutoCompleteComponent = React.lazy(
  () => import("widgets/Antd/Form/AutoCompleteWidget/component"),
);

function BaseInputField<TSchemaItem extends SchemaItem>({
  fieldClassName,
  leftIcon,
  name,
  passedDefaultValue,
  schemaItem,
}: BaseInputFieldProps<TSchemaItem>) {
  const {
    executeAction,
    formControlSize,
    formIsDisabled,
    formIsRequird,
    formLabelAlign,
    formLayout,
    formRef,
    updateFormData,
  } = useContext(FormContext);
  // controlSize, isDisabled, isRequired, labelAlignment
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });
  useEffect(() => {
    console.log(`BaseInputField commonProps`, {
      commonProps,
      passedDefaultValue,
    });
  }, [commonProps, passedDefaultValue]);

  useEffect(() => {
    console.log(
      "BaseInputField useEffect",
      {
        formRef,
      },
      formRef?.current?.isFieldTouched(name),
    );
  }, [formRef]);

  const { onBlur: onBlurDynamicString, onFocus: onFocusDynamicString } =
    schemaItem;

  const { inputRef, onBlurHandler, onFocusHandler } = useEvents<
    HTMLInputElement | HTMLTextAreaElement
  >({
    onBlurDynamicString,
    onFocusDynamicString,
  });

  const inputType = schemaItem.inputType;

  const focusChangeHandler = useCallback(
    (isFocused: boolean) => {
      if (isFocused) {
        onFocusHandler();
      } else {
        onBlurHandler();
      }
    },
    [formRef, onBlurHandler, onFocusHandler],
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
      console.log("keyDownHandler", {
        isEnterKey,
        onEnterKeyPress,
        isValueValid,
      });

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
    [schemaItem.onEnterKeyPress, schemaItem.onSubmit],
  );

  const onTextChangeHandler = useCallback(
    (inputValue: string, triggerPropertyName = "onTextChange") => {
      updateFormData({
        [name]: inputValue,
      });
      const { onTextChanged } = schemaItem;
      if (onTextChanged && executeAction) {
        executeAction({
          triggerPropertyName,
          dynamicString: onTextChanged,
          event: {
            type: EventType.ON_TEXT_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [schemaItem.onTextChanged, executeAction],
  );

  console.log("JSONFormWidget BaseInputField", {
    inputType,
    schemaItem,
    commonProps,
    formIsRequird,
  });

  const fieldComponent = useMemo(() => {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        {schemaItem.fieldType === FieldType.AUTOCOMPLETE_INPUT ? (
          <AntdAutoCompleteComponent
            {...schemaItem}
            {...commonProps}
            inputRef={inputRef}
            onFocusChange={focusChangeHandler}
            onKeyDown={keyDownHandler}
            onValueChange={(value: string) => onTextChangeHandler(value)}
          />
        ) : (
          <AntdInputComponent
            {...schemaItem}
            {...commonProps}
            inputRef={inputRef}
            onFocusChange={focusChangeHandler}
            onKeyDown={keyDownHandler}
            onValueChange={(value: string) => onTextChangeHandler(value)}
          />
        )}
      </React.Suspense>
    );
  }, [
    inputRef,
    keyDownHandler,
    leftIcon,
    onTextChangeHandler,
    schemaItem,
    formIsRequird,
    formIsDisabled,
    formControlSize,
    formLayout,
    formLabelAlign,
    commonProps,
  ]);

  return fieldComponent;
}

BaseInputField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;
BaseInputField.isValidType = isValidType;

export default BaseInputField;
