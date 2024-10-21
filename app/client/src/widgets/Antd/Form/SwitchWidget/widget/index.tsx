import { Alignment } from "@blueprintjs/core";
import { compact, get, isArray } from "lodash";

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
import type { SwitchComponentProps } from "../component";
import RateComponent from "../component";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import type { WidgetState, WidgetProps } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
} from "../../CONST/DEFAULT_CONFIG";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";

class SwitchWidget extends BaseWidget<SwitchWidgetProps, WidgetState> {
  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: SwitchWidgetProps, extraDefsToDefine?: ExtraDef) => {
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
            helpText: "设置默认选中的选项",
            propertyName: "defaultValue",
            label: "默认选中值",
            placeholderText: "false",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,

            validation: {
              type: ValidationTypes.BOOLEAN,
            },
          },
          // loading
          {
            helpText: "标识开关操作仍在执行中",
            propertyName: "loading",
            label: "加载中",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      FORM_LABEL_CONTENT_CONFIG,

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
            propertyName: "onSwitchChange",
            label: "onChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          // onClick
          {
            helpText: "点击时触发",
            propertyName: "onSwitchClick",
            label: "onClick",
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
            // 展示内容
            {
              helpText: "设置开关选择器的展示内容",
              propertyName: "displayContent",
              label: "展示内容",
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
              propertyName: "checkedIconName",
              label: "选中图标",
              helpText: "设置开关组件选中时的图标",
              controlType: "ICON_SELECT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SwitchWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;

                return propsData.displayContent !== "icon";
              },
              dependencies: ["displayContent"],
            },
            // 未选中时显示的图标
            {
              propertyName: "uncheckedIconName",
              label: "未选中图标",
              helpText: "设置开关组件未选中时的图标",
              controlType: "ICON_SELECT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SwitchWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;

                return propsData.displayContent !== "icon";
              },
              dependencies: ["displayContent"],
            },
            // 选中时显示的文本
            {
              propertyName: "checkedText",
              label: "选中文本",
              helpText: "设置开关组件选中时的文本",
              controlType: "INPUT_TEXT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SwitchWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;

                return propsData.displayContent !== "text";
              },
              dependencies: ["displayContent"],
            },
            // 未选中时显示的文本
            {
              propertyName: "uncheckedText",
              label: "未选中文本",
              helpText: "设置开关组件未选中时的文本",
              controlType: "INPUT_TEXT",
              isJSConvertible: true,
              isBindProperty: false,
              isTriggerProperty: false,
              validation: { type: ValidationTypes.TEXT },
              hidden: (props: SwitchWidgetProps, propertyPath: string) => {
                const _propertyPath = getParentPropertyPath(propertyPath);
                const propsData = get(props, _propertyPath) || props;

                return propsData.displayContent !== "text";
              },
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
      boxShadow: "none",
    };
  }

  componentDidUpdate(prevProps: SwitchWidgetProps): void {
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
        handelClick={this.handelClick}
        loading={this.props.loading}
        onChange={this.onChange}
        value={value}
        widgetName={this.props.widgetName}
      />
    );
  }

  handelClick = (value: boolean, e: React.MouseEvent) => {
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
    this.props.updateWidgetMetaProperty("value", value, {
      triggerPropertyName: "onSwitchClick",
      dynamicString: this.props.onSwitchClick,
      event: {
        type: EventType.ON_CLICK,
      },
    });
  };

  onChange = (value: boolean) => {
    console.log("开关组件 this.props", this.props, value);
    // Set isDirty to true when the selection changes
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("value1", value, {
      triggerPropertyName: "onSwitchChange",
      dynamicString: this.props.onSwitchChange,
      event: {
        type: EventType.ON_SWITCH_CHANGE,
      },
    });
  };

  static getWidgetType(): WidgetType {
    return "ANTD_SWITCH_WIDGET";
  }
}

export type SwitchWidgetProps = WidgetProps & SwitchComponentProps;
export default SwitchWidget;
