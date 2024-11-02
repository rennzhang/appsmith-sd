import { ValidationTypes } from "constants/WidgetValidation";
import {
  ButtonTypes,
  ColumnTypes,
  type TableWidgetProps,
} from "../../../constants";

import {
  hideByButtonType,
  hideByMenuItemsSource,
  hideIfMenuItemsSourceDataIsFalsy,
  updateIconAlignment,
  updateMenuItemsSource,
  updateNumberColumnTypeTextAlignment,
  updateThemeStylesheetsInColumns,
} from "../../propertyUtils";
import { IconNames } from "@blueprintjs/icons";
import {
  ICON_NAMES,
  MenuItemsSource,
} from "widgets/MenuButtonWidget/constants";
import MenuItemsConfig from "./childPanels/MenuItemsConfig";
import { composePropertyUpdateHook } from "widgets/WidgetUtils";

export default {
  sectionName: "属性",
  children: [
    {
      propertyName: "buttonType",
      label: "按钮类型",
      helpText: "设置按钮类型，文本按钮、图标按钮、菜单按钮",
      controlType: "DROP_DOWN",
      options: (props: TableWidgetProps) => {
        const options = [
          {
            label: "文本按钮",
            value: ButtonTypes.BUTTON,
          },

          {
            label: "图标按钮",
            value: ButtonTypes.ICON_BUTTON,
          },
        ];
        if (!props.dataTreePath.includes("editingActions")) {
          options.push({
            label: "菜单按钮",
            value: ButtonTypes.MENU_BUTTON,
          });
        }
        return options;
      },
      defaultValue: ButtonTypes.BUTTON,
      updateHook: composePropertyUpdateHook([
        updateNumberColumnTypeTextAlignment,
        updateThemeStylesheetsInColumns,
        updateMenuItemsSource,
      ]),
      dependencies: [
        "columnActions",
        "childStylesheet",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
      ],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      propertyName: "iconName",
      label: "图标",
      helpText: "设置按钮图标",

      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.BUTTON]);
      },

      updateHook: updateIconAlignment,
      dependencies: [
        "columnActions",
        "buttonType",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
      ],
      controlType: "ICON_SELECT",
      customJSControl: "TABLE_COMPUTE_VALUE",
      defaultIconName: "",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TEXT,
      },
    },
    // menuIconName
    {
      propertyName: "menuIconName",
      label: "菜单图标",
      helpText: "设置菜单按钮图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.MENU_BUTTON]);
      },

      updateHook: updateIconAlignment,
      dependencies: [
        "columnActions",
        "buttonType",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
      ],
      controlType: "ICON_SELECT",
      customJSControl: "TABLE_COMPUTE_VALUE",
      defaultIconName: "",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.TEXT,
        },
      },
    },
    {
      propertyName: "btnIconName",
      label: "按钮图标",
      helpText: "设置按钮图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.ICON_BUTTON]);
      },
      updateHook: updateIconAlignment,
      dependencies: [
        "columnActions",
        "buttonType",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
      ],
      controlType: "ICON_SELECT",
      customJSControl: "TABLE_COMPUTE_VALUE",
      defaultIconName: "add",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.TEXT,
        },
      },
    },
    {
      propertyName: "buttonLabel",
      label: "文本",
      placeholderText: "按钮文本内容",
      helpText: "按钮文本内容",
      controlType: "TABLE_COMPUTE_VALUE",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.BUTTON]);
      },
      dependencies: [
        "columnActions",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
        "toolBarActions",
        ,
        "rowSelectionActions",
        "toolBarActions",
      ],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      propertyName: "menuButtonLabel",
      label: "文本",
      helpText: "菜单按钮文本内容",
      placeholderText: "菜单按钮文本内容",
      defaultValue: undefined,
      controlType: "TABLE_COMPUTE_VALUE",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.MENU_BUTTON]);
      },
      dependencies: [
        "columnActions",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
        "toolBarActions",
        ,
        "rowSelectionActions",
        "toolBarActions",
      ],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      helpText: "菜单按钮鼠标悬浮时显示的提示信息",
      propertyName: "menuTooltip",
      label: "提示",
      controlType: "INPUT_TEXT",
      placeholderText: "提交表单",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      dependencies: [
        "columnActions",
        "editingActions",
        "rowSelectionActions",
        "toolBarActions",
        "toolBarActions",
        ,
        "rowSelectionActions",
        "toolBarActions",
      ],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByButtonType(props, propertyPath, [ButtonTypes.MENU_BUTTON]);
      },
    },
    {
      helpText: "按钮鼠标悬浮时显示的提示信息",
      propertyName: "tooltip",
      label: "提示",
      controlType: "INPUT_TEXT",
      placeholderText: "提交表单",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      dependencies: [
        "columnActions",
        "rowSelectionActions",
        "toolBarActions",
        "editingActions",
      ],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        if (propertyPath.includes("editingActions")) {
          return true;
        }
        return hideByButtonType(props, propertyPath, [
          ButtonTypes.BUTTON,
          ButtonTypes.ICON_BUTTON,
        ]);
      },
    },
    {
      helpText: "点击按钮时二次确认提示",
      propertyName: "popconfirmMessage",
      label: "确认提示",
      controlType: "INPUT_TEXT",
      placeholderText: "确认操作吗？",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      dependencies: [
        "columnActions",
        "rowSelectionActions",
        "toolBarActions",
        "editingActions",
      ],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        if (propertyPath.includes("editingActions")) {
          return true;
        }
        return hideByButtonType(props, propertyPath, [
          ButtonTypes.BUTTON,
          ButtonTypes.ICON_BUTTON,
        ]);
      },
    },
    {
      helpText: "菜单项配置",
      propertyName: "configureMenuItems",
      controlType: "OPEN_CONFIG_PANEL",
      buttonConfig: {
        label: "配置",
        icon: "settings-2-line",
      },
      label: "配置菜单项",
      isBindProperty: false,
      isTriggerProperty: false,
      hidden: (props: TableWidgetProps, propertyPath: string) =>
        hideByButtonType(
          props,
          propertyPath,
          [ButtonTypes.MENU_BUTTON],
          false,
        ) ||
        hideIfMenuItemsSourceDataIsFalsy(props, propertyPath) ||
        hideByMenuItemsSource(props, propertyPath, MenuItemsSource.STATIC),
      dependencies: ["columnActions", "columnOrder", "menuItemsSource"],
      panelConfig: MenuItemsConfig,
    },
    {
      helpText: "菜单项",
      propertyName: "menuItems",
      controlType: "MENU_ITEMS",
      label: "菜单项",
      isBindProperty: false,
      isTriggerProperty: false,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return (
          hideByButtonType(
            props,
            propertyPath,
            [ButtonTypes.MENU_BUTTON],
            false,
          ) ||
          hideByMenuItemsSource(props, propertyPath, MenuItemsSource.DYNAMIC)
        );
      },
      dependencies: [
        "columnActions",
        "rowSelectionActions",
        "toolBarActions",
        "editingActions",
      ],
      panelConfig: {
        editableTitle: true,
        titlePropertyName: "label",
        panelIdPropertyName: "id",
        dependencies: [
          "columnActions",
          "rowSelectionActions",
          "toolBarActions",
          "editingActions",
        ],
        contentChildren: [
          {
            sectionName: "属性",
            children: [
              {
                propertyName: "label",
                helpText: "设置菜单项标签",
                label: "文本",
                controlType: "INPUT_TEXT",
                placeholderText: "请输入标签",
                isBindProperty: true,
                isTriggerProperty: false,
                validation: { type: ValidationTypes.TEXT },
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
              {
                helpText: "点击菜单项时触发",
                propertyName: "onBtnClick",
                label: "onClick",
                controlType: "ACTION_SELECTOR",
                isJSConvertible: true,
                isBindProperty: true,
                isTriggerProperty: true,
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
            ],
          },
          {
            sectionName: "属性",
            children: [
              {
                propertyName: "isVisible",
                helpText: "控制组件的显示/隐藏",
                label: "是否显示",
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
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
              {
                propertyName: "isDisabled",
                helpText: "让组件不可交互",
                label: "禁用",
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
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
            ],
          },
        ],
        styleChildren: [
          {
            sectionName: "图标配置",
            children: [
              {
                propertyName: "iconName",
                label: "图标",
                helpText: "设置菜单项的图标",
                controlType: "ICON_SELECT",
                isBindProperty: false,
                isTriggerProperty: false,
                validation: { type: ValidationTypes.TEXT },
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
              {
                propertyName: "iconAlign",
                label: "位置",
                helpText: "设置菜单项图标对齐方向",
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
                validation: { type: ValidationTypes.TEXT },
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
            ],
          },
          {
            sectionName: "颜色配置",
            children: [
              {
                propertyName: "textColor",
                helpText: "设置菜单项文本颜色",
                label: "文本颜色",
                controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
                isJSConvertible: true,
                isBindProperty: true,
                isTriggerProperty: false,
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
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
                propertyName: "backgroundColor",
                helpText: "设置菜单项背景颜色",
                label: "背景颜色",
                controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
                customJSControl: "TABLE_COMPUTE_VALUE",
                isJSConvertible: true,
                isBindProperty: true,
                isTriggerProperty: false,
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
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
                propertyName: "iconColor",
                helpText: "设置菜单项图标颜色",
                label: "图标颜色",
                controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
                isBindProperty: false,
                isTriggerProperty: false,
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
                  "toolBarActions",
                  "editingActions",
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};
