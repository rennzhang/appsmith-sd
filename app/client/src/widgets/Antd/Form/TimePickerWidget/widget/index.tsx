import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { isEqual } from "lodash";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import CustomComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";
import { DatePickerValidator } from "widgets/Antd/tools";
import { disabledTimeRuleConfig } from "./childrenConfig";
import type { Dayjs } from "dayjs";
import {
  TimeRangePresetsOptions,
  DisabledRuleOptions,
  TimeFormatOptions,
  TimePresetsOptions,
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
                    ? JSON.stringify(["开始时间", "结束时间"])
                    : "请选择时间",
                },
              ];

              return propertiesToUpdate;
            },
          },
          // format
          {
            propertyName: "format",
            label: "时间格式",
            controlType: "DROP_DOWN",
            options: TimeFormatOptions,
            helpText: "设置所选时间的格式",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hideSubText: true,
          },
          // use12Hours
          {
            helpText: "是否使用 12 小时制",
            propertyName: "use12Hours",
            label: "12 小时制",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },

          // showNow
          {
            helpText: "显示此刻按钮",
            propertyName: "showNow",
            label: "显示此刻",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: DatePickerWidgetProps) => props.isRangePicker,
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
                ? `时间组件默认值，请输入 ["YYYY-MM-dd", "YYYY-MM-dd"] 时间格式数据`
                : "时间组件默认值，请输入 YYYY-MM-dd 时间格式数据";
            },
          },

          {
            helpText: "配置禁用时间规则",
            propertyName: "disabledTimeRule",
            controlType: "OPEN_CONFIG_PANEL",
            buttonConfig: {
              label: "配置",
              icon: "settings-2-line",
            },
            label: "配置禁用时间",
            isBindProperty: false,
            isTriggerProperty: false,
            panelConfig: disabledTimeRuleConfig,
            helperText: (props: DatePickerWidgetProps) => {
              return (
                "当前规则：" +
                  DisabledRuleOptions.find(
                    (c) =>
                      c.value === props.disabledTimeRule.config.disabledRule,
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
          // 校验时间是否合法
          {
            helpText: "校验时间是否合法，如果时间在禁用范围内则不合法",
            propertyName: "isEnabledDateValid",
            label: "校验合法性",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // // minDate
          // {
          //   helpText: "设置时间选择器可选的最小时间",
          //   propertyName: "minDate",
          //   label: "最小时间",
          //   controlType: "DATE_PICKER",
          //   dateFormat: "yyyy-MM-dd",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          // },
          // // maxDate
          // {
          //   helpText: "设置时间选择器可选的最大时间",
          //   propertyName: "maxDate",
          //   label: "最大时间",
          //   controlType: "DATE_PICKER",
          //   dateFormat: "yyyy-MM-dd",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          // },
          // unValidDateMessage
          {
            helpText: "时间不合法时（选择时间在禁用范围内）显示的错误信息",
            propertyName: "unValidDateMessage",
            label: "非法时间错误信息",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入错误信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: DatePickerWidgetProps) => !props.isEnabledDateValid,
            dependencies: ["isEnabledDateValid"],
          },
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
                      : "时间范围选择模式下，应提供数组格式数据";
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
                  example: `请选择时间 | ["开始时间", "结束时间"]`,
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
              "在范围选择时，可以允许留空。这对于需要保留“至今”时间项颇为有用。",
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
            helpText: "选中的数据将会展示在时间组件的预设范围面板",
            propertyName: "presetSingle",
            label: "预设范围",
            controlType: "DROP_DOWN",
            placeholderText: "请选择预设范围",
            options: TimePresetsOptions,
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
            helpText: "选中的数据将会展示在时间组件的预设范围面板",
            propertyName: "presetRange",
            placeholderText: "请选择预设范围",
            label: "预设范围",
            controlType: "DROP_DOWN",
            options: TimeRangePresetsOptions,
            isMultiSelect: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            dependencies: ["showPreset", "isRangePicker"],
            validation: { type: ValidationTypes.ARRAY },
            hidden: (props: DatePickerWidgetProps) =>
              !props.showPreset || !props.isRangePicker,
          },
          // hourStep
          {
            helpText: "设置小时的步长",
            propertyName: "hourStep",
            label: "小时步长",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            defaultValue: 1,
          },
          // minuteStep
          {
            helpText: "设置分钟的步长",
            propertyName: "minuteStep",
            label: "分钟步长",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            defaultValue: 1,
          },
          // secondStep
          {
            helpText: "设置秒的步长",
            propertyName: "secondStep",
            label: "秒步长",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            defaultValue: 1,
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中时间变化时触发，如果设置允许留空，则会多次触发",
            propertyName: "onTimeSelected",
            label: "onTimeSelected",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          // onOk
          {
            helpText: "点击确定按钮时触发",
            propertyName: "onOk",
            label: "onOk",
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
        setValue: {
          path: "selectedValue",
          type: "string",
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
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      selectedValue: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: DatePickerWidgetProps): void {
    const { isRangePicker, updateWidgetMetaProperty } = this.props;
    console.log("时间选择组件 componentDidUpdate", this.props, prevProps);

    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    // if (this.props.defaultValue !== prevProps.defaultValue) {
    //   this?.onTimeSelected?.(null, this.props.defaultValue);
    // }

    if (isRangePicker !== prevProps.isRangePicker) {
      updateWidgetMetaProperty("selectedValue", isRangePicker ? [] : undefined);
    }
  }

  getPageView() {
    console.group("时间选择 getPageView");
    console.log("时间选择 this.props", this.props);
    console.log("时间选择 this", this);
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
        handleDateValid={this.handleDateValid}
        onOk={this.onOk}
        onTimeSelected={this.onTimeSelected}
        selectedValue={this.props.value}
      />
    );
  }
  handleDateValid = (validData: boolean | boolean[]) => {
    console.log("时间选择组件 handleDateValid", validData);

    this.props.updateWidgetMetaProperty("isDateValid", validData);
  };
  onOk = () => {
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("isOk", true, {
      triggerPropertyName: "onOk",
      dynamicString: this.props.onOk,
      event: {
        type: EventType.ON_CLICK,
      },
    });
  };

  onTimeSelected = <
    T extends Dayjs | Dayjs[] | null,
    U extends string | string[],
  >(
    date?: T,
    dateString?: U,
  ) => {
    console.log("时间选择组件 onTimeSelected", date, dateString);

    if (!isEqual(this.props.selectedValue, dateString)) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }

      this.props.updateWidgetMetaProperty("selectedValue", dateString, {
        triggerPropertyName: "onTimeSelected",
        dynamicString: this.props.onTimeSelected,
        event: {
          type: Array.isArray(dateString)
            ? EventType.ON_DATE_RANGE_SELECTED
            : EventType.ON_DATE_SELECTED,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_TIME_PICKER_WIDGET";
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
  isDateValid?: boolean | boolean[];
}

export default AntdDatePickerWidget;
