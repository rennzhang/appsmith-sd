import { Alignment } from "@blueprintjs/core";
import { compact, isArray, isNumber } from "lodash";
import React from "react";

import { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import RadioGroupComponent from "../component";
import type { RadioOption } from "../constants";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetState, WidgetProps } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import type { CheckboxValueType } from "antd/es/checkbox/Group";

/**
 * Validation rules:
 * 1. This property will take the value in the following format: Array<{ "label": "string", "value": "string" | number}>
 * 2. The `value` property should consists of unique values only.
 * 3. Data types of all the value props should be the same.
 */
export function optionsCustomValidation(
  options: unknown,
  props: any,
  _: any,
): ValidationResponse {
  const labelField = props.fieldNames?.label || "label";
  const valueField = props.fieldNames?.value || "value";
  const validationUtil = (options: any[], _: any) => {
    let _isValid = true;
    let message = { name: "", message: "" };
    let valueType = "";
    const uniqueLabels: Record<string | number, string> = {};

    for (let i = 0; i < options.length; i++) {
      const label = options[i][labelField];
      const value = options[i][valueField];
      if (!valueType) {
        valueType = typeof value;
      }
      //Checks the uniqueness all the values in the options
      if (!uniqueLabels.hasOwnProperty(value)) {
        uniqueLabels[value] = "";
      } else {
        _isValid = false;
        message = {
          name: "ValidationError",
          message: `path:${valueField} must be unique. Duplicate values found`,
        };
        break;
      }

      //Check if the required field "label" is present:
      if (!label) {
        _isValid = false;
        message = {
          name: "ValidationError",
          message: `Invalid entry at index: ${i}. Missing required key: ${labelField}`,
        };
        break;
      }

      //Validation checks for the the label.
      if (
        _.isNil(label) ||
        label === "" ||
        (typeof label !== "string" && typeof label !== "number")
      ) {
        _isValid = false;
        message = {
          name: "ValidationError",
          message: `Invalid entry at index: ${i}. Value of key: ${labelField} is invalid: This value does not evaluate to type string`,
        };
        break;
      }

      //Check if all the data types for the value prop is the same.
      if (typeof value !== valueType) {
        _isValid = false;
        message = {
          name: "TypeError",
          message: "All value properties in options must have the same type",
        };
        break;
      }

      //Check if the each object has value property.
      if (_.isNil(value)) {
        _isValid = false;
        message = {
          name: "TypeError",
          message: `This value does not evaluate to type Array<{ "label": "string", "value": "string" | number }>`,
        };
        break;
      }
    }

    return {
      isValid: _isValid,
      parsed: _isValid ? options : [],
      messages: [message],
    };
  };

  const invalidResponse = {
    isValid: false,
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message:
          'This value does not evaluate to type Array<{ "label": "string", "value": "string" | number }>',
      },
    ],
  };
  try {
    if (_.isString(options)) {
      options = JSON.parse(options as string);
    }

    if (Array.isArray(options)) {
      return validationUtil(options, _);
    } else {
      return invalidResponse;
    }
  } catch (e) {
    return invalidResponse;
  }
}
function defaultOptionValidation(
  value: unknown,
  props: any,
  _: any,
): ValidationResponse {
  //Checks if the value is not of object type in {{}}
  if (_.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: [
        {
          name: "TypeError",
          message: "This value does not evaluate to type: string or number",
        },
      ],
    };
  }

  //Checks if the value is not of boolean type in {{}}
  if (_.isBoolean(value)) {
    return {
      isValid: false,
      parsed: value,
      messages: [
        {
          name: "TypeError",
          message: "This value does not evaluate to type: string or number",
        },
      ],
    };
  }

  return {
    isValid: true,
    parsed: value,
  };
}

