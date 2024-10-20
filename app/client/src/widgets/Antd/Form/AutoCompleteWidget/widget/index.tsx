import React from "react";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import type { WidgetType } from "constants/WidgetConstants";
import type { InputComponentProps } from "../component";
import InputComponent from "../component";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import {
  createMessage,
  FIELD_REQUIRED_ERROR,
  INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
  INPUT_DEFAULT_TEXT_MAX_NUM_ERROR,
  INPUT_DEFAULT_TEXT_MIN_NUM_ERROR,
  INPUT_TEXT_MAX_CHAR_ERROR,
} from "@appsmith/constants/messages";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import { GRID_DENSITY_MIGRATION_V1, ICON_NAMES } from "widgets/constants";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import BaseInputWidget from "widgets/BaseInputWidget";
import { get, isNil, isNumber, merge, toString } from "lodash";
import derivedProperties from "./parsedDerivedProperties";
import type { BaseInputWidgetProps } from "widgets/BaseInputWidget/widget";
import { mergeWidgetConfig } from "utils/helpers";
import { NumberInputStepButtonPosition } from "widgets/BaseInputWidget/constants";
import { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { getParsedText, isInputTypeEmailOrPassword } from "./Utilities";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import { checkInputTypeTextByProps } from "widgets/BaseInputWidget/utils";
import { DynamicHeight } from "utils/WidgetFeatures";
import type { AutocompletionDefinitions } from "widgets/constants";
import { EvaluationSubstitutionType } from "entities/DataTree/types";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";
import { InputControlProperty } from "../../InputWidget/widget/childPanels/CompConfig";
import type { AntdInputWidgetProps } from "../../InputWidget/types";
import AntdInputWidget from "../../InputWidget/widget";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";

export function defaultValueValidation(
  value: any,
  props: AntdInputWidgetProps,
  _?: any,
): ValidationResponse {
  const STRING_ERROR_MESSAGE = {
    name: "TypeError",
    message: "This value must be string",
  };
  const NUMBER_ERROR_MESSAGE = {
    name: "TypeError",
    message: "This value must be number",
  };
  const EMPTY_ERROR_MESSAGE = { name: "", message: "" };
  if (_.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: [STRING_ERROR_MESSAGE],
    };
  }

  const { inputType } = props;

  if (_.isBoolean(value) || _.isNil(value) || _.isUndefined(value)) {
    return {
      isValid: false,
      parsed: value,
      messages: [STRING_ERROR_MESSAGE],
    };
  }

  let parsed;
  switch (inputType) {
    case "NUMBER":
      parsed = Number(value);

      let isValid, messages;

      if (_.isString(value) && value.trim() === "") {
        /*
         *  When value is emtpy string
         */
        isValid = true;
        messages = [EMPTY_ERROR_MESSAGE];
        parsed = null;
      } else if (!Number.isFinite(parsed)) {
        /*
         *  When parsed value is not a finite numer
         */
        isValid = false;
        messages = [NUMBER_ERROR_MESSAGE];
        parsed = null;
      } else {
        /*
         *  When parsed value is a Number
         */
        isValid = true;
        messages = [EMPTY_ERROR_MESSAGE];
      }

      return {
        isValid,
        parsed,
        messages,
      };
    case "TEXT":
    case "MULTI_LINE_TEXT":
    case "PASSWORD":
    case "EMAIL":
      parsed = value;
      if (!_.isString(parsed)) {
        try {
          parsed = _.toString(parsed);
        } catch (e) {
          return {
            isValid: false,
            parsed: "",
            messages: [STRING_ERROR_MESSAGE],
          };
        }
      }
      return {
        isValid: _.isString(parsed),
        parsed: parsed,
        messages: [EMPTY_ERROR_MESSAGE],
      };
    default:
      return {
        isValid: false,
        parsed: "",
        messages: [STRING_ERROR_MESSAGE],
      };
  }
}

