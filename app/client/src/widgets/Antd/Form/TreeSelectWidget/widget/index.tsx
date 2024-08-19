import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Layers } from "constants/Layers";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { isArray, last } from "lodash";
import type {
  ChangeEventExtra,
  DefaultValueType,
} from "rc-tree-select/lib/interface";
import type { Key, ReactNode } from "react";
import React from "react";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1, MinimumPopupRows } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import CustomComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { CascaderProps, TreeProps, TreeSelectProps } from "antd";
import type { ValidationConfig } from "constants/PropertyControlConstants";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";
import type { Def } from "tern";
import type { DefaultOptionType } from "rc-select/lib/Select";

function getTypeDefOfTreeSelectInfo(isCheck?: boolean): string | Def {
  const def: Def = {
    event: "string",
    node: {
      title: "string",
      key: "string",
      children: "[def_11]",
      expanded: "bool",
      selected: "bool",
      checked: "bool",
      loaded: "bool",
      loading: "bool",
      halfChecked: "bool",
      dragOver: "bool",
      dragOverGapTop: "bool",
      dragOverGapBottom: "bool",
      pos: "string",
      active: "bool",
    },
  };

  if (isCheck) {
    def.checkedNodes = "[def_12]";
    def.checkedNodesPositions = "[def_13]";
    def.halfCheckedKeys = "[string]";
    def.checked = "bool";
  } else {
    def.selectedNodes = "[def_11]";
    def.selected = "bool";
  }
  return def;
}
export function defaultValueValidation(
  _value: unknown,
  props: any,
  _: any,
): ValidationResponse {
  if (!props.isMultiple) {
    return {
      isValid: true,
      parsed: _value,
      messages: [],
    };
  }
  const invalidResponse = {
    isValid: false,
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message: "传入的值应该是数组",
      },
    ],
  };
  if (!_value) {
    return {
      isValid: true,
      parsed: [],
      messages: [],
    };
  }
  try {
    if (_.isString(_value)) {
      _value = JSON.parse(_value as string);
    }

    if (Array.isArray(_value) || _.isObject(_value)) {
      return {
        isValid: true,
        parsed: _value,
        messages: [],
      };
    } else {
      return invalidResponse;
    }
  } catch (e) {
    return invalidResponse;
  }
}