class RadioGroupWidget extends BaseWidget<RadioGroupWidgetProps, WidgetState> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: RadioGroupWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        "!doc":
          "Radio widget lets the user choose only one option from a predefined set of options. It is quite similar to a SingleSelect Dropdown in its functionality",
        "!url": "https://docs.appsmith.com/widget-reference/radio",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        options: "[$__dropdownOption__$]",
        defaultValue: "string",
        value: generateTypeDef(widget.value, extraDefsToDefine),
        selectedOptions: generateTypeDef(
          widget.selectedOption,
          extraDefsToDefine,
        ),
        selectedLabel: generateTypeDef(widget.selectedLabel, extraDefsToDefine),
        selectedValue: generateTypeDef(widget.selectedValue, extraDefsToDefine),
        isRequired: "bool",
        isDisabled: "bool",
      };
    };
  }

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "选项值唯一的数组",
            propertyName: "options",
            label: "选项",
            controlType: "OPTION_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: optionsCustomValidation,
                expected: {
                  type: 'Array<{ "label": "string", "value": "string" | number}>',
                  example: `[{"label": "One", "value": "one"}]`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "设置默认选中的选项",
            propertyName: "defaultValue",
            label: "默认选中值",
            placeholderText: "[]",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                allowedTypes: ["string", "number"],
              },
            },
          },
        ],
      },
      {
        sectionName: "标签",
        children: [
          {
            helpText: "设置组件标签文本",
            propertyName: "labelText",
            label: "文本",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          // !暂不支持，需要配合 form 组件
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: true,
            hidden: isAutoLayout,
            options: [
              { label: "自动", value: AntdLabelPosition.Auto },
              { label: "左", value: AntdLabelPosition.Left },
              { label: "上", value: AntdLabelPosition.Top },
            ],
            defaultValue: AntdLabelPosition.Left,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签的对齐方式",
            propertyName: "labelAlignment",
            label: "对齐",
            controlType: "LABEL_ALIGNMENT_OPTIONS",
            fullWidth: false,
            options: [
              {
                startIcon: "align-left",
                value: Alignment.LEFT,
              },
              {
                startIcon: "align-right",
                value: Alignment.RIGHT,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: RadioGroupWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left,
            dependencies: ["labelPosition"],
          },
          {
            helpText: "设置组件标签占用的列数",
            propertyName: "labelWidth",
            label: "宽度（所占列数）",
            controlType: "NUMERIC_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            min: 0,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                natural: true,
              },
            },
            hidden: (props: RadioGroupWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
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
            helpText: "显示提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入提示信息",
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
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },

          {
            propertyName: "isInline",
            helpText: "单向框是否水平排列",
            label: "行排列",
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
            helpText: "选中项改变时触发",
            propertyName: "onValueChange",
            label: "onValueChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "属性",
        children: [
          {
            propertyName: "alignment",
            helpText: "设置组件对齐方式",
            label: "对齐",
            controlType: "ICON_TABS",
            defaultValue: Alignment.LEFT,
            fullWidth: true,
            isBindProperty: true,
            isTriggerProperty: false,
            options: [
              {
                label: "左对齐",
                value: Alignment.LEFT,
              },
              {
                label: "右对齐",
                value: Alignment.RIGHT,
              },
            ],
          },
        ],
      },
      {
        sectionName: "标签样式",
        children: [
          {
            propertyName: "labelTextColor",
            label: "字体颜色",
            helpText: "设置标签字体颜色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelTextSize",
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
            propertyName: "labelStyle",
            label: "强调",
            helpText: "设置标签字体是否加粗或斜体",
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

      {
        sectionName: "颜色配置",
        children: [
          {
            propertyName: "accentColor",
            helpText: "设置单选框选中态的颜色",
            label: "强调色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap() {
    return {
      selectedOptions: "{{_.find(this.options, { value: this.value })}}",
      isValid: `{{ this.isRequired ? !!this.value : true }}`,
      value: `{{this.selectedValue}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "selectedValue",
      selectedValue: "defaultValue",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      isDirty: false,
      selectedValue: undefined,
      selectedLabel: undefined,
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      boxShadow: "none",
    };
  }

  componentDidUpdate(prevProps: RadioGroupWidgetProps): void {
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    if (this.props.defaultValue !== prevProps.defaultValue) {
      this?.onValueChange?.(this.props.defaultValue);
    }
  }

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
        setData: {
          path: "options",
          type: "array",
        },
      },
    };
  }

  getPageView() {
    const {
      alignment,
      animateLoading,
      bottomRow,
      isDisabled,
      isInline,
      isLoading,
      labelAlignment,
      labelPosition,
      labelStyle,
      labelText,
      labelTextColor,
      labelTextSize,
      options,
      topRow,
      value,
      widgetId,
    } = this.props;
    console.group("Antd 单选组件");
    console.log(" props", this.props);
    console.log(" this", this);
    console.groupEnd();

    const { componentHeight } = this.getComponentDimensions();

    return (
      <RadioGroupComponent
        accentColor={this.props.accentColor}
        alignment={alignment}
        animateLoading={animateLoading}
        compactMode={!((bottomRow - topRow) / GRID_DENSITY_MIGRATION_V1 > 1)}
        disabled={isDisabled}
        height={componentHeight}
        inline={Boolean(isInline)}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        key={widgetId}
        labelAlignment={labelAlignment}
        labelPosition={labelPosition}
        labelStyle={labelStyle}
        labelText={labelText}
        labelTextColor={labelTextColor}
        labelTextSize={labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        loading={isLoading}
        onValueChange={this.onValueChange}
        options={isArray(options) ? compact(options) : []}
        required={this.props.isRequired}
        value={value}
        widgetId={widgetId}
        widgetName={this.props.widgetName}
      />
    );
  }

  getAllSelectedLabel = (value: CheckboxValueType[]) => {
    const selectedOptions = this.props.options.filter((option) =>
      value.includes(option.value),
    );

    this.props.updateWidgetMetaProperty("selectedOptions", selectedOptions);
    return selectedOptions.map((option) => option.label);
  };
  onValueChange = (value: CheckboxValueType[]) => {
    console.log(" this.props", this.props);
    // Set isDirty to true when the selection changes
    if (this.props.selectedValue !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("selectedValue", value);

      this.props.updateWidgetMetaProperty(
        "selectedLabel",
        this.getAllSelectedLabel(value),
        {
          triggerPropertyName: "onValueChange",
          dynamicString: this.props.onValueChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
        },
      );
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_CHECKBOX_WIDGET";
  }
}

export interface RadioGroupWidgetProps extends WidgetProps {
  options: RadioOption[];
  onValueChange: string;
  defaultValue: CheckboxValueType[];
  isRequired?: boolean;
  isDisabled: boolean;
  isInline?: boolean;
  alignment: Alignment;
  label: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: number;
  labelStyle?: string;
  isDirty: boolean;
  accentColor: string;
}

export default RadioGroupWidget;
