import { Alignment } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
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

class AntdTransferWidget extends BaseWidget<
  SingleSelectTreeWidgetProps,
  WidgetState
> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText:
              "接受一个对象数组以显示选项。使用 {{}} 绑定来自 API 的数据。",
            propertyName: "sourceData",
            label: "源数据",
            controlType: "ONE_CLICK_BINDING_CONTROL",
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
              ],
              sampleData: JSON.stringify(
                [
                  {
                    value: 54,
                    label: "Label_3",
                    description: "Description_86",
                  },
                  {
                    value: 8,
                    label: "Label_92",
                    description: "Description_18",
                  },
                  {
                    value: 28,
                    label: "Label_85",
                    description: "Description_18",
                  },
                ],
                null,
                2,
              ),
            },
            isJSConvertible: true,
            placeholderText:
              '[{ "label": "label1", "value": "value1", "key": "key1", "description": "description1"}]',
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                default: [],
                unique: ["value"],
                children: {
                  type: ValidationTypes.OBJECT,
                  params: {
                    required: true,
                    allowedKeys: [
                      {
                        name: "label",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                          required: true,
                        },
                      },
                      {
                        name: "value",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                        },
                      },
                      {
                        name: "description",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "这是一段描述",
                        },
                      },
                      {
                        name: "children",
                        type: ValidationTypes.ARRAY,
                        required: false,
                        params: {
                          children: {
                            type: ValidationTypes.OBJECT,
                            params: {
                              allowedKeys: [
                                {
                                  name: "label",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                    required: true,
                                  },
                                },
                                {
                                  name: "value",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                  },
                                },
                                {
                                  name: "description",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "这是一段描述",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
              // params: {
              //   children: {
              //     type: ValidationTypes.OBJECT,
              //     params: {
              //       required: true,
              //     },
              //   },
              // },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText:
              "穿梭框默认显示在右侧框数据的 value 集合，可以使用 {{}} 绑定来自 API 的数据。",
            propertyName: "defaultValue",
            label: "右侧默认数据",
            controlType: "ONE_CLICK_BINDING_CONTROL",
            controlConfig: {},
            isJSConvertible: true,
            placeholderText: '[{ "key1" , "key2" }]',
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                children: {
                  type: ValidationTypes.TEXT,
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
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
              { label: "自动", value: LabelPosition.Auto },
              { label: "左", value: LabelPosition.Left },
              { label: "上", value: LabelPosition.Top },
            ],
            defaultValue: LabelPosition.Left,
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
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
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
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
          {
            helpText: "设置左侧标题",
            propertyName: "leftTile",
            label: "左侧标题",
            defaultValue: "source",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置右侧标题",
            propertyName: "rightTitle",
            defaultValue: "target",
            label: "右侧标题",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
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
            helpText: "控制穿梭框的模式为开启单向样式",
            propertyName: "oneWay",
            label: "开启单向样式",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "穿梭框值改变时触发",
            propertyName: "onValueChange",
            label: "onValueChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "用户选中一个选项时触发",
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
    return [
      {
        sectionName: "组件样式",
        children: [
          {
            propertyName: "listHeight",
            label: "组件高度",
            helpText: "组件高度调整，单位为 px",
            controlType: "INPUT_TEXT",
            defaultValue: 260,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
          },
        ],
      },
      {
        sectionName: "标签样式",
        children: [
          {
            propertyName: "labelTextColor",
            label: "字体颜色",
            helpText: "设置标签字体颜色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelTextSize",
            label: "字体大小",
            helpText: "设置标签字体大小",
            controlType: "DROP_DOWN",
            defaultValue: "0.875rem",
            hidden: isAutoLayout,
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelStyle",
            label: "强调",
            helpText: "设置标签字体是否加粗或斜体",
            controlType: "BUTTON_GROUP",
            options: [
              {
                icon: "text-bold",
                value: "BOLD",
              },
              {
                icon: "text-italic",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "轮廓样式",
        children: [
          {
            propertyName: "accentColor",
            label: "强调色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            invisible: true,
          },
          {
            propertyName: "borderRadius",
            label: "边框圆角",
            helpText: "边框圆角样式",
            controlType: "BORDER_RADIUS_OPTIONS",

            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "boxShadow",
            label: "阴影",
            helpText: "组件轮廓投影",
            controlType: "BOX_SHADOW_OPTIONS",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
      "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      selectedOption: {
        "!type": "array",
        "!doc": "The value selected in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      targetValues: {
        "!type": "array",
        "!doc": "The selected option label in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      value: {
        "!type": "array",
        "!doc": "The selected option label in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },

      isDisabled: "bool",
      isValid: "bool",
      options: "[$__dropdrowOptionWithChildren__$]",
    };
  }

  static getDerivedPropertiesMap() {
    return {
      // value: `{{this.selectedOptionValue}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
      selectedOption: `{{(()=>{${derivedProperties.getSelectedOption}})()}}`,
      targetValues: `{{(()=>{${derivedProperties.getTargetValues}})()}}`,
      value: `{{(()=>{${derivedProperties.getTargetValues}})()}}`,
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedOption: undefined,
      selectedLabel: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: SingleSelectTreeWidgetProps): void {
    if (this.props.sourceData !== prevProps.sourceData) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
  }

  getPageView() {
    console.log("穿梭框 getPageView this.props", this.props);

    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const { componentWidth } = this.getComponentDimensions();
    return (
      <CustomComponent
        accentColor={this.props.accentColor}
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        defaultValue={this.props.defaultValue}
        disabled={this.props.isDisabled ?? false}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isMultiple={this.props.isMultiple}
        isSearchable={this.props.isSearchable}
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        dropdownStyle={{
          zIndex: Layers.dropdownModalWidget,
        }}
        // expandAll={this.props.expandAll}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelText={this.props.labelText}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        leftTile={this.props.leftTile}
        listHeight={this.props.listHeight}
        loading={this.props.isLoading}
        onChange={this.onValueChange}
        onSelectChange={this.onSelectChange}
        oneWay={this.props.oneWay}
        placeholder={this.props.placeholderText as string}
        renderMode={this.props.renderMode}
        required={this.props.isRequired}
        rightTitle={this.props.rightTitle}
        selectedOption={this.props.selectedOption}
        sourceData={this.props.sourceData}
        status={this.props.status}
        widgetId={this.props.widgetId}
        widgetName={this.props.widgetName}
        width={componentWidth}
      />
    );
  }
  onValueChange = (value?: DefaultValueType) => {
    console.log("级联选择 onValueChange this.props", value, this.props);
    if (this.props.targetValues !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("targetValues", value, {
        triggerPropertyName: "onValueChange",
        dynamicString: this.props.onValueChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });
    }
  };

  onSelectChange = (value?: {
    targetSelectedKeys: string[];
    sourceSelectedKeys: string[];
  }) => {
    console.log("穿梭框 onSelectChange this.props", value, this.props);
    if (this.props.selectedOption !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      this.props.updateWidgetMetaProperty("selectedOption", value, {
        triggerPropertyName: "onSelectChange",
        dynamicString: this.props.onSelectChange,
        event: {
          type: EventType.ON_SELECT,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "ANTD_TRANSFER_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface SingleSelectTreeWidgetProps extends WidgetProps {
  placeholderText?: string;
  selectedIndex?: number;
  options?: DropdownOption[];
  onOptionChange: string;
  onDropdownClose?: string;
  isRequired: boolean;
  isLoading: boolean;
  selectedLabel: string[];
  selectedOption: string | CascaderProps["value"];
  selectedOptionValue: CascaderProps["value"];
  selectedOptionLabel: string;
  // expandAll: boolean;
  labelText: string;
  labelPosition?: LabelPosition;
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

export default AntdTransferWidget;
