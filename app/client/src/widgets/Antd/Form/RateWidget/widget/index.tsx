import { Alignment } from "@blueprintjs/core";
import { compact, isArray } from "lodash";

import { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import type { RateComponentProps } from "../component";
import RateComponent from "../component";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetState, WidgetProps } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";

class RateWidget extends BaseWidget<RateWidgetProps, WidgetState> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: RateWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        "!doc":
          "Radio widget lets the user choose only one option from a predefined set of options. It is quite similar to a SingleSelect Dropdown in its functionality",
        "!url": "https://docs.appsmith.com/widget-reference/radio",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        defaultValue: "string",
        value: generateTypeDef(widget.value, extraDefsToDefine),
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
          // tooltips => string[]
          {
            propertyName: "tooltips",
            label: "提示",
            helpText: "设置选项的提示信息",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入提示信息",
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
          },
          // 最大选择星数
          {
            propertyName: "maxValue",
            label: "最大星数",
            helpText: "设置评分的最大值",
            controlType: "INPUT_TEXT",
            placeholderText: "5",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
            },
          },
          // 最小选择星数
          {
            propertyName: "minValue",
            label: "最小星数",
            helpText: "设置评分的最小值",
            controlType: "INPUT_TEXT",
            placeholderText: "1",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
            },
          },
          {
            helpText: "设置默认选中的选项",
            propertyName: "defaultValue",
            label: "默认选中值",
            placeholderText: "4",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,

            validation: {
              type: ValidationTypes.NUMBER,
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
          // !暂不支持，需要配合 form 组件
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: true,
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
            hidden: (props: RateWidgetProps) =>
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
            hidden: (props: RateWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
      {
        sectionName: "校验",
        children: [
          // {
          //   propertyName: "isRequired",
          //   label: "必填",
          //   helpText: "强制用户填写",
          //   controlType: "SWITCH",
          //   isJSConvertible: true,
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   validation: { type: ValidationTypes.BOOLEAN },
          // },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "显示提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
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
            propertyName: "allowHalf",
            helpText: "是否允许打半星",
            label: "允许半星",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
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
            helpText: "让组件只读",
            label: "只读",
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

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "属性",
        children: [
          // 展示内容
          {
            helpText: "设置评分框的展示内容",
            propertyName: "displayContent",
            label: "展示内容",
            controlType: "ICON_TABS",
            fullWidth: true,
            options: [
              { label: "图标", value: "icon" },
              { label: "文本", value: "text" },
            ],
            defaultValue: AntdLabelPosition.Left,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "iconName",
            label: "自定义图标",
            helpText: "设置评分框的图标，可以切换为文本模式输出任何自定义文本",
            controlType: "ICON_SELECT",
            isJSConvertible: true,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: RateWidgetProps) => props.displayContent === "text",
            dependencies: ["displayContent"],
          },
          {
            propertyName: "customText",
            label: "自定义文本",
            helpText: "设置评分框的文本，支持 emoji 表情",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: RateWidgetProps) => props.displayContent === "icon",
            dependencies: ["displayContent"],
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
            controlType: "INPUT_TEXT",
            defaultValue: 14,
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
        sectionName: "颜色配置",
        children: [
          {
            propertyName: "accentColor",
            helpText: "设置评分的强调色",
            label: "强调色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap() {
    return {
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
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      boxShadow: "none",
    };
  }

  componentDidUpdate(prevProps: RateWidgetProps): void {
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
        setValue: {
          path: "defaultValue",
          type: "string",
          accessor: "value",
        },
      },
    };
  }

  getPageView() {
    const { isDisabled, labelTextColor, labelTextSize, value, widgetId } =
      this.props;
    console.group("Antd 评分组件");
    console.log(" props", this.props);
    console.log(" this", this);
    console.groupEnd();

    const { componentHeight } = this.getComponentDimensions();

    return (
      <RateComponent
        height={componentHeight}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        key={widgetId}
        labelTextColor={labelTextColor}
        labelTextSize={labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        required={this.props.isRequired}
        {...this.props}
        disabled={!!isDisabled}
        onValueChange={this.onValueChange}
        value={value}
        widgetName={this.props.widgetName}
      />
    );
  }

  onValueChange = (updatedValue: number) => {
    console.log(" this.props", this.props, updatedValue);
    const newVal = updatedValue;
    // Set isDirty to true when the selection changes
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("value", newVal, {
      triggerPropertyName: "onValueChange",
      dynamicString: this.props.onValueChange,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });
  };

  static getWidgetType(): WidgetType {
    return "ANTD_RATE_WIDGET";
  }
}

export type RateWidgetProps = WidgetProps & RateComponentProps;
export default RateWidget;
