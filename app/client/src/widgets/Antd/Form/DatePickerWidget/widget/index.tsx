import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Layers } from "constants/Layers";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { isArray, isEqual, last } from "lodash";
import type {
  ChangeEventExtra,
  DefaultValueType,
} from "rc-tree-select/lib/interface";
import type { Key, ReactNode } from "react";
import React from "react";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1, MinimumPopupRows } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import CustomComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";
import type { Def } from "tern";
import { DatePickerValidator, SelectValidator } from "widgets/Antd/tools";
import { disabledDateRuleConfig } from "./childrenConfig";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  DateFormatOptions,
  DatePresetsOptions,
  DateRangePresetsOptions,
  DisabledRuleOptions,
} from "./data";

class AntdDatePickerWidget extends BaseWidget<
  DatePickerWidgetProps,
  WidgetState
> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            propertyName: "isRangePicker",
            label: "选择模式",
            helpText: "是否使用范围选择",
            controlType: "ICON_TABS",
            // isJSConvertible: true,
            defaultValue: false,
            isBindProperty: true,
            isTriggerProperty: false,
            options: [
              { label: "单选", value: false },
              { label: "范围", value: true },
            ],
            validation: { type: ValidationTypes.BOOLEAN },
            dependencies: ["placeholderText"],
            updateHook: (
              props: DatePickerWidgetProps,
              propertyPath: string,
              propertyValue: string,
            ) => {
              const propertiesToUpdate = [
                { propertyPath, propertyValue },
                {
                  propertyPath: "placeholderText",
                  propertyValue: propertyValue
                    ? JSON.stringify(["开始日期", "结束日期"])
                    : "请选择日期",
                },
                {
                  propertyPath: "defaultValue",
                  propertyValue: propertyValue ? JSON.stringify(["", ""]) : "",
                },
              ];

              return propertiesToUpdate;
            },
          },
          // format
          {
            propertyName: "format",
            label: "日期格式",
            controlType: "DROP_DOWN",
            options: DateFormatOptions,
            helpText: "设置所选日期的格式",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hideSubText: true,
          },
          // antd datePicker picker, date | week | month | quarter | year
          {
            propertyName: "picker",
            label: "选择类型",
            controlType: "DROP_DOWN",
            options: [
              { label: "日期", value: "date" },
              { label: "周", value: "week" },
              { label: "月", value: "month" },
              { label: "季度", value: "quarter" },
              { label: "年", value: "year" },
            ],
            helpText: "切换不同类型的日期选择器",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "showTime",
            label: "显示时间",
            controlType: "SWITCH",
            helpText: "显示时间选择器",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "默认选中的值",
            propertyName: "defaultValue",
            label: "默认值",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            dependencies: ["isRangePicker"],
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: DatePickerValidator.defaultValueValidation,
                expected: {
                  type: "value",
                  example: [`value1`],
                  autocompleteDataType: AutocompleteDataType.ARRAY,
                },
              },
            },
            helperText: (props: DatePickerWidgetProps) => {
              return props.isRangePicker
                ? `日期组件默认值，请输入 ["YYYY-MM-dd", "YYYY-MM-dd"] 日期格式数据`
                : "日期组件默认值，请输入 YYYY-MM-dd 日期格式数据";
            },
          },

          {
            helpText: "配置禁用日期规则",
            propertyName: "disabledDateRule",
            controlType: "OPEN_CONFIG_PANEL",
            buttonConfig: {
              label: "配置",
              icon: "settings-2-line",
            },
            label: "配置禁用日期",
            isBindProperty: false,
            isTriggerProperty: false,
            panelConfig: disabledDateRuleConfig,
            helperText: (props: DatePickerWidgetProps) => {
              return (
                "当前规则：" +
                  DisabledRuleOptions.find(
                    (c) =>
                      c.value === props.disabledDateRule.config.disabledRule,
                  )?.label || "无"
              );
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
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: false,
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
            hidden: (props: DatePickerWidgetProps) =>
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
            hidden: (props: DatePickerWidgetProps) =>
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
          // // minDate
          // {
          //   helpText: "设置日期选择器可选的最小日期",
          //   propertyName: "minDate",
          //   label: "最小日期",
          //   controlType: "DATE_PICKER",
          //   dateFormat: "yyyy-MM-dd",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          // },
          // // maxDate
          // {
          //   helpText: "设置日期选择器可选的最大日期",
          //   propertyName: "maxDate",
          //   label: "最大日期",
          //   controlType: "DATE_PICKER",
          //   dateFormat: "yyyy-MM-dd",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          // },
          {
            helpText: "普通校验或正则校验失败后显示的错误信息",
            propertyName: "errorMessage",
            label: "错误信息",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入错误信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置占位文本",
            propertyName: "placeholderText",
            label: "占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入占位文本",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            dependencies: ["isRangePicker"],
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: (value: any, props: DatePickerWidgetProps) => {
                  const placeholderText = value || "";

                  if (props.isRangePicker) {
                    let parsed;
                    let isValid;
                    let isArray;
                    let errMessage;
                    try {
                      parsed = JSON.parse(placeholderText);
                    } catch (error) {
                      isValid = false;
                      parsed = placeholderText;
                      errMessage = "JSON 解析错误, 请提供正确的 JSON 格式数据";
                      return {
                        isValid,
                        parsed,
                        messages: [
                          {
                            name: "TypeError",
                            message: errMessage,
                          },
                        ],
                      };
                    }
                    isArray = isValid = Array.isArray(parsed);
                    errMessage = isArray
                      ? ""
                      : "日期范围选择模式下，应提供数组格式数据";
                    // 不能超过两个，并且每个元素都是字符串
                    if (isValid) {
                      isValid = parsed.length <= 2;
                      if (isValid) {
                        isValid = parsed.every(
                          (item: any) => typeof item === "string",
                        );
                        errMessage = isValid
                          ? ""
                          : "请提供字符串格式数据，最大长度为 2";
                      }
                    }

                    return {
                      isValid,
                      parsed,
                      messages: isValid
                        ? []
                        : [
                            {
                              name: "TypeError",
                              message: errMessage,
                            },
                          ],
                    };
                  }

                  const isValidPlaceholder =
                    typeof placeholderText === "string";
                  return {
                    isValid: isValidPlaceholder,
                    parsed: placeholderText,
                    messages: isValidPlaceholder
                      ? []
                      : [
                          {
                            name: "TypeError",
                            message: "请输入占位文本",
                          },
                        ],
                  };
                },
                expected: {
                  type: "string | string[]",
                  example: `请选择日期 | ["开始日期", "结束日期"]`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                  // autocompleteDataType: AutocompleteDataType.ARRAY,
                },
              },
            },
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
        sectionName: "组件配置",
        children: [
          // allowEmpty
          {
            propertyName: "allowEmpty",
            label: "允许留空",
            helpText:
              "在范围选择时，可以允许留空。这对于需要保留“至今”日期项颇为有用。",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                expected: {
                  type: "boolean[]",
                  example: [false, true],
                  autocompleteDataType: AutocompleteDataType.ARRAY,
                },
                // value 必须是一个数组，且长度为2，且每个元素都是布尔值，需要用 JSON.parse 解析
                fn: (value: any) => {
                  let val = value;
                  const res = {
                    isValid: false,
                    parsed: val,
                    messages: [
                      {
                        name: "TypeError",
                        message: "请输入正确的值",
                      },
                    ],
                  };
                  try {
                    val = JSON.parse(val);
                    if (Array.isArray(val) && val.length === 2) {
                      return {
                        isValid: true,
                        parsed: val,
                        messages: [],
                      };
                    }
                  } catch (error) {
                    return res;
                  }
                  return res;
                },
              },
            },
            dependencies: ["isRangePicker"],
            hidden: (props: DatePickerWidgetProps) => !props.isRangePicker,
          },

          {
            propertyName: "allowClear",
            label: "允许清空",
            helpText: "显示清空按钮用来清空选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // 显示预设
          {
            helpText: "显示预设范围",
            propertyName: "showPreset",
            label: "显示预设",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // 预设范围 下拉选择
          {
            helpText: "选中的数据将会展示在日期组件的预设范围面板",
            propertyName: "presetDate",
            label: "预设范围",
            controlType: "DROP_DOWN",
            placeholderText: "请选择预设范围",
            options: DatePresetsOptions,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            isMultiSelect: true,
            dependencies: ["showPreset", "isRangePicker"],
            validation: { type: ValidationTypes.ARRAY },
            hidden: (props: DatePickerWidgetProps) =>
              !props.showPreset || props.isRangePicker,
          },
          // 范围选择 预设范围
          {
            helpText: "选中的数据将会展示在日期组件的预设范围面板",
            propertyName: "presetRange",
            placeholderText: "请选择预设范围",
            label: "预设范围",
            controlType: "DROP_DOWN",
            options: DateRangePresetsOptions,
            isMultiSelect: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            dependencies: ["showPreset", "isRangePicker"],
            validation: { type: ValidationTypes.ARRAY },
            hidden: (props: DatePickerWidgetProps) =>
              !props.showPreset || !props.isRangePicker,
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中日期变化时触发，如果设置允许留空，则会多次触发",
            propertyName: "onDateChange",
            label: "onDateChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          // onSearch
          {
            helpText: "搜索时触发",
            propertyName: "onOptionSearch",
            label: "onSearch",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setRequired: {
          path: "isRequired",
          type: "boolean",
        },
      },
    };
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "属性",
          children: [
            // height
            // {
            //   propertyName: "height",
            //   label: "高度",
            //   controlType: "INPUT_TEXT",
            //   helpText: "设置组件的高度",
            //   placeholderText: "请输入高度",
            //   isBindProperty: true,
            //   isTriggerProperty: false,
            //   validation: { type: ValidationTypes.NUMBER },
            // },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: DatePickerWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        "!doc":
          "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        value: generateTypeDef(widget.value, extraDefsToDefine),
        selectedValue: generateTypeDef(widget.selectedValue, extraDefsToDefine),
        isDisabled: "bool",
        isValid: generateTypeDef(widget.isValid, extraDefsToDefine),
      };
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedValue}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "selectedValue",
      checkedLabels: "defaultLabel",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      selectedValue: undefined,
      checkedLabels: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: DatePickerWidgetProps): void {
    const { isRangePicker, updateWidgetMetaProperty } = this.props;
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    // if (this.props.defaultValue !== prevProps.defaultValue) {
    //   this?.onDateChange?.(null, this.props.defaultValue);
    // }

    if (isRangePicker !== prevProps.isRangePicker) {
      updateWidgetMetaProperty("selectedValue", isRangePicker ? [] : "");
    }
  }

  getPageView() {
    console.group("日期选择 getPageView");
    console.log("日期选择 this.props", this.props);
    console.log("日期选择 this", this);
    console.groupEnd();
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const { componentWidth } = this.getComponentDimensions();

    return (
      <CustomComponent
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        disabled={this.props.isDisabled ?? false}
        errorMessage={this.props.errorMessage}
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        loading={this.props.isLoading}
        required={this.props.isRequired}
        width={componentWidth}
        {...this.props}
        // defaultValue={defaultValueTransformed}
        onValueChange={this.onDateChange}
      />
    );
  }

  onDateChange = <
    T extends Dayjs | Dayjs[] | null,
    U extends string | string[],
  >(
    date?: T,
    dateString?: U,
  ) => {
    console.log("日期选择组件 onDateChange", date, dateString);

    if (!isEqual(this.props.selectedValue, dateString)) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }

      this.props.updateWidgetMetaProperty("selectedValue", dateString, {
        triggerPropertyName: "onDateChange",
        dynamicString: this.props.onDateChange,
        event: {
          type: Array.isArray(dateString)
            ? EventType.ON_DATE_RANGE_SELECTED
            : EventType.ON_DATE_SELECTED,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_DATA_PICKER_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface DatePickerWidgetProps extends WidgetProps {
  placeholderText?: string;
  selectedIndex?: number;
  updateSelectInfo: (selectInfo: any) => void;

  defaultValue: string;
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  checkedLabels: string[];
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  isDirty?: boolean;
}

export default AntdDatePickerWidget;
