import { ValidationTypes } from "constants/WidgetValidation";

import { hideByButtonType, hideByColumnType } from "../../propertyUtils";
import Basic from "./Basic";
import {
  ButtonTypes,
  ColumnTypes,
  type TableWidgetProps,
} from "../../../constants";
import ButtonWidget from "widgets/Antd/ButtonWidget/widget";
import { ButtonVariantTypes } from "components/constants";
export default {
  editableTitle: true,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  dependencies: [
    "columnActions",
    "editingActions",
    "rowSelectionActions",
    "toolBarActions",
  ],
  updateHook: (props: any, propertyPath: string, propertyValue: string) => {
    return [
      {
        propertyPath,
        propertyValue,
      },
    ];
  },
  contentChildren: [
    Basic,
    {
      sectionName: "属性",
      children: [
        {
          propertyName: "showButton",
          label: "是否显示按钮",
          helpText: "控制当前按钮是否显示",
          controlType: "SWITCH",
          customJSControl: "TABLE_COMPUTE_VALUE",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.BOOLEAN,
            },
          },
          dependencies: ["columnActions", "columnOrder", "editingActions"],
        },
        {
          propertyName: "isDisabled",
          label: "禁用",
          helpText: "控制当前按钮是否禁用",
          defaultValue: false,
          controlType: "SWITCH",
          customJSControl: "TABLE_COMPUTE_VALUE",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.BOOLEAN,
            },
          },
          dependencies: ["columnActions", "columnOrder", "editingActions"],
        },
      ],
    },
  ],
  // styleChildren: ButtonWidget.getPropertyPaneStyleConfig(),
  styleChildren: [
    // 属性
    {
      sectionName: "属性",
      children: [
        {
          propertyName: "buttonVariant",
          label: "按钮风格",
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
          helpText: "设置按钮的尺寸大小",
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
    // GeneralStyle,
    {
      sectionName: "图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        // if (propertyPath.includes("editingActions")) {
        //   return true;
        // }
        console.log("图标props", props, propertyPath);

        return hideByButtonType(props, propertyPath + ".buttonType", [
          ButtonTypes.BUTTON,
          ButtonTypes.MENU_BUTTON,
        ]);
      },
      dependencies: ["columnActions", "buttonType", "editingActions"],
      children: [
        {
          propertyName: "iconAlign",
          label: "图标位置",
          helpText: "设置按钮图标位置",
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
          dependencies: ["columnActions", "columnType", "editingActions"],
          validation: {
            type: ValidationTypes.TEXT,
            params: {
              allowedValues: ["left", "right"],
            },
          },
        },
      ],
    },
    {
      sectionName: "颜色",
      children: [
        {
          propertyName: "buttonColor",
          label: "按钮颜色",
          controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
          helpText: "设置按钮颜色",
          isJSConvertible: true,
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: [
            "columnActions",
            "editingActions",
            "rowSelectionActions",
            "toolBarActions",
          ],
          isBindProperty: true,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^(?![<|{{]).+/,
              },
            },
          },
          isTriggerProperty: false,
          hidden: (props: TableWidgetProps, path: string) => {
            return hideByButtonType(props, path, [
              ButtonTypes.BUTTON,
              ButtonTypes.MENU_BUTTON,
            ]);
          },
        },
        // 图标颜色
        {
          propertyName: "iconColor",
          label: "图标颜色",
          helpText: "设置按钮图标颜色",
          controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
          isJSConvertible: true,
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: [
            "columnActions",
            "editingActions",
            "rowSelectionActions",
            "toolBarActions",
          ],
          isBindProperty: true,
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
          isBindProperty: true,
          isJSConvertible: true,
          isTriggerProperty: false,
          defaultValue: "none",
          validation: {
            type: ValidationTypes.TEXT,
          },
        },
        {
          propertyName: "boxShadow",
          label: "阴影",
          helpText: "组件轮廓投影",
          controlType: "BOX_SHADOW_OPTIONS",
          defaultValue: "none",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
        },
      ],
    },
  ],
};
