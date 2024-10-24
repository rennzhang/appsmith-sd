import { Alignment } from "@blueprintjs/core";
import type { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import type { LoDashStatic } from "lodash";
import { get, isEqual } from "lodash";
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
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
} from "../../CONST/DEFAULT_CONFIG";
import { DatePickerValidator } from "widgets/Antd/tools";
import { disabledTimeRuleConfig } from "./childrenConfig";
import type { Dayjs } from "dayjs";
import {
  TimeRangePresetsOptions,
  DisabledRuleOptions,
  TimeFormatOptions,
  TimePresetsOptions,
} from "./data";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";
import type { SelectWidgetProps } from "widgets/SelectWidget/widget";

class AntdTimePickerWidget extends BaseWidget<
  TimePickerWidgetProps,
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
            isJSConvertible: true,
            defaultValue: false,
            isBindProperty: true,
            isTriggerProperty: false,
            options: [
              { label: "单选", value: false },
              { label: "范围", value: true },
            ],
            validation: { type: ValidationTypes.BOOLEAN },
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
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return propsData.isRangePicker;
            },
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
              },
            },
            helperText: (
              props: TimePickerWidgetProps,
              propertyPath: string,
            ) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;

              return propsData.isRangePicker
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
            helperText: (
              props: TimePickerWidgetProps,
              propertyPath: string,
            ) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return (
                "当前规则：" +
                  DisabledRuleOptions.find(
                    (c) =>
                      c.value ===
                      propsData.disabledTimeRule.config.disabledRule,
                  )?.label || "无"
              );
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
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isEnabledDateValid;
            },
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
              type: ValidationTypes.TEXT,
            },
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return propsData.isRangePicker;
            },
          },
          {
            propertyName: "placeholderTextStart",
            label: "开始时间占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入开始时间占位符",
            isBindProperty: true,
            isTriggerProperty: false,
            isJSConvertible: true,

            validation: {
              type: ValidationTypes.TEXT,
            },
            dependencies: ["isRangePicker"],
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isRangePicker;
            },
          },
          {
            propertyName: "placeholderTextEnd",
            label: "结束时间占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入结束时间占位符",
            isBindProperty: true,
            isTriggerProperty: false,
            isJSConvertible: true,
            validation: {
              type: ValidationTypes.TEXT,
            },
            dependencies: ["isRangePicker"],
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isRangePicker;
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
            propertyName: "allowEmptyStartTime",
            label: "开始时间允许留空",
            helpText:
              "在范围选择时，开始时间可以允许留空。这对于需要保留“至今”时间项颇为有用。",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.BOOLEAN,
            },
            dependencies: ["isRangePicker"],
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isRangePicker;
            },
          },
          {
            propertyName: "allowEmptyEndTime",
            label: "结束时间允许留空",
            helpText:
              "在范围选择时，结束时间可以允许留空。这对于需要保留“至今”时间项颇为有用。",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.BOOLEAN,
            },
            dependencies: ["isRangePicker"],
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isRangePicker;
            },
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
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.showPreset || propsData.isRangePicker;
            },
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
            hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.showPreset || !propsData.isRangePicker;
            },
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
            propertyName: "onTimeChange",
            label: "onChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          // onOk
          // {
          //   helpText: "点击确定按钮时触发",
          //   propertyName: "onOkTriggerPropertyName",
          //   label: "onOk",
          //   controlType: "ACTION_SELECTOR",
          //   isJSConvertible: true,
          //   isBindProperty: true,
          //   isTriggerProperty: true,
          // },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      colorPrimary: "{{appsmith.theme.colors.primaryColor}}",
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
    return (widget: TimePickerWidgetProps, extraDefsToDefine?: ExtraDef) => {
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

  componentDidUpdate(prevProps: TimePickerWidgetProps): void {
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
        onChange={this.handleTimeSelected}
        // onOk={this.onOk}
        selectedValue={this.props.value}
      />
    );
  }
  handleDateValid = (validData: boolean | boolean[]) => {
    console.log("时间选择组件 handleDateValid", validData);

    this.props.updateWidgetMetaProperty("isDateValid", validData);
  };
  // onOk = () => {
  //   if (!this.props.isDirty) {
  //     this.props.updateWidgetMetaProperty("isDirty", true);
  //   }

  //   this.props.updateWidgetMetaProperty("isOk", true, {
  //     triggerPropertyName: "onOkTriggerPropertyName",
  //     dynamicString: this.props.onOkTriggerPropertyName,
  //     event: {
  //       type: EventType.ON_CLICK,
  //     },
  //   });
  // };

  handleTimeSelected = <
    T extends Dayjs | Dayjs[] | null,
    U extends string | string[],
  >(
    date?: T,
    dateString?: U,
  ) => {
    console.log("时间选择组件 onTimeChange", date, dateString);

    if (!isEqual(this.props.selectedValue, dateString)) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }

      this.props.updateWidgetMetaProperty("selectedValue", dateString, {
        triggerPropertyName: "onTimeChange",
        dynamicString: this.props.onTimeChange,
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

export interface TimePickerWidgetProps extends WidgetProps {
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
  colorPrimary: string;
  isDirty?: boolean;
  isDateValid?: boolean | boolean[];
}

export default AntdTimePickerWidget;