export function minValueValidation(min: any, props: InputWidgetProps, _?: any) {
  const max = props.maxNum;
  const value = min;
  min = Number(min);

  if (_?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  } else if (!Number.isFinite(min)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "TypeError",
          message: "This value must be number",
        },
      ],
    };
  } else if (max !== undefined && min >= max) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "RangeError",
          message: "This value must be lesser than max value",
        },
      ],
    };
  } else {
    return {
      isValid: true,
      parsed: Number(min),
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  }
}

export function maxValueValidation(max: any, props: InputWidgetProps, _?: any) {
  const min = props.minNum;
  const value = max;
  max = Number(max);

  if (_?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  } else if (!Number.isFinite(max)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "TypeError",
          message: "This value must be number",
        },
      ],
    };
  } else if (min !== undefined && max <= min) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "RangeError",
          message: "This value must be greater than min value",
        },
      ],
    };
  } else {
    return {
      isValid: true,
      parsed: Number(max),
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  }
}

function InputTypeUpdateHook(
  props: WidgetProps,
  propertyName: string,
  propertyValue: unknown,
) {
  const updates = [
    {
      propertyPath: propertyName,
      propertyValue: propertyValue,
    },
  ];

  if (propertyValue === InputTypes.MULTI_LINE_TEXT) {
    if (props.dynamicHeight === DynamicHeight.FIXED) {
      updates.push({
        propertyPath: "dynamicHeight",
        propertyValue: DynamicHeight.AUTO_HEIGHT,
      });
    }
  }

  //if input type is email or password default the autofill state to be true
  // the user needs to explicity set autofill to fault disable autofill
  updates.push({
    propertyPath: "shouldAllowAutofill",
    propertyValue: isInputTypeEmailOrPassword(propertyValue as any),
  });

  return updates;
}

class AutoCompleteWidget extends AntdInputWidget<
  AntdInputWidgetProps,
  WidgetState
> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    const definitions: AutocompletionDefinitions = {
      "!doc":
        "An input text field is used to capture a users textual input such as their names, numbers, emails etc. Inputs are used in forms and can have custom validations.",
      "!url": "https://docs.appsmith.com/widget-reference/input",
      text: {
        "!type": "string",
        "!doc": "The text value of the input",
        "!url": "https://docs.appsmith.com/widget-reference/input",
      },
      isValid: "bool",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      isDisabled: "bool",
    };

    return definitions;
  }
  static getPropertyPaneContentConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "数据",
          children: [
            {
              helpText: "输入框类型",
              propertyName: "inputType",
              label: "输入框类型",
              controlType: "DROP_DOWN",
              options: [
                {
                  label: "单行输入框",
                  value: "TEXT_INPUT",
                },
                {
                  label: "多行输入框",
                  value: "MULTI_LINE_TEXT",
                },
                {
                  label: "邮箱输入框",
                  value: "EMAIL",
                },
              ],
              defaultValue: "TEXT_INPUT",
              isBindProperty: false,
              isTriggerProperty: false,
              updateHook: InputTypeUpdateHook,
              dependencies: ["dynamicHeight"],
            },
            {
              createButtonText: "添加邮箱后缀",
              hideSetting: true,
              helpText: "自动完成邮件后缀",
              propertyName: "emailOptions",
              label: "邮箱后缀",
              controlType: "MENU_ITEMS",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              dependencies: ["inputType"],
              hidden: (props: AntdInputWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;
                console.log("emailOptionspropsData", propsData);

                return propsData.inputType !== InputTypes.EMAIL;
              },
            },
            {
              createButtonText: "添加选项",
              hideSetting: true,
              helpText: "自动完成选项",
              propertyName: "options",
              label: "下拉选项配置",
              controlType: "INPUT_TEXT",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              dependencies: ["inputType"],
              hidden: (props: AntdInputWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;
                return propsData.inputType == InputTypes.EMAIL;
              },
            },
          ],
        },
        {
          sectionName: "标签",
          children: [],
        },
        {
          sectionName: "校验",
          children: [],
        },
      ],
      // InputControlProperty,
      // 排除 sectionName: "数字输入框属性",
      InputControlProperty.filter(
        (item) => item.sectionName !== "数字输入框属性",
      ),
    );
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig([], DEFAULT_STYLE_PANEL_CONFIG);
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return merge(super.getDerivedPropertiesMap(), {
      isValid: `{{(() => {${derivedProperties.isValid}})()}}`,
      value: "{{this.props.inputText}}",
    });
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return merge(super.getMetaPropertiesMap(), {
      inputText: "",
      text: "",
      value: "",
    });
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      inputText: "defaultValue",
      text: "defaultValue",
      value: "text",
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      colorPrimary: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  handleFocusChange = (focusState: boolean) => {
    if (focusState) {
      this.props.updateWidgetMetaProperty("isFocused", focusState, {
        triggerPropertyName: "onFocus",
        dynamicString: this.props.onFocus,
        event: {
          type: EventType.ON_FOCUS,
        },
      });
    }
    if (!focusState) {
      this.props.updateWidgetMetaProperty("isFocused", focusState, {
        triggerPropertyName: "onBlur",
        dynamicString: this.props.onBlur,
        event: {
          type: EventType.ON_BLUR,
        },
      });
    }
    this.props.updateWidgetMetaProperty("dragDisabled", focusState);
  };

  handleKeyDown = (
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const { isValid, onSubmit } = this.props;
    const isEnterKey = e.key === "Enter" || e.keyCode === 13;

    if (this.props.inputType === InputTypes.MULTI_LINE_TEXT) {
      if (
        isEnterKey &&
        (e.metaKey || e.ctrlKey) &&
        typeof onSubmit === "string" &&
        onSubmit
      ) {
        this.props.updateWidgetMetaProperty("isDirty", this.props.isDirty, {
          triggerPropertyName: "onSubmit",
          dynamicString: onSubmit,
          event: {
            type: EventType.ON_SUBMIT,
            callback: this.onSubmitSuccess,
          },
        });
      }
    } else {
      if (isEnterKey && typeof onSubmit === "string" && onSubmit && isValid) {
        /**
         * Originally super.executeAction was used to trigger the ON_SUBMIT action and
         * updateMetaProperty to update the text.
         * Since executeAction is not queued and updateMetaProperty is,
         * the user would observe that the data tree only gets partially updated with text
         * before the ON_SUBMIT would get triggered,
         * if they type {enter} really fast after typing some input text.
         * So we're using updateMetaProperty to trigger the ON_SUBMIT to let the data tree update
         * before we actually execute the action.
         * Since updateMetaProperty expects a meta property to be updated,
         * we are redundantly updating the common meta property, isDirty which is common on its child widgets here. But the main part is the action execution payload.
         */
        this.props.updateWidgetMetaProperty("isDirty", this.props.isDirty, {
          triggerPropertyName: "onSubmit",
          dynamicString: onSubmit,
          event: {
            type: EventType.ON_SUBMIT,
            callback: this.onSubmitSuccess,
          },
        });
      }
    }
  };

  componentDidUpdate = (prevProps: AntdInputWidgetProps) => {
    if (
      prevProps.inputText !== this.props.inputText &&
      this.props.inputText !== toString(this.props.text)
    ) {
      this.props.updateWidgetMetaProperty(
        "text",
        getParsedText(this.props.inputText, this.props.inputType),
      );
    }

    if (prevProps.inputType !== this.props.inputType) {
      this.props.updateWidgetMetaProperty(
        "text",
        getParsedText(this.props.inputText, this.props.inputType),
      );
    }
    // If defaultValue property has changed, reset isDirty to false
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  };

  onValueChange = (value: string) => {
    /*
     * Ideally text property should be derived property. But widgets
     * with derived properties won't work as expected inside a List
     * widget.
     * TODO(Balaji): Once we refactor the List widget, need to conver
     * text to a derived property.
     */
    this.props.updateWidgetMetaProperty(
      "text",
      getParsedText(value, this.props.inputType),
    );
    this.props.updateWidgetMetaProperty("inputText", value, {
      triggerPropertyName: "onTextChanged",
      dynamicString: this.props.onTextChanged,
      event: {
        type: EventType.ON_TEXT_CHANGE,
      },
    });
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
  };

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "boolean",
        },
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setRequired: {
          path: "isRequired",
          type: "boolean",
        },
        setValue: {
          path: "defaultValue",
          type: "string",
          accessor: "text",
        },
      },
    };
  }

  resetWidgetText = () => {
    this.props.updateWidgetMetaProperty("inputText", "");
    this.props.updateWidgetMetaProperty(
      "text",
      getParsedText("", this.props.inputType),
    );
  };

  getPageView() {
    const value = this.props.inputText ?? "";
    let isInvalid = false;
    if (this.props.isDirty) {
      isInvalid = "isValid" in this.props && !this.props.isValid;
    } else {
      isInvalid = false;
    }

    const conditionalProps: Partial<InputComponentProps> = {};
    conditionalProps.errorMessage = this.props.errorMessage;
    if (this.props.isRequired && value.length === 0) {
      conditionalProps.errorMessage = createMessage(FIELD_REQUIRED_ERROR);
    }

    if (!isNil(this.props.maxNum)) {
      conditionalProps.maxNum = this.props.maxNum;
    }

    if (!isNil(this.props.minNum)) {
      conditionalProps.minNum = this.props.minNum;
    }

    if (checkInputTypeTextByProps(this.props) && this.props.maxChars) {
      // pass maxChars only for Text type inputs, undefined for other types
      conditionalProps.maxChars = this.props.maxChars;
      if (
        this.props.defaultValue &&
        this.props.defaultValue.toString().length > this.props.maxChars
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
          this.props.maxChars,
        );
      } else if (value && value.length > this.props.maxChars) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_TEXT_MAX_CHAR_ERROR,
          this.props.maxChars,
        );
      }
    }

    if (
      this.props.inputType === InputTypes.NUMBER &&
      isNumber(this.props.defaultValue)
    ) {
      // check the default text is neither greater than max nor less than min value.
      if (
        !isNil(this.props.minNum) &&
        this.props.minNum > Number(this.props.defaultValue)
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MIN_NUM_ERROR,
        );
      } else if (
        !isNil(this.props.maxNum) &&
        this.props.maxNum < Number(this.props.defaultValue)
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MAX_NUM_ERROR,
        );
      }
    }

    if (
      this.props.inputType === InputTypes.NUMBER &&
      this.props.showStepArrows
    ) {
      conditionalProps.buttonPosition = NumberInputStepButtonPosition.RIGHT;
    } else {
      conditionalProps.buttonPosition = NumberInputStepButtonPosition.NONE;
    }

    const autoFillProps =
      !this.props.shouldAllowAutofill &&
      isInputTypeEmailOrPassword(this.props.inputType)
        ? { autoComplete: "off" }
        : {};
    console.group("Antd 自动完成组件");
    console.log(" props", this.props);
    console.log(" this", this);
    console.groupEnd();
    return (
      <InputComponent
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        defaultValue={this.props.defaultValue}
        disableNewLineOnPressEnterKey={!!this.props.onSubmit}
        disabled={this.props.isDisabled}
        emailOptions={this.props.emailOptions}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isInvalid={isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition as any}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelWidth={this.props.labelWidth}
        options={this.props.options}
        placeholder={this.props.placeholderText}
        regex={this.props.regex}
        required={this.props.isRequired}
        showError={!!this.props.isFocused}
        spellCheck={!!this.props.isSpellCheck}
        stepSize={1}
        tooltip={this.props.tooltip}
        value={value}
        colorPrimary={this.props.colorPrimary}
        // show label and Input side by side if true
        autoFocus={this.props.autoFocus}
        {...this.props}
        {...conditionalProps}
        onFocusChange={this.handleFocusChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_AUTO_COMPLETE_WIDGET";
  }
}

export interface InputWidgetProps extends AntdInputWidgetProps {
  defaultValue?: string | number;
  maxChars?: number;
  isSpellCheck?: boolean;
  maxNum?: number;
  minNum?: number;
  inputText: string;
}

export default AutoCompleteWidget;
