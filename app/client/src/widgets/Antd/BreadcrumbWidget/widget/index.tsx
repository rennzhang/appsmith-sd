import type { MenuItem } from "../constants";
import { Alignment, Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type {
  ButtonPlacement,
  ButtonVariant,
  RecaptchaType,
} from "components/constants";
import { ButtonPlacementTypes, ButtonVariantTypes } from "components/constants";
import type { ExecutionResult } from "constants/AppsmithActionConstants/ActionConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { WidgetType } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import React from "react";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import Component from "../component";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
import { updateMenuItemsSource } from "widgets/TableWidgetV2/widget/propertyUtils";
import { MenuItemsSource } from "../constants";
import menuItemsConfig from "./propertyConfig/childPanels/menuItemsConfig";
import { orderBy, isArray } from "lodash";
class BreadcrumWidget extends BaseWidget<
  BreadcrumWidgetProps,
  ButtonWidgetState
> {
  onButtonClickBound: (event: React.MouseEvent<HTMLElement>) => void;
  clickWithRecaptchaBound: (token: string) => void;
  constructor(props: BreadcrumWidgetProps) {
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
            propertyName: "breadcrumbItemsSource",
            helpText: "设置面包屑数据源",
            label: "面包屑数据源",
            controlType: "ICON_TABS",
            defaultValue: MenuItemsSource.STATIC,
            fullWidth: true,
            options: [
              {
                label: "静态",
                value: MenuItemsSource.STATIC,
              },
              {
                label: "动态",
                value: MenuItemsSource.DYNAMIC,
              },
            ],
            isJSConvertible: false,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            updateHook: updateMenuItemsSource,
            dependencies: ["sourceData", "configureMenuItems"],
          },
          {
            helpText: "静态菜单配置",
            propertyName: "items",
            controlType: "MENU_ITEMS",
            label: "静态菜单项",
            isBindProperty: true,
            isTriggerProperty: false,
            panelConfig: menuItemsConfig,
          },
          {
            propertyName: "separator",
            label: "自定义分隔符",
            helpText: "设置自定义分隔符",
            controlType: "INPUT_TEXT",
            placeholderText: "/",
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
    ];
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "颜色配置",
        children: [
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
          {
            propertyName: "textColor",
            helpText: "修改文字颜色",
            label: "文字颜色",
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

  onButtonClick() {
    if (this.props.onClick) {
      this.setState({
        isLoading: true,
      });
      super.executeAction({
        triggerPropertyName: "onClick",
        dynamicString: this.props.onClick,
        event: {
          type: EventType.ON_CLICK,
          callback: this.handleActionComplete,
        },
      });
    } else if (this.props.resetFormOnClick && this.props.onReset) {
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

  getVisibleItems = () => {
    const { items } = this.props;
    console.log(Object.values(items), items, "items");
    const visibleItems = Object.values(items)
      .filter((item) => !!item.label)
      .map((item) => {
        const { iconAlign, iconColor, iconName, textColor } = item;

        const title = (
          <div className="inline-flex items-center">
            {iconAlign == Alignment.RIGHT ? (
              <>
                <span style={{ color: textColor }}>{item.label}</span>
                {iconName && (
                  <Icon
                    className="ml-2"
                    color={iconColor}
                    icon={iconName as any}
                  />
                )}
              </>
            ) : (
              <>
                {iconName && (
                  <Icon
                    className="mr-2"
                    color={iconColor}
                    icon={iconName as any}
                  />
                )}
                <span style={{ color: textColor }}>{item.label}</span>
              </>
            )}
          </div>
        );

        return { ...item, title };
      });
    return orderBy(visibleItems, ["index"], ["asc"]);
  };

  getPageView() {
    const disabled =
      this.props.disabledWhenInvalid &&
      "isFormValid" in this.props &&
      !this.props.isFormValid;
    const isDisabled = this.props.isDisabled || disabled;

    const { isLoading, separator, tooltip } = this.props;
    return (
      <Component
        getVisibleItems={this.getVisibleItems}
        isDisabled={isDisabled}
        isLoading={isLoading}
        separator={separator}
        tooltip={tooltip}
        widgetId={this.props.widgetId}
        widgetName={this.props.widgetName}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "BREADCRUMB_WIDGET";
  }
}
export type MenuItems = Record<string, MenuItem>;
export interface BreadcrumWidgetProps extends WidgetProps {
  onClick?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  items: MenuItems;
}

interface ButtonWidgetState extends WidgetState {
  isLoading: boolean;
}

export default BreadcrumWidget;
