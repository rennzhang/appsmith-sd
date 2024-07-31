import { Alignment } from "@blueprintjs/core";
import { compact, isArray, update } from "lodash";

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
import type { SliderComponentProps } from "../component";
import RateComponent from "../component";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetState, WidgetProps } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import { DEFAULT_STYLE_PANEL_CONFIG } from "../../CONST/DEFAULT_CONFIG";

class SliderWidget extends BaseWidget<SliderWidgetProps, WidgetState> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: SliderWidgetProps, extraDefsToDefine?: ExtraDef) => {
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
          {
            propertyName: "min",
            helpText: "设置滑动条最小值",
            label: "最小值",
            isJSConvertible: true,
            controlType: "INPUT_TEXT",
            placeholderText: "0",
            isBindProperty: true,
            isTriggerProperty: true,
            defaultValue: 0,
            validation: {
              type: ValidationTypes.UNION,
              params: {
                types: [
                  {
                    type: ValidationTypes.NUMBER,
                    params: {
                      required: true,
                      expected: {
                        type: "number",
                        example: "1",
                        autocompleteDataType: AutocompleteDataType.NUMBER,
                      },
                    },
                  },
                  {
                    type: ValidationTypes.ARRAY,
                    params: {
                      children: {
                        type: ValidationTypes.NUMBER,
                        params: {
                          required: true,
                          expected: {
                            type: "number",
                            example: "1",
                            autocompleteDataType: AutocompleteDataType.NUMBER,
                          },
                        },
                      },
                    },
                  },
                ],
                // regex: /^(19[7-9]\d|[2-9]\d{3})(,\s?(19[7-9]\d|[2-9]\d{3}))*$/,
                // example: "2022,2023",
              },
            },
          },
          {
            propertyName: "max",
            helpText: "设置滑动条最大值",
            label: "最大值",
            controlType: "INPUT_TEXT",
            placeholderText: "100",
            defaultValue: 100,
            isJSConvertible: true,

            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                required: true,
                expected: {
                  type: "number",
                  example: "100",
                  autocompleteDataType: AutocompleteDataType.NUMBER,
                },
              },
            },
          },
          {
            propertyName: "step",
            helpText: "滑动条一格占多少值",
            label: "步长",
            controlType: "INPUT_TEXT",
            placeholderText: "10",
            defaultValue: 10,
            isJSConvertible: true,

            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                required: true,
                expected: {
                  type: "number",
                  example: "100",
                  autocompleteDataType: AutocompleteDataType.NUMBER,
                },
              },
            },
            dependencies: ["stepNull"],
            hidden: (props: SliderWidgetProps) => !!props.stepNull,
          },
          // marks
          {
            helpText: "设置滑动条标记",
            propertyName: "marks",
            label: "标记",
            controlType: "JS_DATA",
            placeholderText: "请输入标记",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.OBJECT,
              params: {},
            },
          },

          // included
          {
            helpText: "设置滑动条是否显示为包含样式",
            propertyName: "isInc",
            label: "包含",
            controlType: "SWITCH",
            isBindProperty: true,
            isJSConvertible: true,
            isTriggerProperty: false,
            defaultValue: true,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "设置滑动条默认值",
            propertyName: "defaultValue",
            label: "默认选中值",
            placeholderText: "请输入默认值",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,

            validation: {
              type: ValidationTypes.UNION,
              params: {
                types: [
                  {
                    type: ValidationTypes.NUMBER,
                  },
                  {
                    type: ValidationTypes.ARRAY,
                    params: {
                      children: {
                        type: ValidationTypes.NUMBER,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      // tooltips config
      {
        sectionName: "提示",
        children: [
          {
            helpText: "设置滑动条提示信息",
            propertyName: "tooltipFormatter",
            label: "提示信息",
            controlType: "COMPUTE_VALUE_INPUT_TEXT",
            // controlType: "INPUT_TEXT",
            defaultValue: "{{currentValue}}",
            placeholderText: "请输入提示信息",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          // open 值为 true 时，Tooltip 将会始终显示
          {
            helpText: "设置滑动条提示信息是否始终显示",
            propertyName: "open",
            label: "始终显示",
            controlType: "SWITCH",
            isBindProperty: true,
            isJSConvertible: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // placement 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
          {
            helpText: "设置滑动条提示信息位置",
            propertyName: "placement",
            label: "显示位置",
            controlType: "DROP_DOWN",
            options: [
              { label: "上", value: "top" },
              { label: "左", value: "left" },
              { label: "右", value: "right" },
              { label: "下", value: "bottom" },
              { label: "左上", value: "topLeft" },
              { label: "左下", value: "bottomLeft" },
              { label: "右上", value: "topRight" },
              { label: "右下", value: "bottomRight" },
              { label: "上左", value: "leftTop" },
              { label: "上右", value: "rightTop" },
              { label: "下左", value: "leftBottom" },
              { label: "下右", value: "rightBottom" },
            ],
            defaultValue: "top",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
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
            hidden: (props: SliderWidgetProps) =>
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
            hidden: (props: SliderWidgetProps) =>
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
          // range
          {
            helpText: "是否为双滑块模式",
            propertyName: "isRange",
            label: "双滑块模式",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
            dependencies: ["dots", "value"],
          },
          // setpNull
          {
            helpText: "设置滑动条是否可以设置空值",
            propertyName: "stepNull",
            label: "只能选择标记",
            controlType: "SWITCH",
            isBindProperty: true,
            isJSConvertible: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
            dependencies: ["marks", "isRange"],
            hidden: (props: SliderWidgetProps) => {
              if (props.marks) {
                const markKeys = Object.keys(props.marks);
                if (markKeys.length > 0) {
                  return false;
                }
              }
              if (props.isRange) return true;
              return true;
            },
          },
          // draggableTrack
          {
            helpText: "范围刻度是否可被拖拽",
            propertyName: "draggableTrack",
            label: "范围可拖拽",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: SliderWidgetProps) => !props.isRange,
            dependencies: ["isRange"],
          },
          // 只能选择 marks
          {
            helpText: "开启此配置后会按照 step 展示刻度，并且只能拖拽到刻度上",
            propertyName: "dots",
            label: "只能拖拽到刻度",
            controlType: "SWITCH",
            isBindProperty: true,
            isJSConvertible: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: SliderWidgetProps) => !props.isRange,
            dependencies: ["isRange"],
          },
          // vertical
          {
            helpText: "是否垂直",
            propertyName: "vertical",
            label: "垂直",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // vertical height
          {
            helpText: "设置垂直滑动条高度",
            propertyName: "heightForVertical",
            label: "高度",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入高度",
            isBindProperty: true,
            isTriggerProperty: false,
            dependencies: ["vertical"],
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: SliderWidgetProps) => !props.vertical,
          },
          // reverse
          {
            helpText: "是否反向",
            propertyName: "reverse",
            label: "反向",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // keyboard
          {
            helpText: "是否开启键盘控制",
            propertyName: "keyboard",
            label: "键盘控制",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
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
            helpText: "禁用组件交互",
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
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中项改变时触发",
            propertyName: "onChange",
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
          sectionName: "组件样式",
          children: [
            // 展示内容
            {
              helpText: "设置滑动输入两侧附加内容",
              propertyName: "displayContent",
              label: "附加内容",
              controlType: "ICON_TABS",
              fullWidth: true,
              options: [
                { label: "无", value: "none" },
                { label: "图标", value: "icon" },
                { label: "文本", value: "text" },
              ],
              defaultValue: AntdLabelPosition.Left,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
            },
            // 选中时显示的图标
            {
              propertyName: "startIconName",
              label: "左侧自定义图标",
              helpText: "设置滑动输入组件左侧自定义图标",
              controlType: "ICON_SELECT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SliderWidgetProps) =>
                props.displayContent !== "icon",
              dependencies: ["displayContent"],
            },
            // 未选中时显示的图标
            {
              propertyName: "endIconName",
              label: "右侧自定义图标",
              helpText: "设置滑动输入组件右侧自定义图标",
              controlType: "ICON_SELECT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SliderWidgetProps) =>
                props.displayContent !== "icon",
              dependencies: ["displayContent"],
            },
            // 选中时显示的文本
            {
              propertyName: "startText",
              label: "左侧自定义文本",
              helpText: "设置滑动输入组件左侧自定义文本内容",
              controlType: "INPUT_TEXT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SliderWidgetProps) =>
                props.displayContent !== "text",
              dependencies: ["displayContent"],
            },
            // 未选中时显示的文本
            {
              propertyName: "endText",
              label: "右侧自定义文本",
              placeholderText: "请输入文本内容",
              helpText: "设置滑动输入组件右侧自定义文本内容",
              controlType: "INPUT_TEXT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SliderWidgetProps) =>
                props.displayContent !== "text",
              dependencies: ["displayContent"],
            },
            {
              propertyName: "displayContentColor",
              label: "附加内容颜色",
              helpText: "设置附加内容的颜色",
              placeholderText: "请输入文本内容",
              controlType: "COLOR_PICKER",
              isJSConvertible: true,
              isBindProperty: true,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SliderWidgetProps) =>
                props.displayContent == "none",
              dependencies: ["displayContent"],
            },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
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

  componentDidUpdate(prevProps: SliderWidgetProps): void {
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    if (this.props.isRange !== prevProps.isRange) {
      this.props.updateWidgetMetaProperty(
        "defaultValue",
        this.props.isRange ? [0, 30] : 0,
      );
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
          type: "boolean",
          accessor: "value",
        },
        setLoading: {
          path: "loading",
          type: "boolean",
          accessor: "value",
        },
      },
    };
  }

  getPageView() {
    const { isDisabled, labelTextColor, labelTextSize, value, widgetId } =
      this.props;
    console.group("Antd 滑动输入组件");
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
        onValueChange={this.onChange}
        value={value}
        widgetName={this.props.widgetName}
      />
    );
  }

  onChange = (value: number | number[]) => {
    console.log("滑动输入组件 this.props", this.props, value);
    // Set isDirty to true when the selection changes
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("value", value, {
      triggerPropertyName: "onChange",
      dynamicString: this.props.onChange,
      event: {
        type: EventType.ON_SWITCH_CHANGE,
      },
    });
  };

  static getWidgetType(): WidgetType {
    return "ANTD_SLIDER_WIDGET";
  }
}

export type SliderWidgetProps = WidgetProps & SliderComponentProps;
export default SliderWidget;
