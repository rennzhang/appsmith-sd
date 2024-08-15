import { ValidationTypes } from "constants/WidgetValidation";
import { ColumnTypes, ICON_NAMES } from "widgets/TableWidgetV2/constants";
import { hideByColumnType, updateIconAlignment } from "../../propertyUtils";
import Basic from "./Basic";
import type { TableWidgetProps } from "../../../constants";

export default {
  editableTitle: true,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  dependencies: ["columnActions"],
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
          dependencies: ["columnActions", "columnOrder"],
        },
        {
          propertyName: "isDisabled",
          label: "禁用",
          helpText: "控制当前按钮是否显示",
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
          dependencies: ["columnActions", "columnOrder"],
        },
      ],
    },
  ],
  styleChildren: [
    // GeneralStyle,
    {
      sectionName: "图标",
      children: [
        {
          propertyName: "menuButtoniconName",
          label: "菜单按钮图标",
          helpText: "设置菜单按钮图标",
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.MENU_BUTTON,
            ]);
          },
          updateHook: updateIconAlignment,
          dependencies: ["columnActions"],
          controlType: "ICON_SELECT",
          customJSControl: "TABLE_COMPUTE_VALUE",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: ICON_NAMES,
              },
            },
          },
        },
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
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.MENU_BUTTON,
            ]);
          },
          dependencies: ["columnActions"],
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
      sectionName: "Alignment",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(
          props,
          propertyPath,
          [ColumnTypes.CHECKBOX, ColumnTypes.SWITCH],
          true,
        );
      },
      children: [
        {
          propertyName: "horizontalAlignment",
          label: "水平对齐",
          helpText: "设置水平对齐方式",
          controlType: "ICON_TABS",
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
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: ["columnActions"],
          isBindProperty: true,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: ["LEFT", "CENTER", "RIGHT"],
              },
            },
          },
          isTriggerProperty: false,
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.TEXT,
              ColumnTypes.DATE,
              ColumnTypes.NUMBER,
              ColumnTypes.URL,
              ColumnTypes.CHECKBOX,
              ColumnTypes.SWITCH,
            ]);
          },
        },
        {
          propertyName: "verticalAlignment",
          label: "垂直对齐",
          helpText: "设置垂直对齐方式",
          controlType: "ICON_TABS",
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
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: ["columnActions"],
          isBindProperty: true,
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: ["TOP", "CENTER", "BOTTOM"],
              },
            },
          },
          isTriggerProperty: false,
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.TEXT,
              ColumnTypes.DATE,
              ColumnTypes.NUMBER,
              ColumnTypes.URL,
              ColumnTypes.CHECKBOX,
              ColumnTypes.SWITCH,
            ]);
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
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return !hideByColumnType(props, propertyPath, [
              ColumnTypes.MENU_BUTTON,
            ]);
          },
          dependencies: ["columnActions"],
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
        },
        {
          propertyName: "menuColor",
          helpText: "设置菜单按钮颜色",
          label: "按钮颜色",
          controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
          customJSControl: "TABLE_COMPUTE_VALUE",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
          validation: {
            type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
            params: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^(?![<|{{]).+/,
              },
            },
          },
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.MENU_BUTTON,
            ]);
          },
          dependencies: ["columnActions", "childStylesheet"],
        },
        {
          propertyName: "textColor",
          label: "文本颜色",
          helpText: "Controls the color of text in the column",
          controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
          isJSConvertible: true,
          customJSControl: "TABLE_COMPUTE_VALUE",
          dependencies: ["columnActions"],
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
          hidden: (props: TableWidgetProps, propertyPath: string) => {
            return hideByColumnType(props, propertyPath, [
              ColumnTypes.TEXT,
              ColumnTypes.DATE,
              ColumnTypes.NUMBER,
              ColumnTypes.URL,
            ]);
          },
        },
      ],
    },
  ],
};
