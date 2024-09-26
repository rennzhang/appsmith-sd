import { ValidationTypes } from "constants/WidgetValidation";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { ICON_NAMES } from "widgets/MenuButtonWidget/constants";
import {
  booleanForEachRowValidation,
  colorForEachRowValidation,
  iconNamesForEachRowValidation,
  iconPositionForEachRowValidation,
  textForEachRowValidation,
} from "widgets/MenuButtonWidget/validations";
import { getSourceDataAndCaluclateKeysForEventAutoComplete } from "widgets/TableWidgetV2/widget/utilities";

export default {
  editableTitle: false,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  contentChildren: [
    {
      sectionName: "General",
      children: [
        {
          propertyName: "label",
          helpText:
            "菜单项的标签文本，可以使用 {{currentItem}} 绑定设置菜单项的标签",
          label: "Label",
          controlType: "MENU_BUTTON_DYNAMIC_ITEMS",
          placeholderText: "{{currentItem.name}}",
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              expected: {
                type: "Array of values",
                example: `['option1', 'option2'] | [{ "label": "label1", "value": "value1" }]`,
                autocompleteDataType: AutocompleteDataType.ARRAY,
              },
              fnString: textForEachRowValidation.toString(),
            },
          },
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
        },
        {
          propertyName: "isVisible",
          helpText:
            "控制组件的显示/隐藏。可以使用 {{currentItem}} 绑定数据控制菜单项是否显示",
          label: "是否显示",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              fnString: booleanForEachRowValidation.toString(),
            },
          },
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
        },
        {
          propertyName: "isDisabled",
          helpText:
            "禁用菜单项。可以使用 {{currentItem}} 绑定数据控制菜单项是否禁用",
          label: "禁用",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              fnString: booleanForEachRowValidation.toString(),
            },
          },
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
        },
      ],
    },
    {
      sectionName: "Events",
      children: [
        {
          helpText:
            "当菜单项被点击时触发。可以使用 {{currentItem}} 绑定数据控制菜单项的点击事件",
          propertyName: "onClick",
          label: "onClick",
          controlType: "ACTION_SELECTOR",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: true,
          additionalAutoComplete:
            getSourceDataAndCaluclateKeysForEventAutoComplete,
          evaluatedDependencies: [
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
      sectionName: "Icon",
      children: [
        {
          propertyName: "iconName",
          label: "Icon",
          helpText:
            "设置菜单项的图标。可以使用 {{currentItem}} 绑定数据控制菜单项的图标",
          controlType: "ICON_SELECT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              allowedValues: ICON_NAMES,
              fnString: iconNamesForEachRowValidation.toString(),
            },
          },
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
        },
        {
          propertyName: "iconAlign",
          label: "Position",
          helpText:
            "设置菜单项的图标对齐方式。可以使用 {{currentItem}} 绑定数据控制菜单项的图标对齐方式",
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
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              allowedValues: ["center", "left", "right"],
              fnString: iconPositionForEachRowValidation.toString(),
            },
          },
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
        },
      ],
    },
    {
      sectionName: "Color",
      children: [
        {
          propertyName: "iconColor",
          helpText:
            "设置菜单项的图标颜色。可以使用 {{currentItem}} 绑定数据控制菜单项的图标颜色",
          label: "Icon color",
          controlType: "COLOR_PICKER",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              regex: /^(?![<|{{]).+/,
              fnString: colorForEachRowValidation.toString(),
            },
          },
        },
        {
          propertyName: "backgroundColor",
          helpText:
            "设置菜单项的背景颜色。可以使用 {{currentItem}} 绑定数据控制菜单项的背景颜色",
          label: "Background color",
          controlType: "COLOR_PICKER",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              regex: /^(?![<|{{]).+/,
              fnString: colorForEachRowValidation.toString(),
            },
          },
        },
        {
          propertyName: "textColor",
          helpText:
            "设置菜单项的文本颜色。可以使用 {{currentItem}} 绑定数据控制菜单项的文本颜色",
          label: "Text color",
          controlType: "COLOR_PICKER",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          customJSControl: "MENU_BUTTON_DYNAMIC_ITEMS",
          evaluatedDependencies: [
            "columnActions",
            "rowSelectionActions",
            "editingActions",
          ],
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              regex: /^(?![<|{{]).+/,
              fnString: colorForEachRowValidation.toString(),
            },
          },
        },
      ],
    },
  ],
};
