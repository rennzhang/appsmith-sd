import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { ValidationTypes } from "constants/WidgetValidation";
import { DynamicHeight } from "utils/WidgetFeatures";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetConfiguration } from "widgets/constants";
import type { AntdInputWidgetProps } from "../InputWidget/types";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import {
  getOptionLabelValueExpressionPrefix,
  optionLabelValueExpressionSuffix,
} from "../SelectWidget/constants";
import {
  getLabelValueKeyOptions,
  labelKeyValidation,
  getLabelValueAdditionalAutocompleteData,
  getDefaultValueOptions,
} from "widgets/Antd/tools";
import { PropertyControlType } from "components/propertyControls";
import { PropertyPaneConfig } from "constants/PropertyControlConstants";
import { merge } from "lodash";

// 如果是对象，递归可选
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// DeepPartial<WidgetConfiguration>
export const DEFAULT_CONFIG = {
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      defaultValue: DynamicHeight.AUTO_HEIGHT,
      active: true,
    },
  },
  defaults: {
    labelTextSize: "0.875rem",
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    errorMessage: "必填字段",
    rows: 8,
    columns: 20,
    labelPosition: AntdLabelPosition.Auto,
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    labelText: "标签",
    labelAlignment: "right",
    labelWidth: 6,
    widgetName: "Input",
    version: 1,
    defaultText: "",
    iconAlign: "left",
    autoFocus: false,
    labelStyle: "",
    resetOnSubmit: true,
    animateLoading: false,
    controlSize: "middle",
    fieldNames: {
      value: "value",
      label: "label",
      options: "options",
      children: "children",
    },
  },
};