function optionValidation(
  value: unknown,
  props: any,
  _: any,
): ValidationResponse {
  const labelField = props.fieldNames?.label || "label";
  const valueField = props.fieldNames?.value || "value";
  const childrenField = props.fieldNames?.children || "children";
  const validateTreeStr = `
  return function validateTree(tree) {
    if (!Array.isArray(tree)) return false;

    for (let node of tree) {
      if (typeof node !== 'object' || node === null ||
          !('${valueField}' in node) || !('${labelField}' in node)) {
        return false;
      }

      if (node.${childrenField} && !validateTree(node.${childrenField})) {
        return false;
      }
    }

    return true;
  }
`;

  // 使用 new Function 重新生成 validateTree 函数
  const validateTree = new Function(validateTreeStr)();
  let options = value;
  const invalidResponse = {
    isValid: false,
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message: "This value does not evaluate to type Array",
      },
    ],
  };

  try {
    if (_.isString(options)) {
      options = JSON.parse(options as string);
    }

    if (Array.isArray(options)) {
      const isValid = validateTree(options);
      let message = { name: "", message: "" };

      if (!isValid) {
        message = {
          name: "TypeError",
          message:
            `Each option must be an object with '${labelField}' and '${valueField}' fields. ` +
            `The '${childrenField}' field must be an array of objects with '${labelField}' and '${valueField}' fields.`,
        };
      }

      return {
        isValid,
        parsed: isValid ? options : [],
        messages: [message],
      };
    } else {
      return invalidResponse;
    }
  } catch (e) {
    return invalidResponse;
  }
}
class AntdTreeWidget extends BaseWidget<TreeWidgetProps, WidgetState> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "树形组件的源数据",
            propertyName: "options",
            label: "源数据",
            controlType: "ONE_CLICK_BINDING_CONTROL",
            controlConfig: {
              aliases: [
                {
                  name: "title",
                  isSearcheable: true,
                  isRequired: true,
                },
                {
                  name: "key",
                  isRequired: true,
                },
              ],
              sampleData: JSON.stringify(
                [
                  {
                    title: "蓝",
                    key: "BLUE",
                    children: [
                      {
                        title: "深蓝",
                        key: "DARK BLUE",
                      },
                      {
                        title: "浅蓝",
                        key: "LIGHT BLUE",
                      },
                    ],
                  },
                  { title: "绿", key: "GREEN" },
                  { title: "红", key: "RED" },
                ],
                null,
                2,
              ),
            },
            placeholderText: "请输入选项数据",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: optionValidation,
                expected: {
                  type: "value",
                  example: `[{ "title": "title1", "key": "key1", "children": [{ "title": "title2", "key": "key2" }] }]`,
                  autocompleteDataType: AutocompleteDataType.ARRAY,
                },
              },
            },
            dependencies: ["fieldNames"],
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "默认选中的值",
            propertyName: "defaultValue",
            label: "默认值",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: defaultValueValidation,
                expected: {
                  type: "value",
                  example: [`value1`],
                  autocompleteDataType: AutocompleteDataType.ARRAY,
                },
              },
            },
          },
          {
            helpText: "自定义字段名",
            propertyName: "fieldNames",
            label: "自定义字段名",
            controlType: "INPUT_TEXT",
            defaultValue: {
              label: "label",
              value: "value",
              children: "children",
            },
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.OBJECT,
              params: {
                required: true,
                allowedKeys: [
                  {
                    name: "label",
                    type: ValidationTypes.TEXT,
                    params: {
                      default: "label",
                      required: true,
                    },
                  },
                  {
                    name: "value",
                    type: ValidationTypes.TEXT,
                    params: {
                      default: "value",
                      required: true,
                    },
                  },
                  {
                    name: "children",
                    type: ValidationTypes.TEXT,
                    params: {
                      default: "children",
                      required: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {
        sectionName: "标签",
        children: [
          {
            helpText: "设置组件标签文本",
            propertyName: "labelText",
            label: "文本",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: false,
            hidden: isAutoLayout,
            options: [
              { label: "自动", value: AntdLabelPosition.Auto },
              { label: "左", value: AntdLabelPosition.Left },
              { label: "上", value: AntdLabelPosition.Top },
            ],
            defaultValue: AntdLabelPosition.Left,
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
            hidden: (props: TreeWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left,
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
            hidden: (props: TreeWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
      {
        sectionName: "校验",
        children: [
          {
            propertyName: "isRequired",
            label: "必填",
            helpText: "强制用户填写",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "普通校验或正则校验失败后显示的错误信息",
            propertyName: "errorMessage",
            label: "错误信息",
            controlType: "INPUT_TEXT",
            placeholderText: "输入不符合规范",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置占位文本",
            propertyName: "placeholderText",
            label: "占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入占位文本",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "控制组件的显示/隐藏",
            propertyName: "isVisible",
            label: "是否显示",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
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
        ],
      },
      {
        sectionName: "组件配置",
        children: [
          {
            propertyName: "showSearch",
            label: "开启搜索",
            helpText: "输入内容搜索相关选项",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "allowClear",
            label: "允许清空",
            helpText: "显示清空按钮用来清空选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "treeDefaultExpandAll",
            label: "默认展开",
            helpText: "默认展开所有层级的选项",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // treeExpandAction
          // {
          //   propertyName: "treeExpandAction",
          //   label: "展开方式",
          //   helpText: "展开方式",
          //   controlType: "ICON_TABS",
          //   options: [
          //     {
          //       label: "单击展开",
          //       value: "click",
          //     },
          //     {
          //       label: "双击展开",
          //       value: "doubleClick",
          //     },
          //   ],
          //   defaultValue: "click",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   validation: { type: ValidationTypes.TEXT },
          // },
          // 模式
          {
            propertyName: "isMultiple",
            label: "选择模式",
            helpText: "选择模式配置，单选或多选",
            controlType: "ICON_TABS",
            fullWidth: false,
            options: [
              { label: "单选", value: false },
              { label: "多选", value: true },
            ],
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },

          // checkable
          {
            propertyName: "checkable",
            label: "显示复选框",
            helpText: "是否显示复选框",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: TreeWidgetProps) => !props.isMultiple,
            dependencies: ["isMultiple"],
          },
          // treeCheckStrictly
          {
            propertyName: "treeCheckStrictly",
            label: "父子节点选中不关联",
            helpText:
              "父子节点选中不关联，即开启此配置后，选择父节点不会将其包含的子节点全部选中",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: TreeWidgetProps) =>
              !props.isMultiple || !props.checkable,
            dependencies: ["isMultiple", "checkable"],
          },

          // maxTagCount
          {
            propertyName: "maxTagCount",
            label: "最大标签数量",
            helpText: "最多显示的标签数量",
            controlType: "NUMERIC_INPUT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: TreeWidgetProps) => !props.isMultiple,
            dependencies: ["isMultiple"],
          },
          // maxTagTextLength
          {
            propertyName: "maxTagTextLength",
            label: "最大标签文本长度",
            helpText: "最大显示的 tag 文本长度",
            controlType: "INPUT_TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: TreeWidgetProps) => !props.isMultiple,
            dependencies: ["isMultiple"],
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中值变化时触发",
            propertyName: "onValueChange",
            label: "onValueChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setRequired: {
          path: "isRequired",
          type: "boolean",
        },
      },
    };
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "属性",
          children: [
            // height
            // {
            //   propertyName: "height",
            //   label: "高度",
            //   controlType: "INPUT_TEXT",
            //   helpText: "设置组件的高度",
            //   placeholderText: "请输入高度",
            //   isBindProperty: true,
            //   isTriggerProperty: false,
            //   validation: { type: ValidationTypes.NUMBER },
            // },
            // treeLine
            {
              propertyName: "treeLine",
              label: "显示连接线",
              controlType: "SWITCH",
              helpText: "是否显示连接线",
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
            },
            {
              propertyName: "iconName",
              label: "展开/折叠图标",
              helpText:
                "自定义树节点的展开/折叠图标（带有默认 rotate 角度样式）",
              controlType: "ICON_SELECT",
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: TreeWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        selectedInfo: getTypeDefOfTreeSelectInfo(),
        selectedNode: generateTypeDef(widget.selectedNode, extraDefsToDefine),
        "!doc":
          "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        value: generateTypeDef(widget.value, extraDefsToDefine),
        // checkedLabels: generateTypeDef(widget.checkedLabels, extraDefsToDefine),
        selectedLabel: generateTypeDef(widget.selectedLabel, extraDefsToDefine),
        selectedValue: generateTypeDef(widget.selectedValue, extraDefsToDefine),
        isDisabled: "bool",
        isValid: generateTypeDef(widget.isValid, extraDefsToDefine),
        options: generateTypeDef(widget.options, extraDefsToDefine),
      };
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedValue}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "selectedValue",
      selectedValue: "defaultValue",
      checkedLabels: "defaultLabel",
      selectedLabel: "defaultSelectedLabel",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      selectedValue: undefined,
      checkedLabels: undefined,
      selectedLabel: undefined,
      selectedNode: [],
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: TreeWidgetProps): void {
    const {
      isMultiple,
      selectedLabel,
      selectedValue,
      updateWidgetMetaProperty,
    } = this.props;
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    if (this.props.defaultValue !== prevProps.defaultValue) {
      this?.onValueChange?.(this.props.defaultValue, this.props.defaultLabel);
    }

    if (this.props.checkable !== prevProps.checkable) {
      updateWidgetMetaProperty("selectedValue", []);
      updateWidgetMetaProperty("selectedLabel", []);
      updateWidgetMetaProperty("selectedNode", []);
    }

    if (isMultiple !== prevProps.isMultiple) {
      updateWidgetMetaProperty(
        "selectedValue",
        this.handleValueOrLabel(selectedValue, isMultiple),
      );
      updateWidgetMetaProperty(
        "selectedLabel",
        this.handleValueOrLabel(selectedLabel, isMultiple),
      );
    }
  }
  handleValueOrLabel = (input: any, isMultiple: boolean) => {
    if (isMultiple) {
      return input ? (Array.isArray(input) ? input : [input]) : [];
    } else {
      return last(input) ?? "";
    }
  };

  getPageView() {
    console.group("树选择组件 getPageView");
    console.log("树选择组件 this.props", this.props);
    console.log("树选择组件 this", this);
    console.groupEnd();
    const options = isArray(this.props.options) ? this.props.options : [];
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const { componentWidth } = this.getComponentDimensions();
    return (
      <CustomComponent
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        disabled={this.props.isDisabled ?? false}
        errorMessage={this.props.errorMessage}
        fieldNames={this.props.fieldNames}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isMultiple={this.props.isMultiple}
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        loading={this.props.isLoading}
        options={options}
        required={this.props.isRequired}
        width={componentWidth}
        {...this.props}
        onValueChange={this.onValueChange}
        updateSelectInfo={this.updateSelectInfo}
      />
    );
  }
  getFlattenedOptions = () => {
    const valueName = this.props.fieldNames?.label ?? "label";
    const labelName = this.props.fieldNames?.value ?? "value";

    const flat = (array?: any[]) => {
      if (!array) return [];
      let result: any[] = [];
      array.forEach((a) => {
        result.push({ [valueName]: a[valueName], [labelName]: a[labelName] });
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    };
    return flat(this.props.options);
  };

  updateSelectInfo = (selectInfo: any) => {
    // selectedInfo
    this.props.updateWidgetMetaProperty("selectedInfo", selectInfo);
  };

  onValueChange = (value?: string | string[], label?: string | string[]) => {
    console.log("树选择组件 onValueChange", value, label);

    if (this.props.selectedValue !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      // delete (info as any).nativeEvent;

      this.props.updateWidgetMetaProperty("selectedValue", value);
      this.props.updateWidgetMetaProperty("selectedLabel", label, {
        triggerPropertyName: "onValueChange",
        dynamicString: this.props.onValueChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });

      const flattenedOptions = this.getFlattenedOptions();
      const newSelectedNode = flattenedOptions.filter((option) =>
        value?.toString()?.includes(option.value?.toString()),
      );
      this.props.updateWidgetMetaProperty("selectedNode", newSelectedNode);
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_TREE_SELECT_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface TreeWidgetProps extends WidgetProps {
  placeholderText?: string;
  selectedIndex?: number;
  options?: TreeProps["treeData"];
  onValueChange: (value?: string | string[], label?: string | string[]) => void;
  updateSelectInfo: (selectInfo: any) => void;

  defaultValue: string[];
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  checkedLabels: string[];
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  isDirty?: boolean;
}

export default AntdTreeWidget;
