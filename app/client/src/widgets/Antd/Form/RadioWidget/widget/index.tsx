import type { Alignment } from "@blueprintjs/core";
import { compact, get, isArray, isNumber } from "lodash";
import React from "react";

import type { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import RadioGroupComponent from "../component";
import type { RadioOption } from "../constants";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetState, WidgetProps } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
  getDefaultValueDropdownPropConfig,
  getFieldNamesPropConfig,
} from "../../CONST/DEFAULT_CONFIG";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";
import { mergeWidgetConfig } from "utils/helpers";
import { validationDefaultWithOptionComponent } from "widgets/Antd/tools";

class RadioGroupWidget extends BaseWidget<RadioGroupWidgetProps, WidgetState> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: RadioGroupWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        "!doc":
          "Radio widget lets the user choose only one option from a predefined set of options. It is quite similar to a SingleSelect Dropdown in its functionality",
        "!url": "https://docs.appsmith.com/widget-reference/radio",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        options: "[$__dropdownOption__$]",
        defaultValue: "string",
        value: generateTypeDef(widget.value, extraDefsToDefine),
        selectedOption: generateTypeDef(
          widget.selectedOption,
          extraDefsToDefine,
        ),
        isRequired: "bool",
        isDisabled: "bool",
      };
    };
  }

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "选项值唯一的数组",
            propertyName: "options",
            label: "选项",
            controlType: "OPTION_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                children: {
                  type: ValidationTypes.OBJECT,
                  params: {
                    required: true,
                  },
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          getFieldNamesPropConfig("value"),
          getFieldNamesPropConfig("label"),
          getDefaultValueDropdownPropConfig({
            placeholderText: "Y",
            validation: {
              dependentPaths: ["options", "valueKey"],
              type: ValidationTypes.FUNCTION,
              params: {
                fn: validationDefaultWithOptionComponent,
              },
            },
          }),
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
        ],
      },
      {
        sectionName: "属性",
        children: [
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
        sectionName: "事件",
        children: [
          {
            helpText: "选中项改变时触发",
            propertyName: "onSelectionChange",
            label: "onChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "属性",
          children: [
            {
              propertyName: "radioType",
              helpText: "设置单选组合的样式",
              label: "单选样式",
              controlType: "ICON_TABS",
              defaultValue: "radio",
              fullWidth: true,
              isBindProperty: true,
              isTriggerProperty: false,
              options: [
                {
                  label: "常规",
                  value: "radio",
                },
                {
                  label: "按钮",
                  value: "button",
                },
              ],
            },
            // {
            //   propertyName: "controlSize",
            //   label: "尺寸",
            //   controlType: "ICON_TABS",
            //   helpText: "设置控件的大小",
            //   defaultValue: "middle",
            //   options: [
            //     {
            //       label: "小",
            //       value: "small",
            //     },
            //     {
            //       label: "中等",
            //       value: "middle",
            //     },
            //     {
            //       label: "大",
            //       value: "large",
            //     },
            //   ],
            //   // isJSConvertible: true,
            //   isBindProperty: true,
            //   isTriggerProperty: false,
            //   validation: {
            //     type: ValidationTypes.TEXT,
            //   },
            //   dependencies: ["radioType"],
            //   hidden: (props: any, propertyPath: string) => {
            //     const _propertyPath = getParentPropertyPath(propertyPath);
            //     const propsData = get(props, _propertyPath) || props;
            //     return propsData.radioType === "radio";
            //   },
            // },
            {
              propertyName: "isInline",
              helpText: "单向框是否水平排列",
              label: "行排列",
              controlType: "SWITCH",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.BOOLEAN },
              dependencies: ["radioType"],
              hidden: (props: RadioGroupWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;
                console.log("radioType propsData", propsData);

                return propsData.radioType === "button";
              },
            },
            {
              propertyName: "radioButtonStyle",
              helpText: "填充按钮背景颜色(强调色)",
              label: "是否填充按钮背景",
              controlType: "SWITCH",
              defaultValue: false,
              fullWidth: true,
              isBindProperty: true,
              isTriggerProperty: false,
              dependencies: ["radioType"],
              hidden: (props: any, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;
                return propsData.radioType === "radio";
              },
            },
            // {
            //   propertyName: "alignment",
            //   helpText: "设置组件对齐方式",
            //   label: "对齐",
            //   controlType: "ICON_TABS",
            //   defaultValue: Alignment.LEFT,
            //   fullWidth: true,
            //   isBindProperty: true,
            //   isTriggerProperty: false,
            //   options: [
            //     {
            //       label: "左对齐",
            //       value: Alignment.LEFT,
            //     },
            //     {
            //       label: "右对齐",
            //       value: Alignment.RIGHT,
            //     },
            //   ],
            //   dependencies: ["radioType"],
            //   hidden: (props: any, propertyPath: string) => {
            //     const _propertyPath = getParentPropertyPath(propertyPath);
            //     const propsData = get(props, _propertyPath) || props;
            //     return propsData.radioType !== "button";
            //   },
            // },
          ],
        },
        {
          sectionName: "颜色配置",
          children: [
            {
              propertyName: "colorPrimary",
              helpText: "设置单选框选中态的颜色",
              label: "强调色",
              defaultValue: "{{appsmith.theme.colors.primaryColor}}",
              controlType: "COLOR_PICKER",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
  }

  static getDerivedPropertiesMap() {
    return {
      selectedOption: "{{_.find(this.options, { value: this.value })}}",
      isValid: `{{ this.isRequired ? !!this.value : true }}`,
      value: `{{this.props.value}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "defaultValue",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      isDirty: false,
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      colorPrimary: "{{appsmith.theme.colors.primaryColor}}",
      boxShadow: "none",
    };
  }

  componentDidUpdate(prevProps: RadioGroupWidgetProps): void {
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "boolean",
        },
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setData: {
          path: "options",
          type: "array",
        },
      },
    };
  }

  getPageView() {
    const {
      alignment,
      animateLoading,
      bottomRow,
      controlSize,
      isDisabled,
      isInline,
      isLoading,
      labelAlignment,
      labelPosition,
      labelStyle,
      labelText,
      labelTextColor,
      labelTextSize,
      options,
      radioButtonStyle,
      radioType,
      topRow,
      value,
      widgetId,
    } = this.props;
    console.group("Antd 单选组件");
    console.log(" props", this.props);
    console.log(" this", this);
    console.groupEnd();

    const { componentHeight } = this.getComponentDimensions();

    return (
      <RadioGroupComponent
        {...this.props}
        alignment={alignment}
        animateLoading={animateLoading}
        colorPrimary={this.props.colorPrimary}
        compactMode={!((bottomRow - topRow) / GRID_DENSITY_MIGRATION_V1 > 1)}
        controlSize={controlSize}
        disabled={isDisabled}
        height={componentHeight}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isInline={Boolean(isInline)}
        key={widgetId}
        labelAlignment={labelAlignment}
        labelPosition={labelPosition}
        labelStyle={labelStyle}
        labelText={labelText}
        labelTextColor={labelTextColor}
        labelTextSize={labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        loading={isLoading}
        onChange={this.onRadioSelectionChange}
        options={isArray(options) ? compact(options) : []}
        radioButtonStyle={radioButtonStyle}
        radioType={radioType}
        required={this.props.isRequired}
        value={value}
        widgetId={widgetId}
        widgetName={this.props.widgetName}
      />
    );
  }

  onRadioSelectionChange = (updatedValue: string) => {
    console.log(" this.props", this.props);
    let newVal;
    if (isNumber(this.props.options[0].value)) {
      newVal = parseFloat(updatedValue);
    } else {
      newVal = updatedValue;
    }
    // Set isDirty to true when the selection changes
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("value", newVal, {
      triggerPropertyName: "onSelectionChange",
      dynamicString: this.props.onSelectionChange,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });
  };

  static getWidgetType(): WidgetType {
    return "ANTD_RADIO_WIDGET";
  }
}

export interface RadioGroupWidgetProps extends WidgetProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  options: RadioOption[];
  onSelectionChange: string;
  defaultValue: string;
  isRequired?: boolean;
  isDisabled: boolean;
  isInline?: boolean;
  alignment: Alignment;
  label: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  isDirty: boolean;
  colorPrimary: string;
}

export default RadioGroupWidget;
