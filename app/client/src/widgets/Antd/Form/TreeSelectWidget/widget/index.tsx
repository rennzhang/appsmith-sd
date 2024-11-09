import { Alignment } from "@blueprintjs/core";
import type { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Layers } from "constants/Layers";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { get, isArray, last } from "lodash";
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
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
  getFieldNamesPropConfig,
} from "../../CONST/DEFAULT_CONFIG";
import type { Def } from "tern";
import type { DefaultOptionType } from "rc-select/lib/Select";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";

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
            controlType: "INPUT_TEXT",
            controlConfig: {
              aliases: [
                {
                  name: "label",
                  isSearcheable: true,
                  isRequired: true,
                },
                {
                  name: "value",
                  isRequired: true,
                },
                {
                  name: "children",
                  isRequired: true,
                },
              ],
              sampleData: JSON.stringify(
                [
                  {
                    title: "蓝",
                    value: "BLUE",
                    children: [
                      {
                        title: "深蓝",
                        value: "DARK BLUE",
                      },
                      {
                        title: "浅蓝",
                        value: "LIGHT BLUE",
                      },
                    ],
                  },
                  { title: "绿", value: "GREEN" },
                  { title: "红", value: "RED" },
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
              type: ValidationTypes.OBJECT_ARRAY,
              params: {
                default: [],
              },
            },
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
            isJSConvertible: true,
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
          getFieldNamesPropConfig("value"),
          getFieldNamesPropConfig("label"),
          getFieldNamesPropConfig("children"),
        ],
      },
      FORM_LABEL_CONTENT_CONFIG,
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
            hidden: (props: TreeWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isMultiple;
            },
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
            hidden: (props: TreeWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isMultiple || !propsData.checkable;
            },
            dependencies: ["isMultiple", "checkable"],
          },

          // maxTagCount
          {
            placeholderText: "请输入最大标签数量",
            propertyName: "maxTagCount",
            label: "最大标签数量",
            helpText: "最多显示的标签数量",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
              params: { allowedVoid: true },
            },
            hidden: (props: TreeWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isMultiple;
            },
            dependencies: ["isMultiple"],
          },
          // maxTagTextLength
          {
            placeholderText: "请输入最大标签文本长度",
            propertyName: "maxTagTextLength",
            label: "最大标签文本长度",
            helpText: "最大显示的 tag 文本长度",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
              params: { allowedVoid: true },
            },
            hidden: (props: TreeWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return !propsData.isMultiple;
            },
            dependencies: ["isMultiple"],
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中值变化时触发",
            propertyName: "onTreeSelectValueChange",
            label: "onChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "搜索时触发",
            propertyName: "onTreeSelectSearch",
            label: "onSearch",
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
      colorPrimary: "{{appsmith.theme.colors.primaryColor}}",
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
      this?.handleValueChange?.(
        this.props.defaultValue,
        this.props.defaultLabel,
      );
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
        onChange={this.handleValueChange}
        onSearch={this.handleSearch}
        updateSelectInfo={this.updateSelectInfo}
        value={this.props.selectedValue}
      />
    );
  }
  getFlattenedOptions = () => {
    const valueName = this.props.valueKey ?? "value";
    const labelName = this.props.labelKey ?? "label";

    const flat = (array?: any[]) => {
      if (!array) return [];
      let result: any[] = [];
      array.forEach((a) => {
        result.push({
          [valueName]: a[valueName],
          [labelName]: a[labelName],
          label: a[labelName],
          value: a[valueName],
        });
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
  handleSearch = (value: string) => {
    console.log("树选择组件 handleSearch", value);
    this.props.updateWidgetMetaProperty("searchValue", value, {
      triggerPropertyName: "onTreeSelectSearch",
      dynamicString: this.props.onTreeSelectSearch,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });
  };

  handleValueChange = (
    value?: string | string[],
    label?: string | string[],
  ) => {
    console.log("树选择组件 handleValueChange", value, label);

    if (this.props.selectedValue !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      // delete (info as any).nativeEvent;

      this.props.updateWidgetMetaProperty("selectedValue", value);
      this.props.updateWidgetMetaProperty("selectedLabel", label, {
        triggerPropertyName: "onTreeSelectValueChange",
        dynamicString: this.props.onTreeSelectValueChange,
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
  handleValueChange: (
    value?: string | string[],
    label?: string | string[],
  ) => void;
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
  colorPrimary: string;
  isDirty?: boolean;
}

export default AntdTreeWidget;
