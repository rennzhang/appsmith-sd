import { ValidationTypes } from "constants/WidgetValidation";

import { hideByColumnType } from "../../propertyUtils";
import Basic from "./Basic";
import {
  ButtonTypes,
  ColumnTypes,
  type TableWidgetProps,
} from "../../../constants";
import ButtonWidget from "widgets/Antd/ButtonWidget/widget";
export default {
  editableTitle: true,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  dependencies: ["columnActions", "editingActions"],
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
    // GeneralStyle,
    {
      sectionName: "图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        // if (propertyPath.includes("editingActions")) {
        //   return true;
        // }
        console.log("图标props", props, propertyPath);

        return hideByColumnType(props, propertyPath + ".columnType", [
          ColumnTypes.BUTTON,
          ColumnTypes.MENU_BUTTON,
        ]);
      },
      dependencies: ["columnActions", "columnType", "editingActions"],
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
          dependencies: ["columnActions", "editingActions"],
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
            return hideByColumnType(props, path, [
              ColumnTypes.BUTTON,
              ColumnTypes.MENU_BUTTON,
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
          dependencies: ["columnActions", "editingActions"],
          isBindProperty: true,
        },
        {
          propertyName: "textColor",
          label: "文本颜色",
          helpText: "按钮文本颜色",
          controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
          isJSConvertible: true,
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: ["columnActions", "editingActions"],
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
            return hideByColumnType(props, path, [
              ColumnTypes.BUTTON,
              ColumnTypes.MENU_BUTTON,
            ]);
          },
        },
      ],
    },
  ],
};
