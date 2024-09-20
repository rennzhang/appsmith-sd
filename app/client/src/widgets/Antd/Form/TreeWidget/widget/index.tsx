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
import type { DefaultValueType } from "rc-tree-select/lib/interface";
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
import type { CascaderProps, TreeProps } from "antd";
import type { ValidationConfig } from "constants/PropertyControlConstants";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  getFieldNamesPropConfig,
} from "../../CONST/DEFAULT_CONFIG";
import type { Def } from "tern";

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
  const labelField = props.titleKey || "title";
  const valueField = props.valueKey || "key";
  const childrenField = props.childrenKey || "children";
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
              dependentPaths: ["labelKey", "valueKey", "childrenKey"],
            },
            dependencies: ["labelKey", "valueKey", "childrenKey"],
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "默认选中复选框的值",
            propertyName: "defaultCheckedKeys",
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
          // defaultSelectedKeys
          {
            helpText: "默认选中的值（defaultSelectedKeys）",
            propertyName: "defaultSelectedKeys",
            label: "默认选中的值",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                allowedTypes: ["string"],
              },
            },
          },

          getFieldNamesPropConfig("label"),
          getFieldNamesPropConfig("value"),
          getFieldNamesPropConfig("children"),
          // {
          //   helpText: "自定义字段名",
          //   propertyName: "fieldNames",
          //   label: "自定义字段名",
          //   controlType: "INPUT_TEXT",
          //   defaultValue: {
          //     title: "title",
          //     key: "key",
          //     children: "children",
          //   },
          //   isJSConvertible: false,
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   validation: {
          //     type: ValidationTypes.OBJECT,
          //     params: {
          //       required: true,
          //       allowedKeys: [
          //         {
          //           name: "title",
          //           type: ValidationTypes.TEXT,
          //           params: {
          //             default: "title",
          //             required: true,
          //           },
          //         },
          //         {
          //           name: "key",
          //           type: ValidationTypes.TEXT,
          //           params: {
          //             default: "key",
          //             required: true,
          //           },
          //         },
          //         {
          //           name: "children",
          //           type: ValidationTypes.TEXT,
          //           params: {
          //             default: "children",
          //             required: true,
          //           },
          //         },
          //       ],
          //     },
          //   },
          // },
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
          },
          // selectable
          {
            propertyName: "selectable",
            label: "可选择",
            helpText: "是否可选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isMultiple",
            label: "开启多选",
            helpText: "允许用户多选，每个选项的值必须唯一",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: TreeWidgetProps) => !props.selectable,
            dependencies: ["selectable"],
          },

          {
            propertyName: "defaultExpandAll",
            label: "默认展开",
            helpText: "默认展开所有层级的选项",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
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

          // {
          //   propertyName: "isSearchable",
          //   label: "开启搜索",
          //   helpText: "输入内容搜索相关选项",
          //   controlType: "SWITCH",
          //   defaultValue: false,
          //   isJSConvertible: true,
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   validation: { type: ValidationTypes.BOOLEAN },
          // },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "用户点击复选框时触发",
            propertyName: "onCheckChange",
            label: "onCheckChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "用户点击选项时触发",
            propertyName: "onSelectChange",
            label: "onSelectChange",
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
            // blockNode
            {
              propertyName: "blockNode",
              label: "节点占据一行",
              helpText: "是否节点占据一行",
              controlType: "SWITCH",
              defaultValue: false,
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
            },
            // showLine
            {
              propertyName: "showLine",
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
      console.log(
        " generateTypeDef(widget.selectedInfo, extraDefsToD",
        generateTypeDef(
          {
            event: "check",
            node: {
              title: "0-1",
              key: "0-1",
              children: [
                {
                  title: "0-1-0-0",
                  key: "0-1-0-0",
                },
                {
                  title: "0-1-0-1",
                  key: "0-1-0-1",
                },
                {
                  title: "0-1-0-2",
                  key: "0-1-0-2",
                },
              ],
              expanded: false,
              selected: true,
              checked: false,
              loaded: false,
              loading: false,
              halfChecked: false,
              dragOver: false,
              dragOverGapTop: false,
              dragOverGapBottom: false,
              pos: "0-1",
              active: false,
            },
            checked: true,
            nativeEvent: {
              isTrusted: true,
            },
            checkedNodes: [
              {
                title: "0-0-0-1",
                key: "0-0-0-1",
              },
              {
                title: "0-1",
                key: "0-1",
                children: [
                  {
                    title: "0-1-0-0",
                    key: "0-1-0-0",
                  },
                  {
                    title: "0-1-0-1",
                    key: "0-1-0-1",
                  },
                  {
                    title: "0-1-0-2",
                    key: "0-1-0-2",
                  },
                ],
              },
              {
                title: "0-1-0-0",
                key: "0-1-0-0",
              },
              {
                title: "0-1-0-1",
                key: "0-1-0-1",
              },
              {
                title: "0-1-0-2",
                key: "0-1-0-2",
              },
            ],
            checkedNodesPositions: [
              {
                node: {
                  title: "0-0-0-1",
                  key: "0-0-0-1",
                },
                pos: "0-0-0-1",
              },
              {
                node: {
                  title: "0-1",
                  key: "0-1",
                  children: [
                    {
                      title: "0-1-0-0",
                      key: "0-1-0-0",
                    },
                    {
                      title: "0-1-0-1",
                      key: "0-1-0-1",
                    },
                    {
                      title: "0-1-0-2",
                      key: "0-1-0-2",
                    },
                  ],
                },
                pos: "0-1",
              },
              {
                node: {
                  title: "0-1-0-0",
                  key: "0-1-0-0",
                },
                pos: "0-1-0",
              },
              {
                node: {
                  title: "0-1-0-1",
                  key: "0-1-0-1",
                },
                pos: "0-1-1",
              },
              {
                node: {
                  title: "0-1-0-2",
                  key: "0-1-0-2",
                },
                pos: "0-1-2",
              },
            ],
            halfCheckedKeys: ["0-0-0", "0-0"],
          },
          extraDefsToDefine,
        ),
      );
      return {
        checkedInfo: getTypeDefOfTreeSelectInfo(true),
        selectedInfo: getTypeDefOfTreeSelectInfo(),
        selectedKeys: generateTypeDef(widget.selectedKeys, extraDefsToDefine),
        checkedKeys: generateTypeDef(widget.checkedKeys, extraDefsToDefine),
        "!doc":
          "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        value: generateTypeDef(widget.value, extraDefsToDefine),
        checkedLabels: generateTypeDef(widget.checkedLabels, extraDefsToDefine),
        selectedLabels: generateTypeDef(
          widget.selectedLabels,
          extraDefsToDefine,
        ),
        isDisabled: "bool",
        isValid: generateTypeDef(widget.isValid, extraDefsToDefine),
        options: generateTypeDef(widget.options, extraDefsToDefine),
      };
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.checkedKeys}}`,
      selectedKeys: `{{this.selectedKeys}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "checkedKeys",
      checkedKeys: "defaultCheckedKeys",
      selectedKeys: "defaultSelectedKeys",
      checkedLabels: "defaultLabel",
      selectedLabels: "defaultSelectedLabel",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      checkedKeys: undefined,
      selectedKeys: undefined,
      checkedLabels: undefined,
      selectedLabels: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: TreeWidgetProps): void {
    if (
      this.props.defaultCheckedKeys !== prevProps.defaultCheckedKeys &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    if (this.props.defaultCheckedKeys !== prevProps.defaultCheckedKeys) {
      this?.onCheckChange?.(this.props.defaultCheckedKeys, null as any);
    }

    if (this.props.defaultSelectedKeys !== prevProps.defaultSelectedKeys) {
      this?.onSelectChange?.(this.props.defaultSelectedKeys, null as any);
    }
  }

  getPageView() {
    console.group("树组件 getPageView");
    console.log("树组件 this.props", this.props);
    console.log("树组件 this", this);
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
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isMultiple={this.props.isMultiple}
        isSearchable={this.props.isSearchable}
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
        onCheckChange={this.onCheckChange}
        onSelectChange={this.onSelectChange}
      />
    );
  }
  getFlattenedOptions = () => {
    const valueName = this.props.valueKey ?? "title";
    const labelName = this.props.labelKey ?? "key";

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
  getLabels = (keys?: Key[]) => {
    const valueName = this.props.valueKey ?? "title";
    const labelName = this.props.labelKey ?? "key";
    const options = this.getFlattenedOptions();
    if (Array.isArray(keys) && keys.length) {
      const labels = keys?.map((value) => {
        return (options as any)?.find(
          (option: any) => option[valueName] === value,
        )?.[labelName];
      });
      return labels;
    }
    return [];
  };

  onCheckChange: TreeProps["onCheck"] = (value, info) => {
    const checkedLabels = this.getLabels(value as Key[]);

    if (!info) {
      this.props.updateWidgetMetaProperty("checkedLabels", checkedLabels);
      return;
    }
    if (this.props.checkedKeys !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("checkedKeys", value);
      delete (info as any).nativeEvent;

      this.props.updateWidgetMetaProperty("checkedInfo", info);
      this.props.updateWidgetMetaProperty("checkedLabels", checkedLabels, {
        triggerPropertyName: "onCheckChange",
        dynamicString: this.props.onCheckChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });
    }
  };

  onSelectChange: TreeProps["onSelect"] = (value, info) => {
    const _selectedLabel = this.getLabels(value as Key[]);

    if (!info) {
      this.props.updateWidgetMetaProperty("selectedLabels", _selectedLabel);
      return;
    }
    if (this.props.selectedKeys !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("selectedKeys", value);
      delete (info as any).nativeEvent;

      this.props.updateWidgetMetaProperty("selectedInfo", info);

      this.props.updateWidgetMetaProperty("selectedLabels", _selectedLabel, {
        triggerPropertyName: "onSelectChange",
        dynamicString: this.props.onCheckChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_TREE_WIDGET";
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
  flattenedOptions?: TreeProps["treeData"];
  onCheckChange: TreeProps["onCheck"];
  onSelectChange: TreeProps["onSelect"];

  onDropdownOpen?: string;
  onDropdownClose?: string;
  defaultCheckedKeys: string[];
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  checkedLabels: string[];
  checkedKeys: TreeProps["checkedKeys"];
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
