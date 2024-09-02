import { ValidationTypes } from "constants/WidgetValidation";
import { ButtonPlacementTypes, ButtonVariantTypes } from "components/constants";
import { Alignment } from "@blueprintjs/core";
import type { MenuButtonWidgetProps } from "../../constants";

export default [
  {
    sectionName: "属性",
    children: [
      {
        propertyName: "buttonVariant",
        label: "按钮类型",
        controlType: "ICON_TABS",
        helpText: "设置菜单按钮的风格类型",
        options: [
          {
            label: "主按钮",
            value: ButtonVariantTypes.PRIMARY,
          },
          {
            label: "次级按钮",
            value: ButtonVariantTypes.SECONDARY,
          },
          {
            label: "文本按钮",
            value: ButtonVariantTypes.TERTIARY,
          },
        ],
        defaultValue: ButtonVariantTypes.SECONDARY,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: [
              ButtonVariantTypes.PRIMARY,
              ButtonVariantTypes.SECONDARY,
              ButtonVariantTypes.TERTIARY,
            ],
            default: ButtonVariantTypes.PRIMARY,
          },
        },
      },
      {
        propertyName: "buttonSize",
        label: "按钮大小",
        controlType: "ICON_TABS",
        helpText: "设置菜单按钮的尺寸大小",
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
        // isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },
      },
    ],
  },
  {
    sectionName: "图标配置",
    children: [
      {
        propertyName: "iconName",
        label: "图标",
        helpText: "设置菜单按钮图标",
        controlType: "ICON_SELECT",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        updateHook: (
          props: MenuButtonWidgetProps,
          propertyPath: string,
          propertyValue: string,
        ) => {
          const propertiesToUpdate = [{ propertyPath, propertyValue }];
          if (!props.iconAlign) {
            propertiesToUpdate.push({
              propertyPath: "iconAlign",
              propertyValue: Alignment.LEFT,
            });
          }
          return propertiesToUpdate;
        },
        dependencies: ["iconAlign"],
        validation: {
          type: ValidationTypes.TEXT,
        },
      },

      {
        propertyName: "iconSize",
        helpText: "设置图标大小",
        label: "图标大小",
        controlType: "INPUT_TEXT",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
        defaultValue: "16",
        // 当 isDragger == true 时，显示该配置
        hidden: (props: MenuButtonWidgetProps) => {
          return !props.isDragger;
        },
        dependencies: ["isDragger"],
      },
      {
        propertyName: "iconAlign",
        label: "位置",
        helpText: "设置菜单按钮图标对齐方式",
        controlType: "ICON_TABS",
        defaultValue: "left",
        fullWidth: false,
        options: [
          {
            startIcon: "skip-left-line",
            value: "left",
          },
          {
            startIcon: "skip-right-line",
            value: "right",
          },
        ],
        isBindProperty: false,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ["center", "left", "right"],
          },
        },
      },
      {
        propertyName: "placement",
        label: "排列方式",
        controlType: "DROP_DOWN",
        helpText: "设置图标与标签的排列方式",
        options: [
          {
            label: "向前对齐",
            value: ButtonPlacementTypes.START,
          },
          {
            label: "两边对齐",
            value: ButtonPlacementTypes.BETWEEN,
          },
          {
            label: "居中对齐",
            value: ButtonPlacementTypes.CENTER,
          },
        ],
        defaultValue: ButtonPlacementTypes.CENTER,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: [
              ButtonPlacementTypes.START,
              ButtonPlacementTypes.BETWEEN,
              ButtonPlacementTypes.CENTER,
            ],
            default: ButtonPlacementTypes.CENTER,
          },
        },
      },
    ],
  },
  {
    sectionName: "颜色配置",
    children: [
      {
        propertyName: "buttonColor",
        helpText: "设置按钮颜色",
        label: "按钮颜色",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      // textColor
      {
        propertyName: "textColor",
        helpText: "设置文本颜色",
        label: "文本颜色",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: "#ffffff",
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "iconColor",
        helpText: "设置图标颜色",
        label: "图标颜色",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: "#ffffff",
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "轮廓样式",
    children: [
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
