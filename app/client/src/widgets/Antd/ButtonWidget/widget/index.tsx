import { Alignment } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type {
  ButtonPlacement,
  ButtonVariant,
  RecaptchaType,
} from "components/constants";
import {
  ButtonPlacementTypes,
  ButtonVariantTypes,
  RecaptchaTypes,
} from "components/constants";
import type { ValidateFields } from "rc-field-form/es/interface";
import type { ExecutionResult } from "constants/AppsmithActionConstants/ActionConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { WidgetType } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import React from "react";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import ButtonComponent, { ButtonType } from "../component";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
import { isAirgapped } from "@appsmith/utils/airgapHelpers";

class ButtonWidget extends BaseWidget<ButtonWidgetProps, ButtonWidgetState> {
  onButtonClickBound: (event: React.MouseEvent<HTMLElement>) => void;
  clickWithRecaptchaBound: (token: string) => void;
  constructor(props: ButtonWidgetProps) {
    super(props);
    this.onButtonClickBound = this.onButtonClick.bind(this);
    this.clickWithRecaptchaBound = this.clickWithRecaptcha.bind(this);
    this.state = {
      isLoading: false,
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Buttons are used to capture user intent and trigger actions based on that intent",
      "!url": "https://docs.appsmith.com/widget-reference/button",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      text: "string",
      isDisabled: "bool",
      recaptchaToken: "string",
    };
  }

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "属性",
        children: [
          {
            propertyName: "text",
            label: "标签",
            helpText: "设置按钮标签",
            controlType: "INPUT_TEXT",
            placeholderText: "提交",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "点击按钮时触发",
            propertyName: "onClick",
            label: "onClick",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          // isGhost
          {
            helpText:
              "幽灵按钮将按钮的内容反色，背景变为透明，常用在有色背景上",
            propertyName: "isGhost",
            label: "幽灵按钮",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "鼠标交互时显示的提示信息",
            propertyName: "tooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "提交表单",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "isVisible",
            label: "是否显示",
            helpText: "控制组件的显示/隐藏",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            controlType: "SWITCH",
            helpText: "让组件不可交互",
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
      // TODO: refactor widgetParentProps implementation when we address #10659
      {
        sectionName: "表单设置",
        children: [
          {
            helpText: "当按钮位于表单下，点击按钮时触发表单校验",
            propertyName: "validateOnSubmit",
            label: "提交时校验",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "当按钮位于表单下，表单必须校验成功时按钮才可以点击",
            propertyName: "disabledWhenInvalid",
            label: "表单校验不成功时禁用",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "当按钮位于表单下，表单提交成功后重置表单",
            propertyName: "resetFormOnClick",
            label: "提交成功后重置表单",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
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
          {
            propertyName: "buttonVariant",
            label: "按钮类型",
            controlType: "ICON_TABS",
            defaultValue: ButtonVariantTypes.PRIMARY,
            fullWidth: true,
            helpText: "设置图标按钮类型",
            options: [
              {
                label: "主按钮",
                value: ButtonVariantTypes.PRIMARY,
              },
              {
                label: "次级按钮",
                value: ButtonVariantTypes.SECONDARY,
              },
              {
                label: "文本按钮",
                value: ButtonVariantTypes.TERTIARY,
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: [
                  ButtonVariantTypes.PRIMARY,
                  ButtonVariantTypes.SECONDARY,
                  ButtonVariantTypes.TERTIARY,
                ],
                default: ButtonVariantTypes.PRIMARY,
              },
            },
          },
          {
            propertyName: "controlSize",
            label: "按钮大小",
            controlType: "ICON_TABS",
            helpText: "设置按钮的尺寸大小",
            defaultValue: "middle",
            options: [
              {
                label: "小",
                value: "small",
              },
              {
                label: "中等",
                value: "middle",
              },
              {
                label: "大",
                value: "large",
              },
            ],
            // isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
          },
          // 按钮宽度
          {
            helpText: "设置按钮宽度",
            defaultValue: "auto",
            placeholderText: "auto",
            propertyName: "buttonWidth",
            label: "按钮宽度",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },

      {
        sectionName: "图标配置",
        children: [
          {
            propertyName: "iconName",
            label: "选择图标",
            helpText: "设置按钮图标",
            controlType: "ICON_SELECT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            updateHook: (
              props: ButtonWidgetProps,
              propertyPath: string,
              propertyValue: string,
            ) => {
              const propertiesToUpdate = [{ propertyPath, propertyValue }];
              if (!props.iconAlign) {
                propertiesToUpdate.push({
                  propertyPath: "iconAlign",
                  propertyValue: Alignment.LEFT,
                });
              }
              return propertiesToUpdate;
            },
            dependencies: ["iconAlign"],
            validation: {
              type: ValidationTypes.TEXT,
            },
          },
          {
            propertyName: "iconAlign",
            label: "位置",
            helpText: "设置按钮图标对齐方向",
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
            isBindProperty: false,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: ["center", "left", "right"],
              },
            },
          },
          {
            propertyName: "placement",
            label: "排列方式",
            controlType: "ICON_TABS",
            fullWidth: true,
            helpText: "设置图标与标签的排列方式",
            options: [
              {
                label: "向前对齐",
                value: ButtonPlacementTypes.START,
              },
              {
                label: "居中对齐",
                value: ButtonPlacementTypes.CENTER,
              },
              {
                label: "两边对齐",
                value: ButtonPlacementTypes.BETWEEN,
              },
            ],
            defaultValue: ButtonPlacementTypes.CENTER,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: [
                  ButtonPlacementTypes.START,
                  ButtonPlacementTypes.BETWEEN,
                  ButtonPlacementTypes.CENTER,
                ],
                default: ButtonPlacementTypes.CENTER,
              },
            },
          },
        ],
      },
      {
        sectionName: "颜色配置",
        children: [
          // iconColor
          {
            propertyName: "iconColor",
            helpText: "修改图标颜色",
            defaultValue: "#FFF",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            label: "图标颜色",
            controlType: "COLOR_PICKER",
            validation: { type: ValidationTypes.TEXT },
          },
          // textColor
          {
            propertyName: "textColor",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            helpText: "修改文本颜色",
            label: "文本颜色",
            controlType: "COLOR_PICKER",
            defaultValue: "#FFF",
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "buttonColor",
            helpText: "修改按钮颜色",
            label: "按钮颜色",
            controlType: "COLOR_PICKER",
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
            propertyName: "borderRadius",
            label: "边框圆角",
            helpText: "边框圆角样式",
            controlType: "BORDER_RADIUS_OPTIONS",
            isBindProperty: true,
            isJSConvertible: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
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

  static getStylesheetConfig(): Stylesheet {
    return {
      buttonColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      recaptchaToken: undefined,
    };
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {};
  }

  updateParentFormProperty = (propertyPath: string, propertyValue: any) => {
    if (this.props.formParentWidgetId) {
      this.context?.syncUpdateWidgetMetaProperty?.(
        this.props.formParentWidgetId,
        propertyPath,
        propertyValue,
      );
    }
  };

  batchUpdateParentFormProperty = (propertyList: [string, any][]) => {
    if (this.props.formParentWidgetId) {
      this.context?.syncBatchUpdateWidgetMetaProperties?.(
        propertyList.map(([path, value]) => {
          return {
            widgetId: this.props.formParentWidgetId,
            propertyName: path,
            propertyValue: value,
          };
        }),
      );
    }
  };

  async onButtonClick() {
    if (this.props.formParentWidgetId && this.props.validateOnSubmit) {
      await this.props?.triggerFormValidation();
    }

    if (this.props.onClick) {
      this.setState({
        isLoading: true,
      });

      if (this.hasOnClickAction()) {
        await super.executeAction({
          triggerPropertyName: "onClick",
          dynamicString: this.props.onClick,
          event: {
            type: EventType.ON_CLICK,
            callback: this.handleActionComplete,
          },
        });
      }
    }

    if (this.props.resetFormOnClick && this.props.onReset) {
      this.props.onReset();
    }
  }

  hasOnClickAction = () => {
    const { isDisabled, onClick, onReset, resetFormOnClick } = this.props;
    return Boolean((onClick || onReset || resetFormOnClick) && !isDisabled);
  };

  clickWithRecaptcha(token: string) {
    this.props.updateWidgetMetaProperty("recaptchaToken", token, {
      triggerPropertyName: "onClick",
      dynamicString: this.props.onClick,
      event: {
        type: EventType.ON_CLICK,
        callback: this.handleActionComplete,
      },
    });
  }

  handleRecaptchaV2Loading = (isLoading: boolean) => {
    if (this.props.onClick) {
      this.setState({ isLoading });
    }
  };

  handleActionComplete = (result: ExecutionResult) => {
    this.setState({
      isLoading: false,
    });
    if (result.success) {
      if (this.props.resetFormOnClick && this.props.onReset)
        this.props.onReset();
    }

    this.batchUpdateParentFormProperty([
      ["validateFieldsParamsChange", +new Date()],
      // ["validateFieldsParams", +new Date()],
    ]);
  };

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
        setLabel: {
          path: "text",
          type: "string",
        },
        setColor: {
          path: "buttonColor",
          type: "string",
        },
      },
    };
  }

  isFormValid = () => {
    return this.props.isFormValid && "isFormValid" in this.props;
  };

  getPageView() {
    console.group("Antd 按钮组件");
    console.log("Antd 按钮组件 props", this.props);
    console.groupEnd();
    const disabled = this.props.disabledWhenInvalid && !this.isFormValid();
    const isDisabled = this.props.isDisabled || disabled;
    return (
      <ButtonComponent
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        buttonColor={this.props.buttonColor}
        buttonSize={this.props.controlSize}
        buttonVariant={this.props.buttonVariant}
        clickWithRecaptcha={this.clickWithRecaptchaBound}
        googleRecaptchaKey={this.props.googleRecaptchaKey}
        handleRecaptchaV2Loading={this.handleRecaptchaV2Loading}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        isDisabled={isDisabled}
        key={this.props.widgetId}
        maxWidth={this.props.maxWidth}
        minHeight={this.props.minHeight}
        minWidth={this.props.minWidth}
        placement={this.props.placement}
        recaptchaType={this.props.recaptchaType}
        text={this.props.text}
        tooltip={this.props.tooltip}
        {...this.props}
        isLoading={this.props.isLoading || this.state.isLoading}
        onClick={this.onButtonClickBound}
        type={this.props.buttonType || ButtonType.BUTTON}
        widgetId={this.props.widgetId}
        widgetName={this.props.widgetName}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_BUTTON_WIDGET";
  }
}

export interface ButtonWidgetProps extends WidgetProps {
  text?: string;
  onClick?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  recaptchaType?: RecaptchaType;
  buttonType?: ButtonType;
  googleRecaptchaKey?: string;
  buttonVariant?: ButtonVariant;
  buttonColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  placement?: ButtonPlacement;
  disabledWhenInvalid?: boolean;
  resetFormOnClick?: boolean;
  validateOnSubmit?: boolean;
  triggerFormValidation: (...arg: Parameters<ValidateFields>) => Promise<any>;
}

interface ButtonWidgetState extends WidgetState {
  isLoading: boolean;
}

export default ButtonWidget;
