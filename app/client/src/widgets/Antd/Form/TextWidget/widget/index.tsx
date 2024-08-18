import React from "react";
import type { WidgetState } from "widgets/BaseWidget";
import type { WidgetType } from "constants/WidgetConstants";
import TextDisplayComponent from "../component";
import type { ExecutionResult } from "constants/AppsmithActionConstants/ActionConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import { mergeWidgetConfig } from "utils/helpers";
import { InputTypes } from "widgets/BaseInputWidget/constants";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
} from "../../CONST/DEFAULT_CONFIG";
import BaseWidget from "widgets/BaseWidget";
import type { AntdTextDisplayWidgetProps } from "../types";
import { ValidationTypes } from "constants/WidgetValidation";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";

// class RadioGroupWidget extends BaseWidget<RadioGroupWidgetProps, WidgetState>

class AntdInputWidget<
  T extends AntdTextDisplayWidgetProps,
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
    };

    return definitions;
  }
  static getPropertyPaneContentConfig() {
    return mergeWidgetConfig(
      [],
      [
        {
          sectionName: "数据",
          children: [
            {
              helpText: "设置组件显示文本",
              propertyName: "defaultValue",
              label: "显示文本",
              controlType: "INPUT_TEXT",
              placeholderText: "请输入显示文本",
              isBindProperty: true,
              isTriggerProperty: false,
              validation: {
                type: ValidationTypes.TEXT,
              },
            },
          ],
        },
        FORM_LABEL_CONTENT_CONFIG,
        {
          sectionName: "校验",
          children: [
            {
              propertyName: "isRequired",
              label: "必填",
              helpText: "强制用户填写",
              controlType: "SWITCH",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
            },
          ],
        },
        {
          sectionName: "属性",
          children: [
            {
              helpText: "显示帮助信息或者当前输入的详情",
              propertyName: "tooltip",
              label: "提示",
              controlType: "INPUT_TEXT",
              placeholderText: "至少输入6个字符",
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },

            {
              helpText: "控制组件的显示/隐藏",
              propertyName: "isVisible",
              label: "是否显示",
              controlType: "SWITCH",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
            },

            {
              propertyName: "animateLoading",
              label: "加载时显示动画",
              controlType: "SWITCH",
              helpText: "组件依赖的数据加载时显示加载动画",
              defaultValue: true,
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
            },
          ],
        },
        {
          sectionName: "事件",
          children: [
            {
              helpText: "提交时触发（用户按了回车）",
              propertyName: "onSubmit",
              label: "onSubmit",
              controlType: "ACTION_SELECTOR",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: true,
            },
          ],
        },
      ],
    );
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "内容文本样式",
          children: [
            {
              propertyName: "textColor",
              label: "字体颜色",
              helpText: "设置标签字体颜色",
              controlType: "COLOR_PICKER",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
            {
              propertyName: "textSize",
              label: "字体大小",
              helpText: "设置标签字体大小",
              controlType: "DROP_DOWN",
              defaultValue: "0.875rem",
              hidden: isAutoLayout,
              options: [
                {
                  label: "S",
                  value: "0.875rem",
                  subText: "0.875rem",
                },
                {
                  label: "M",
                  value: "1rem",
                  subText: "1rem",
                },
                {
                  label: "L",
                  value: "1.25rem",
                  subText: "1.25rem",
                },
                {
                  label: "XL",
                  value: "1.875rem",
                  subText: "1.875rem",
                },
                {
                  label: "XXL",
                  value: "3rem",
                  subText: "3rem",
                },
                {
                  label: "3XL",
                  value: "3.75rem",
                  subText: "3.75rem",
                },
              ],
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
            {
              propertyName: "textStyle",
              label: "强调",
              helpText: "设置字体是否加粗或斜体",
              controlType: "BUTTON_GROUP",
              options: [
                {
                  icon: "text-bold",
                  value: "BOLD",
                },
                {
                  icon: "text-italic",
                  value: "ITALIC",
                },
              ],
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
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
    };
  }

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

  componentDidUpdate = (prevProps: AntdTextDisplayWidgetProps) => {
    // If defaultValue property has changed, reset isDirty to false
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  };

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
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
    this.props.updateWidgetMetaProperty("value", "");
  };

  getPageView() {
    const value = this.props.inputText ?? "";
    let isInvalid = false;
    if (this.props.isDirty) {
      isInvalid = "isValid" in this.props && !this.props.isValid;
    } else {
      isInvalid = false;
    }

    console.group("Antd 输入框组件");
    console.log(" props", this.props);
    console.groupEnd();

    return (
      <TextDisplayComponent
        defaultValue={this.props.defaultValue}
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
        onKeyDown={this.handleKeyDown}
        placeholder={this.props.placeholderText}
        required={this.props.isRequired}
        tooltip={this.props.tooltip}
        value={value}
        accentColor={this.props.accentColor}
        // show label and Input side by side if true
        {...this.props}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_TEXT_WIDGET";
  }
}

export default AntdInputWidget;
