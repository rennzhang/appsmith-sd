import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { ValidationTypes } from "constants/WidgetValidation";
import { DynamicHeight } from "utils/WidgetFeatures";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetConfiguration } from "widgets/constants";
import type { AntdInputWidgetProps } from "../InputWidget/types";

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
    label: "标签",
    widgetName: "Input",
    version: 1,
    defaultText: "",
    iconAlign: "left",
    autoFocus: false,
    labelStyle: "",
    resetOnSubmit: true,
    animateLoading: false,
    controlSize: "millde",
  },
};

export const FORM_LABEL_CONTENT_CONFIG = {
  sectionName: "标签",
  children: [
    {
      helpText: "设置组件标签文本",
      propertyName: "label",
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
          {
            label: "小",
            value: "small",
          },
          {
            label: "中等",
            value: "middle",
          },
          {
            label: "大",
            value: "large",
          },
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },
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
        invisible: true,
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
      },
    ],
  },
];

export const INSTANCE_INVALID_VALUE = () => +new Date();
