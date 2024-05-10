import type { PropertyPaneConfig } from "constants/PropertyControlConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { sourceDataArrayValidation } from "widgets/MenuButtonWidget/validations";
import type { MenuButtonWidgetProps } from "../../constants";
import { MenuItemsSource } from "../../constants";
import configureMenuItemsConfig from "./childPanels/configureMenuItemsConfig";
import menuItemsConfig from "./childPanels/menuItemsConfig";
import { updateMenuItemsSource } from "./propertyUtils";
import { HeightControlPaneConfig } from "utils/WidgetFeatures";
export default [
  {
    sectionName: "属性",
    children: [
      {
        propertyName: "label",
        helpText: "设置菜单标签",
        label: "标签",
        controlType: "INPUT_TEXT",
        placeholderText: "Open",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },

      {
        propertyName: "menuItemsSource",
        helpText: "设置菜单项数据源",
        label: "菜单项数据源",
        controlType: "ICON_TABS",
        defaultValue: MenuItemsSource.STATIC,
        fullWidth: true,
        options: [
          {
            label: "静态",
            value: MenuItemsSource.STATIC,
          },
          {
            label: "动态",
            value: MenuItemsSource.DYNAMIC,
          },
        ],
        isJSConvertible: false,
        isBindProperty: false,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        updateHook: updateMenuItemsSource,
        dependencies: ["sourceData", "configureMenuItems"],
      },

      {
        helpText: "静态菜单配置",
        propertyName: "menuItems",
        controlType: "MENU_ITEMS",
        label: "静态菜单项",
        isBindProperty: false,
        isTriggerProperty: false,
        hidden: (props: MenuButtonWidgetProps) =>
          props.menuItemsSource === MenuItemsSource.DYNAMIC,
        dependencies: ["menuItemsSource"],
        panelConfig: menuItemsConfig,
      },
      {
        helpText: "动态菜单项数组",
        propertyName: "sourceData",
        label: "动态菜单项",
        controlType: "INPUT_TEXT",
        placeholderText: "{{Query1.data}}",
        inputType: "ARRAY",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: sourceDataArrayValidation,
            expected: {
              type: "Array of values",
              example: `['option1', 'option2'] |
[
  { key: "1", label: "1st menu item" },
  { key: "2", label: "2nd menu item (disabled)", disabled: true },
  { key: "3", label: "3rd menu item (disabled)", danger: true }
]`,
              autocompleteDataType: AutocompleteDataType.ARRAY,
            },
          },
        },
        evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
        hidden: (props: MenuButtonWidgetProps) =>
          props.menuItemsSource === MenuItemsSource.STATIC,
        dependencies: ["menuItemsSource"],
      },
      {
        helpText: "配置菜单项的外观",
        propertyName: "configureMenuItems",
        controlType: "OPEN_CONFIG_PANEL",
        buttonConfig: {
          label: "配置",
          icon: "settings-2-line",
        },
        label: "配置菜单项",
        isBindProperty: false,
        isTriggerProperty: false,
        hidden: (props: MenuButtonWidgetProps) =>
          props.menuItemsSource === MenuItemsSource.STATIC || !props.sourceData,
        dependencies: ["menuItemsSource", "sourceData"],
        panelConfig: configureMenuItemsConfig,
      },
    ],
  },
  {
    sectionName: "属性",
    children: [
      {
        helpText: "菜单弹出的位置",
        propertyName: "menuPosition",
        label: "菜单位置",
        controlType: "DROP_DOWN",
        fullWidth: true,
        // "topLeft", "topCenter", "topRight", "bottomLeft", "bottomCenter", "bottomRight", "top", "bottom"
        options: [
          { label: "左上", value: "topLeft" },
          { label: "上", value: "topCenter" },
          { label: "右上", value: "topRight" },
          { label: "左下", value: "bottomLeft" },
          { label: "下", value: "bottomCenter" },
          { label: "右下", value: "bottomRight" },
        ],
        defaultValue: "bottomLeft",
        isBindProperty: false,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        helpText: "菜单弹出的触发方式",
        propertyName: "menuTrigger",
        label: "菜单触发方式",
        controlType: "ICON_TABS",
        fullWidth: true,
        options: [
          { label: "点击", value: "click" },
          { label: "移入", value: "hover" },
        ],
        defaultValue: "hover",
        isBindProperty: false,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "isVisible",
        helpText: "控制组件的显示/隐藏",
        label: "是否显示",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "isDisabled",
        helpText: "让组件不可交互",
        label: "禁用",
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
      {
        propertyName: "isCompact",
        helpText: "让菜单项显示更紧凑",
        label: "紧凑模式",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        ...HeightControlPaneConfig,
        hidden: () => true,
      },
    ],
  },
] as PropertyPaneConfig[];
