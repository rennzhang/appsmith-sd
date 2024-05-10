import Widget from "./widget";
import IconSVG from "./icon.svg";
import { ButtonPlacementTypes, ButtonVariantTypes } from "components/constants";
import { MenuItemsSource } from "./constants";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DynamicHeight } from "utils/WidgetFeatures";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "antd 下拉多选",
  iconSVG: IconSVG,
  // tags: [WIDGET_TAGS.SELECT],
  tags: [WIDGET_TAGS.ANTD],
  searchTags: ["menu button", "dropdown"],
  dynamicHeight: DynamicHeight.AUTO_HEIGHT,
  defaults: {
    menuTrigger: "hover",
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    label: "打开菜单",
    buttonVariant: ButtonVariantTypes.PRIMARY,
    placement: ButtonPlacementTypes.CENTER,
    isCompact: false,
    isDisabled: false,
    isVisible: true,
    animateLoading: false,
    menuItemsSource: MenuItemsSource.STATIC,
    menuPosition: "bottomLeft",
    menuItems: {
      menuItem1: {
        label: "第一项",
        id: "menuItem1",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 0,
      },
      menuItem2: {
        label: "第二项",
        id: "menuItem2",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 1,
      },
      menuItem3: {
        label: "第三项",
        id: "menuItem3",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 2,
      },
    },
    // 组件拖拽后的默认高度
    rows: 4,
    // 组件拖拽后的默认宽度
    columns: 12,
    widgetName: "AntDropdown",
    version: 1,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
    autocompleteDefinitions: Widget.getAutocompleteDefinitions(),
    setterConfig: Widget.getSetterConfig(),
  },
  autoLayout: {
    defaults: {
      rows: 4,
      columns: 5.632,
    },
    autoDimension: {
      width: true,
      height: true,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "120px",
            maxWidth: "360px",
            // minHeight: "40px",
          };
        },
      },
    ],
    disableResizeHandles: {
      vertical: true,
      horizontal: true,
    },
  },
};

export default Widget;