export const FORM_LABEL_CONTENT_CONFIG = {
  sectionName: "标签",
  children: [
    {
      helpText: "设置组件标签文本",
      propertyName: "labelText",
      label: "文本",
      controlType: "INPUT_TEXT",
      placeholderText: "名称：",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
    },
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
      // hidden: (props: AntdInputWidgetProps) =>
      //   props.labelPosition !== AntdLabelPosition.Left,
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
      hidden: (props: AntdInputWidgetProps) =>
        props.labelPosition !== AntdLabelPosition.Left,
      dependencies: ["labelPosition"],
    },
  ],
};
export const DEFAULT_STYLE_PANEL_CONFIG = [
  {
    sectionName: "属性",
    children: [
      {
        propertyName: "controlSize",
        label: "尺寸",
        controlType: "ICON_TABS",
        helpText: "设置控件的大小",
        defaultValue: "middle",
        options: [
          { label: "小", value: "small" },
          { label: "中等", value: "middle" },
          { label: "大", value: "large" },
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },
        dependencies: ["type"],
        //ANTD_TREE_WIDGET、ANTD_SWITCH_WIDGET ANTD_TEXT_WIDGET ANTD_SLIDER_WIDGET 不显示
        hidden: (props: any) =>
          [
            "ANTD_SLIDER_WIDGET",
            "ANTD_TREE_WIDGET",
            "ANTD_SWITCH_WIDGET",
            "ANTD_TEXT_WIDGET",
          ].includes(props.type),
      },
      {
        propertyName: "controlSize",
        label: "尺寸",
        controlType: "ICON_TABS",
        helpText: "设置控件的大小",
        defaultValue: "middle",
        options: [
          { label: "小", value: "small" },
          { label: "标准", value: "default" },
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },
        dependencies: ["type"],
        //ANTD_SWITCH_WIDGET 显示
        hidden: (props: any) => !["ANTD_SWITCH_WIDGET"].includes(props.type),
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
    sectionName: "轮廓样式",
    children: [
      {
        propertyName: "accentColor",
        label: "强调色",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        //ANTD_SWITCH_WIDGET 显示
        hidden: (props: any) => !["ANTD_SWITCH_WIDGET"].includes(props.type),
      },
      // hoverColor
      {
        propertyName: "hoverColor",
        label: "悬停颜色",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (props: any) => !["ANTD_SWITCH_WIDGET"].includes(props.type),
      },

      {
        propertyName: "borderRadius",
        label: "边框圆角",
        helpText: "边框圆角样式",
        controlType: "BORDER_RADIUS_OPTIONS",

        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        //ANTD_TREE_WIDGET、ANTD_SWITCH_WIDGET 不显示
        hidden: (props: any) =>
          [
            "ANTD_TREE_WIDGET",
            "ANTD_SWITCH_WIDGET",
            "ANTD_TEXT_WIDGET",
          ].includes(props.type),
      },
      {
        propertyName: "boxShadow",
        label: "阴影",
        helpText: "组件轮廓投影",
        controlType: "BOX_SHADOW_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (props: any) => ["ANTD_TEXT_WIDGET"].includes(props.type),
      },
    ],
  },
];

export const INSTANCE_INVALID_VALUE = () => +new Date();

export const getDefaultValueDropdownPropConfig = (config?: DeepPartial<PropertyPaneConfig>,) => {
  return merge({
    helpText: "设置默认值",
    propertyName: "defaultValue",
    label: "默认值",
    controlType: "DROP_DOWN",
    placeholderText: "请选择默认值",
    isBindProperty: true,
    isTriggerProperty: false,
    isJSConvertible: true,
    options: getDefaultValueOptions,
    validation: {
      type: ValidationTypes.TEXT,
    },
    hidden: (props: any) => {
      return ["ANTD_SLIDER_WIDGET", "ANTD_TREE_WIDGET"].includes(props.type);
    },
  }, config);
}

export const getFieldNamesPropConfig = (
  type: "value" | "label" | "options" | "children",
  config?: DeepPartial<PropertyPaneConfig>,
) => {
  const typeConfigMap = {
    value: {
      helpText: "选择或设置来自源数据的字段作为数值",
      propertyName: "fieldNames.value",
      label: "Value Key",
    },
    label: {
      helpText: "选择或设置来自源数据的字段作为显示标签",
      propertyName: "fieldNames.label",
      label: "Label Key",
    },
    options: {
      helpText: "选择或设置来自源数据的字段作为选项",
      propertyName: "fieldNames.options",
      label: "Options Key",
    },
    children: {
      helpText: "选择或设置来自源数据的字段作为子选项",
      propertyName: "fieldNames.children",
      label: "Children Key",
    },
  };
  // 深度合并
  const cfg = merge(
    {
      helpText: "选择或设置来自源数据的字段作为显示标签",
      propertyName: "valueKey",
      label: "Value Key",
      dropdownUsePropertyValue: true,
      controlType: "DROP_DOWN",
      customJSControl: "WRAPPED_CODE_EDITOR",
      controlConfig: {
        wrapperCode: {
          prefix: getOptionLabelValueExpressionPrefix,
          suffix: optionLabelValueExpressionSuffix,
        },
      },
      placeholderText: "value",
      isBindProperty: true,
      isTriggerProperty: false,
      isJSConvertible: true,
      evaluatedDependencies: ["options"],
      options: getLabelValueKeyOptions,
      alwaysShowSelected: true,
      validation: {
        type: ValidationTypes.FUNCTION,
        params: {
          fnString: labelKeyValidation.toString(),
          expected: {
            type: "String",
            example: `value`,
            autocompleteDataType: AutocompleteDataType.STRING,
          },
        },
        dependentPaths: ["options"],
      },
      additionalAutoComplete: getLabelValueAdditionalAutocompleteData,
      hidden: (props: any) => {
        console.log("getFieldNamesPropConfig hidden", props);

        // options 可能是 json需要先转换为对象
        let options = props.options;
        try {
          if (typeof options === "string") {
            options = JSON.parse(options);
          }
        } catch (error) {}
        // 如果 type 不为 labelh或者 value，且 options 中的 key 数量小于等于 2，则隐藏
        if (
          type !== "label" &&
          type !== "value" &&
          options &&
          Array.isArray(options)
        ) {
          // 查找options对象数组中 key 最多的一个对象
          const maxKeyLength =
            options?.reduce((max, option) => {
              return Math.max(max, Object.keys(option)?.length);
            }, 0) || Object.keys(options[0])?.length;
          if (maxKeyLength <= 2) {
            return true;
          }
        }

        return false;
      },
    },
    typeConfigMap[type],
    config
  );

  console.log("getFieldNamesPropConfig", cfg);

  return cfg;
};
