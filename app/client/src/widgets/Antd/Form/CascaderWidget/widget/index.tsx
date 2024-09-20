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
import type { ReactNode } from "react";
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
import type { CascaderProps } from "antd";
import type { ValidationConfig } from "constants/PropertyControlConstants";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  getFieldNamesPropConfig,
} from "../../CONST/DEFAULT_CONFIG";

function defaultValueValidation(value: unknown): ValidationResponse {
  if (typeof value === "string") return { isValid: true, parsed: value.trim() };
  if (value === undefined || value === null)
    return {
      isValid: false,
      parsed: "",
      messages: [
        {
          name: "TypeError",
          message: "This value does not evaluate to type: string",
        },
      ],
    };
  return { isValid: true, parsed: value };
}

class CascaderWidget extends BaseWidget<CascaderWidgetProps, WidgetState> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "允许用户多选，每个选项的值必须唯一",
            propertyName: "options",
            label: "选项",
            controlType: "INPUT_TEXT",
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
            helpText: "默认选中这个值",
            propertyName: "defaultValue",
            label: "默认选中值",
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
                  example: `value1`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
          },
          getFieldNamesPropConfig("label"),
          getFieldNamesPropConfig("value"),
          getFieldNamesPropConfig("children"),
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
            hidden: (props: CascaderWidgetProps) =>
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
            hidden: (props: CascaderWidgetProps) =>
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
          {
            helpText: "设置组件状态",
            propertyName: "status",
            label: "状态",
            controlType: "DROP_DOWN",
            options: [
              { label: "无", value: "" },
              { label: "警告", value: "warning" },
              { label: "错误", value: "error" },
            ],
            defaultValue: "",
            isJSConvertible: true,
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
            propertyName: "isHoverExpand",
            label: "移入展开",
            helpText: "通过移入展开下级菜单，点击完成选择。",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isSearchable",
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
            propertyName: "isMultiple",
            label: "开启多选",
            helpText: "允许用户多选，每个选项的值必须唯一",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // {
          //   propertyName: "expandAll",
          //   label: "默认展开",
          //   helpText: "默认展开所有层级的选项",
          //   controlType: "SWITCH",
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
            helpText: "用户选中一个选项时触发",
            propertyName: "onOptionChange",
            label: "onOptionChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown opens",
            propertyName: "onDropdownOpen",
            label: "onDropdownOpen",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown closes",
            propertyName: "onDropdownClose",
            label: "onDropdownClose",
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
    return mergeWidgetConfig([], DEFAULT_STYLE_PANEL_CONFIG);
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: CascaderWidgetProps, extraDefsToDefine?: ExtraDef) => {
      console.log(
        "级联选择 getAutocompleteDefinitions",
        widget,
        generateTypeDef(widget.selectedLabel, extraDefsToDefine),
      );

      return {
        selectedOption: generateTypeDef(
          widget.selectedOption,
          extraDefsToDefine,
        ),
        "!doc":
          "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        value: generateTypeDef(widget.value, extraDefsToDefine),
        selectedLabel: generateTypeDef(widget.selectedLabel, extraDefsToDefine),
        isDisabled: "bool",
        isValid: generateTypeDef(widget.isValid, extraDefsToDefine),
        options: generateTypeDef(widget.options, extraDefsToDefine),
      };
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedOption}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "selectedOption",
      selectedOption: "defaultValue",
      selectedLabel: "defaultLabel",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      selectedOption: undefined,
      selectedLabel: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: CascaderWidgetProps): void {
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  }

  getPageView() {
    console.group("级联选择 getPageView");
    console.log("级联选择 this.props", this.props);
    console.log("级联选择 this", this);
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
        isFilterable
        dropdownStyle={{
          zIndex: Layers.dropdownModalWidget,
        }}
        // expandAll={this.props.expandAll}
        isHoverExpand={this.props.isHoverExpand}
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
        onChange={this.onOptionChange}
        options={options}
        placeholder={this.props.placeholderText as string}
        required={this.props.isRequired}
        status={this.props.status}
        width={componentWidth}
        {...this.props}
        onDropdownClose={this.onDropdownClose}
        onDropdownOpen={this.onDropdownOpen}
      />
    );
  }

  getSelectedOptionLabel = (selectValue?: DefaultValueType) => {
    const options = this.props.flattenedOptions ?? [];
    if (Array.isArray(selectValue) && selectValue.length) {
      const selectedOptionLabels = selectValue?.map((value) => {
        return options?.find((option) => option.value === value)?.label;
      });
      return selectedOptionLabels;
    }
    return [];
  };

  onOptionChange = (value?: DefaultValueType, labelList?: ReactNode[]) => {
    if (this.props.selectedOption !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("selectedOption", value);

      // const selectedLabel = labelList?.map((label) => label.toString());
      const _selectedLabel = this.getSelectedOptionLabel(value);
      console.log("级联选择 onOptionChange", _selectedLabel);

      this.props.updateWidgetMetaProperty("selectedLabel", _selectedLabel, {
        triggerPropertyName: "onOptionChange",
        dynamicString: this.props.onOptionChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });
    }
  };

  onDropdownOpen = () => {
    if (this.props.onDropdownOpen) {
      super.executeAction({
        triggerPropertyName: "onDropdownOpen",
        dynamicString: this.props.onDropdownOpen,
        event: {
          type: EventType.ON_DROPDOWN_OPEN,
        },
      });
    }
  };

  onDropdownClose = () => {
    if (this.props.onDropdownClose) {
      super.executeAction({
        triggerPropertyName: "onDropdownClose",
        dynamicString: this.props.onDropdownClose,
        event: {
          type: EventType.ON_DROPDOWN_CLOSE,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_CASCADER_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface CascaderWidgetProps extends WidgetProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  placeholderText?: string;
  selectedIndex?: number;
  options?: DropdownOption[];
  flattenedOptions?: DropdownOption[];
  onOptionChange: string;
  onDropdownOpen?: string;
  onDropdownClose?: string;
  defaultValue: string;
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  selectedLabel: string[];
  selectedOption: CascaderProps["value"];
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

export default CascaderWidget;
