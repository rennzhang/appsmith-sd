import React from "react";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import type { WidgetType } from "constants/WidgetConstants";
import type { InputComponentProps } from "../component";
import InputComponent from "../component";
import type { ExecutionResult } from "constants/AppsmithActionConstants/ActionConstants";
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
import { isNil, isNumber, merge, toString } from "lodash";
import derivedProperties from "./parsedDerivedProperties";
import type { BaseInputWidgetProps } from "widgets/BaseInputWidget/widget";
import { mergeWidgetConfig } from "utils/helpers";
import {
  InputTypes,
  NumberInputStepButtonPosition,
} from "widgets/BaseInputWidget/constants";
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
import { optionsCustomValidation } from "widgets/RadioGroupWidget/widget";
import { InputControlProperty } from "./childPanels/CompConfig";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";
import { AntdLabelPosition } from "components/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import BaseWidget from "widgets/BaseWidget";
import type { InputProps } from "antd";
import type { FormItemInputProps } from "antd/lib/form/FormItemInput";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { Alignment } from "@blueprintjs/core";
import type { Intent, IconName, IRef } from "@blueprintjs/core";
import type { AntdInputWidgetProps } from "../types";

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
        parsed = undefined;
      } else if (!Number.isFinite(parsed)) {
        /*
         *  When parsed value is not a finite numer
         */
        isValid = false;
        messages = [NUMBER_ERROR_MESSAGE];
        parsed = undefined;
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
// class RadioGroupWidget extends BaseWidget<RadioGroupWidgetProps, WidgetState>

class AntdInputWidget<
  T extends AntdInputWidgetProps,
  K extends WidgetState,
> extends BaseWidget<T, K> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    const definitions: AutocompletionDefinitions = {
      "!doc":
        "An input text field is used to capture a users textual input such as their names, numbers, emails etc. Inputs are used in forms and can have custom validations.",
      "!url": "https://docs.appsmith.com/widget-reference/input",
      value: {
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
              helpText: "输入的数据类型",
              propertyName: "inputType",
              label: "数据类型",
              controlType: "DROP_DOWN",
              options: [
                {
                  label: "单行文本",
                  value: "TEXT",
                },
                {
                  label: "多行文本",
                  value: "MULTI_LINE_TEXT",
                },
                {
                  label: "密码",
                  value: "PASSWORD",
                },
                {
                  label: "数字",
                  value: "NUMBER",
                },
              ],
              isBindProperty: false,
              isTriggerProperty: false,
              updateHook: InputTypeUpdateHook,
              dependencies: ["dynamicHeight"],
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
      InputControlProperty,
    );
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig([], DEFAULT_STYLE_PANEL_CONFIG);
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      isValid: `{{(() => {${derivedProperties.isValid}})()}}`,
      value: "{{this.value}}",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      inputText: "",
      value: "",
      text: undefined,
      isFocused: false,
      isDirty: false,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      inputText: "defaultValue",
      value: "defaultValue",
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
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
    /**
     * Reason for disabling drag on focusState: true:
     * 1. In Firefox, draggable="true" property on the parent element
     *    or <input /> itself, interferes with some <input /> element's events
     *    Bug Ref - https://bugzilla.mozilla.org/show_bug.cgi?id=800050
     *              https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
     *
     *  Eg - input with draggable="true", double clicking the text; won't highlight the text
     *
     * 2. Dragging across the text (for text selection) in input won't cause the widget to drag.
     */
    this.props.updateWidgetMetaProperty("dragDisabled", focusState);
  };

  onSubmitSuccess = (result: ExecutionResult) => {
    if (result.success && this.props.resetOnSubmit) {
      //Resets isDirty
      super.resetChildrenMetaProperty(this.props.widgetId);
      this.resetWidgetText();
    }
  };
  handleKeyDown(
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) {
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
  }

  componentDidUpdate = (prevProps: AntdInputWidgetProps) => {
    if (
      prevProps.inputText !== this.props.inputText &&
      this.props.inputText !== toString(this.props.text)
    ) {
      this.props.updateWidgetMetaProperty(
        "value",
        getParsedText(this.props.inputText, this.props.inputType),
      );
    }

    if (prevProps.inputType !== this.props.inputType) {
      this.props.updateWidgetMetaProperty(
        "value",
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
      "value",
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
          accessor: "value",
        },
      },
    };
  }

  resetWidgetText = () => {
    this.props.updateWidgetMetaProperty("inputText", "");
    this.props.updateWidgetMetaProperty(
      "value",
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
        (this.props?.minNum || 0) > Number(this.props.defaultValue)
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MIN_NUM_ERROR,
        );
      } else if (
        !isNil(this.props.maxNum) &&
        (this.props?.maxNum || 0) < Number(this.props.defaultValue)
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

    console.group("Antd 输入框组件");
    console.log(" props", this.props);
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
        multiline={this.props.inputType === InputTypes.MULTI_LINE_TEXT}
        onFocusChange={this.handleFocusChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
        placeholder={this.props.placeholderText}
        regex={this.props.regex}
        required={this.props.isRequired}
        showError={!!this.props.isFocused}
        spellCheck={!!this.props.isSpellCheck}
        stepSize={1}
        tooltip={this.props.tooltip}
        value={value}
        accentColor={this.props.accentColor}
        // show label and Input side by side if true
        autoFocus={this.props.autoFocus}
        {...this.props}
        {...conditionalProps}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_INPUT_WIDGET";
  }
}

export default AntdInputWidget;
