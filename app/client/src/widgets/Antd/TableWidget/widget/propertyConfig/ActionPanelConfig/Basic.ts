import { ValidationTypes } from "constants/WidgetValidation";
import {
  ButtonTypes,
  ColumnTypes,
  type TableWidgetProps,
} from "../../../constants";

import {
  hideByColumnType,
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
import configureMenuItemsConfig from "./childPanels/configureMenuItemsConfig";
import { composePropertyUpdateHook } from "widgets/WidgetUtils";

export default {
  sectionName: "属性",
  children: [
    {
      propertyName: "columnType",
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
      dependencies: ["columnActions", "childStylesheet", "editingActions"],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      propertyName: "iconName",
      label: "图标",
      helpText: "设置按钮图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.BUTTON]);
      },

      updateHook: updateIconAlignment,
      dependencies: ["columnActions", "columnType", "editingActions"],
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
      label: "图标",
      helpText: "设置按钮图标",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.MENU_BUTTON]);
      },

      updateHook: updateIconAlignment,
      dependencies: ["columnActions", "columnType", "editingActions"],
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
        return hideByColumnType(props, propertyPath, [ColumnTypes.ICON_BUTTON]);
      },
      updateHook: updateIconAlignment,
      dependencies: ["columnActions", "columnType", "editingActions"],
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
        return hideByColumnType(props, propertyPath, [ColumnTypes.BUTTON]);
      },
      dependencies: ["columnActions", "editingActions"],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      propertyName: "menuButtonLabel",
      label: "文本",
      helpText: "菜单按钮文本内容",
      placeholderText: "菜单按钮文本内容",
      controlType: "TABLE_COMPUTE_VALUE",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.MENU_BUTTON]);
      },
      dependencies: ["columnActions", "editingActions"],
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
      dependencies: ["columnActions", "editingActions"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.MENU_BUTTON]);
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
      dependencies: ["columnActions", "rowSelectionActions", "editingActions"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        if (propertyPath.includes("editingActions")) {
          return true;
        }
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.BUTTON,
          ColumnTypes.ICON_BUTTON,
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
      dependencies: ["columnActions", "rowSelectionActions", "editingActions"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        if (propertyPath.includes("editingActions")) {
          return true;
        }
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.BUTTON,
          ColumnTypes.ICON_BUTTON,
        ]);
      },
    },
    // {
    //   propertyName: "menuItemsSource",
    //   helpText: "菜单配置",
    //   label: "菜单项",
    //   controlType: "ICON_TABS",
    //   fullWidth: true,
    //   defaultValue: MenuItemsSource.STATIC,
    //   options: [
    //     {
    //       label: "静态",
    //       value: MenuItemsSource.STATIC,
    //     },
    //     {
    //       label: "动态",
    //       value: MenuItemsSource.DYNAMIC,
    //     },
    //   ],
    //   isJSConvertible: false,
    //   isBindProperty: false,
    //   isTriggerProperty: false,
    //   validation: { type: ValidationTypes.TEXT },
    //   updateHook: updateMenuItemsSource,
    //   dependencies: [
    //     "columnActions",
    //     "columnOrder",
    //     "menuSourceData",
    //     "configureMenuItems",
    //   ],

    //   hidden: (props: TableWidgetProps, propertyPath: string) => {
    //     return hideByColumnType(
    //       props,
    //       propertyPath,
    //       [ColumnTypes.MENU_BUTTON],
    //       false,
    //     );
    //   },
    // },
    // {
    //   helpText: "下拉菜单项数据",
    //   propertyName: "menuSourceData",
    //   label: "下拉菜单数据",
    //   controlType: "TABLE_COMPUTE_VALUE",
    //   placeholderText: "{{Query1.data}}",
    //   isBindProperty: true,
    //   isTriggerProperty: false,
    //   validation: {
    //     type: ValidationTypes.FUNCTION,
    //     params: {
    //       expected: {
    //         type: "Array of values",
    //         example: `['option1', 'option2'] | [{ "label": "label1", "value": "value1" }]`,
    //         autocompleteDataType: AutocompleteDataType.ARRAY,
    //       },
    //       fn: sourceDataArrayValidation,
    //     },
    //   },
    //   evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
    //   hidden: (props: TableWidgetProps, propertyPath: string) => {
    //     return (
    //       hideByColumnType(
    //         props,
    //         propertyPath,
    //         [ColumnTypes.MENU_BUTTON],
    //         false,
    //       ) ||
    //       hideByMenuItemsSource(props, propertyPath, MenuItemsSource.STATIC)
    //     );
    //   },
    //   dependencies: ["columnActions", "menuItemsSource", "menuSourceData"],
    // },
    {
      helpText: "菜单项配置",
      propertyName: "configureMenuItems",
      controlType: "OPEN_CONFIG_PANEL",
      buttonConfig: {
        label: "Configure",
        icon: "settings-2-line",
      },
      label: "Configure menu items",
      isBindProperty: false,
      isTriggerProperty: false,
      hidden: (props: TableWidgetProps, propertyPath: string) =>
        hideByColumnType(
          props,
          propertyPath,
          [ColumnTypes.MENU_BUTTON],
          false,
        ) ||
        hideIfMenuItemsSourceDataIsFalsy(props, propertyPath) ||
        hideByMenuItemsSource(props, propertyPath, MenuItemsSource.STATIC),
      dependencies: [
        "columnActions",
        "columnOrder",
        "menuItemsSource",
        "menuSourceData",
      ],
      panelConfig: configureMenuItemsConfig,
    },
    {
      helpText: "Menu items",
      propertyName: "menuItems",
      controlType: "MENU_ITEMS",
      label: "Menu items",
      isBindProperty: false,
      isTriggerProperty: false,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return (
          hideByColumnType(
            props,
            propertyPath,
            [ColumnTypes.MENU_BUTTON],
            false,
          ) ||
          hideByMenuItemsSource(props, propertyPath, MenuItemsSource.DYNAMIC)
        );
      },
      dependencies: ["columnActions", "rowSelectionActions", "editingActions"],
      panelConfig: {
        editableTitle: true,
        titlePropertyName: "label",
        panelIdPropertyName: "id",
        dependencies: [
          "columnActions",
          "rowSelectionActions",
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
                  "editingActions",
                ],
              },
              {
                helpText: "点击菜单项时触发",
                propertyName: "onClick",
                label: "onClick",
                controlType: "ACTION_SELECTOR",
                isJSConvertible: true,
                isBindProperty: true,
                isTriggerProperty: true,
                dependencies: [
                  "columnActions",
                  "rowSelectionActions",
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
                  "editingActions",
                ],
              },
            ],
          },
        ],
      },
    },
    {
      helpText: "点击按钮时触发",
      propertyName: "onBtnClick",
      label: "onClick",
      controlType: "ACTION_SELECTOR",
      additionalAutoComplete: (props: TableWidgetProps) => ({
        currentRow: Object.assign(
          {},
          ...Object.keys(props.columnActions).map((key) => ({
            [key]: "",
          })),
        ),
      }),
      isJSConvertible: true,
      dependencies: ["columnActions", "rowSelectionActions", "editingActions"],
      isBindProperty: true,
      isTriggerProperty: true,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return !hideByColumnType(props, propertyPath, [
          ColumnTypes.MENU_BUTTON,
        ]);
      },
    },
  ],
};
