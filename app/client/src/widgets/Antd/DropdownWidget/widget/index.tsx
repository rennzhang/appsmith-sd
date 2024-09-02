import type { ExecuteTriggerPayload } from "constants/AppsmithActionConstants/ActionConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { isArray, orderBy } from "lodash";
import { default as React } from "react";
import type { WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import MenuButtonComponent from "../component";
import type { MenuButtonWidgetProps, MenuItem } from "../constants";
import { MenuItemsSource } from "../constants";
import contentConfig from "./propertyConfig/contentConfig";
import styleConfig from "./propertyConfig/styleConfig";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
class MenuButtonWidget extends BaseWidget<MenuButtonWidgetProps, WidgetState> {
  static getPropertyPaneContentConfig() {
    return contentConfig;
  }

  static getPropertyPaneStyleConfig() {
    return styleConfig;
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      buttonColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Menu button widget is used to represent a set of actions in a group.",
      "!url": "https://docs.appsmith.com/widget-reference/menu-button",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      label: "string",
    };
  }

  menuItemClickHandler = (onClick: string | undefined, index: number) => {
    if (onClick) {
      const config: ExecuteTriggerPayload = {
        triggerPropertyName: "onClick",
        dynamicString: onClick,
        event: {
          type: EventType.ON_CLICK,
        },
      };

      if (this.props.menuItemsSource === MenuItemsSource.DYNAMIC) {
        config.globalContext = {
          currentItem: this.props.sourceData
            ? this.props.sourceData[index]
            : {},
          currentIndex: index,
        };
      }

      super.executeAction(config);
    }
  };

  getVisibleItems = () => {
    const { configureMenuItems, menuItems, menuItemsSource, sourceData } =
      this.props;
    if (menuItemsSource === MenuItemsSource.STATIC) {
      const visibleItems = Object.keys(menuItems)
        .map((itemKey) => menuItems[itemKey])
        .filter((item) => item.isVisible === true);

      return orderBy(visibleItems, ["index"], ["asc"]);
    } else if (
      menuItemsSource === MenuItemsSource.DYNAMIC &&
      isArray(sourceData) &&
      sourceData?.length &&
      configureMenuItems?.config
    ) {
      const { config } = configureMenuItems;
      const getValue = (propertyName: keyof MenuItem, index: number) => {
        const value = config[propertyName];

        if (isArray(value)) {
          return value[index];
        }

        return value ?? null;
      };

      const visibleItems = sourceData
        .map((item, index) => ({
          ...item,
          id: index.toString(),
          isVisible: getValue("isVisible", index),
          isDisabled: getValue("isDisabled", index),
          index: index,
          widgetId: "",
          label:
            getValue("label", index) || item.label || item.name || item.text,
          onClick: config?.onClick,
          textColor: getValue("textColor", index),
          backgroundColor: getValue("backgroundColor", index),
          iconAlign: getValue("iconAlign", index),
          iconColor: getValue("iconColor", index),
          iconName: getValue("iconName", index),
        }))
        .filter((item) => item.isVisible === true);

      console.log(" visibleItems", visibleItems, this.props);
      return visibleItems;
    }

    return [];
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
      },
    };
  }

  getPageView() {
    console.log(" this.props", this.props, this);

    const { componentWidth } = this.getComponentDimensions();
    return (
      <MenuButtonComponent
        maxWidth={this.props.maxWidth}
        minHeight={this.props.minHeight}
        minWidth={this.props.minWidth}
        onItemClicked={this.menuItemClickHandler}
        width={componentWidth}
        {...this.props}
        getVisibleItems={this.getVisibleItems}
        renderMode={this.props.renderMode}

      />
    );
  }

  static getWidgetType() {
    return "ANTD_DROPDOWN";
  }
}

export default MenuButtonWidget;
