import { ValidationTypes } from "constants/WidgetValidation";
import { updateColumnStyles } from "../propertyUtils";

export default [
  {
    sectionName: "属性",
    children: [
      {
        propertyName: "compactMode",
        helpText: "选择行高",
        label: "默认行高",
        controlType: "ICON_TABS",
        fullWidth: true,
        defaultValue: "middle",
        isBindProperty: true,
        isTriggerProperty: false,
        options: [
          {
            label: "宽松",
            value: "large",
          },

          {
            label: "默认",
            value: "middle",
          },
          {
            label: "紧凑",
            value: "small",
          },
        ],
      },
    ],
  },
  // 分页器
  {
    sectionName: "分页器",
    children: [
      // size
      {
        helpText: "选择分页器大小",
        propertyName: "paginationSize",
        label: "分页器大小",
        controlType: "ICON_TABS",
        fullWidth: true,
        defaultValue: "default",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "小",
            value: "small",
          },
        ],
      },
      // hideOnSinglePage
      {
        helpText: "是否在单页时隐藏分页器",
        propertyName: "hideOnSinglePage",
        label: "隐藏单页",
        controlType: "SWITCH",
        defaultValue: false,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      // showTitle
      {
        helpText: "是否启用快速跳转至某页功能",
        propertyName: "showQuickJumper",
        label: "快速跳转",
        controlType: "SWITCH",
        defaultValue: false,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      // simple
      {
        helpText: "是否启用简单模式",
        propertyName: "simplePagination",
        label: "简单模式",
        controlType: "SWITCH",
        defaultValue: false,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      // showSizeChanger
      {
        helpText: "是否展示 pageSize 切换器",
        propertyName: "showSizeChanger",
        label: "显示切换器",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        validation: { type: ValidationTypes.BOOLEAN },
      },
    ],
  },
  // 文本样式
  {
    sectionName: "文本样式",
    children: [
      {
        propertyName: "textSize",
        label: "字体大小",
        helpText: "Controls the size of text in the column",
        controlType: "DROP_DOWN",
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
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
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "fontStyle",
        label: "强调",
        helpText: "Controls the style of the text in the column",
        controlType: "BUTTON_GROUP",
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
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
      {
        propertyName: "horizontalAlignment",
        label: "文本对齐方式",
        helpText: "Sets the horizontal alignment of the content in the column",
        controlType: "ICON_TABS",
        fullWidth: true,
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
        options: [
          {
            startIcon: "align-left",
            value: "LEFT",
          },
          {
            startIcon: "align-center",
            value: "CENTER",
          },
          {
            startIcon: "align-right",
            value: "RIGHT",
          },
        ],
        defaultValue: "LEFT",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ["LEFT", "CENTER", "RIGHT"],
          },
        },
      },
      {
        propertyName: "verticalAlignment",
        label: "垂直对齐",
        helpText: "Sets the vertical alignment of the content in the column",
        controlType: "ICON_TABS",
        fullWidth: true,
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
        options: [
          {
            startIcon: "vertical-align-top",
            value: "TOP",
          },
          {
            startIcon: "vertical-align-middle",
            value: "CENTER",
          },
          {
            startIcon: "vertical-align-bottom",
            value: "BOTTOM",
          },
        ],
        defaultValue: "CENTER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ["TOP", "CENTER", "BOTTOM"],
          },
        },
      },
    ],
  },
  {
    sectionName: "颜色配置",
    children: [
      // 表格背景颜色
      {
        propertyName: "tableBackground",
        label: "表格背景颜色",
        helpText: "表格背景颜色",
        controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        customJSControl: "TABLE_COMPUTE_VALUE",
        validation: {
          type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
          params: {
            type: ValidationTypes.TEXT,
            params: {
              regex: /^(?![<|{{]).+/,
            },
          },
        },
      },
      {
        propertyName: "cellBackground",
        label: "单元格背景颜色",
        helpText: "单元格背景颜色",
        controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        customJSControl: "TABLE_COMPUTE_VALUE",

        validation: {
          type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
          params: {
            type: ValidationTypes.TEXT,
            params: {
              regex: /^(?![<|{{]).+/,
            },
          },
        },
      },
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
        propertyName: "textColor",
        label: "文本颜色",
        helpText: "Controls the color of text in the column",
        controlType: "COLOR_PICKER",
        updateHook: updateColumnStyles,
        dependencies: ["primaryColumns"],
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
      // cardBorderedSearch antd protable 的功能
      {
        propertyName: "cardBorderedSearch",
        helpText: "是否显示搜索表单卡片边框",
        label: "表单卡片边框",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: false,
      },
      // cardBorderedTable
      {
        propertyName: "cardBorderedTable",
        helpText: "是否显示搜索表单卡片边框",
        label: "表单卡片边框",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: false,
      },
      // headerBorderRadius
      {
        propertyName: "headerBorderRadius",
        label: "表头圆角",
        helpText: "表头圆角样式",
        controlType: "BORDER_RADIUS_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
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
      {
        helpText: "使用 html 颜色名称，HEX，RGB 或者 RGBA 值",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        propertyName: "borderColor",
        label: "边框颜色",
        controlType: "COLOR_PICKER",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        helpText: "请输入边框宽度",
        propertyName: "borderWidth",
        label: "边框宽度",
        placeholderText: "以 px 为单位",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
      },
    ],
  },
];
