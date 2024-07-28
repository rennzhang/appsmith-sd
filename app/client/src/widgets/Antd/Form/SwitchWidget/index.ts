import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import type { SnipingModeProperty, PropertyUpdates } from "widgets/constants";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DEFAULT_CONFIG } from "../CONST/DEFAULT_CONFIG";
import { Colors } from "constants/Colors";
export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "Antd 开关",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      active: true,
    },
  },
  searchTags: ["switch", "开关"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    rows: 6,
    columns: 20,
    animateLoading: false,
    label: "标签",
    labelPosition: AntdLabelPosition.Auto,
    labelTextSize: 14,
    labelWidth: 6,

    defaultValue: false,
    isRequired: false,
    isDisabled: false,
    isInline: true,
    alignment: Alignment.LEFT,
    widgetName: "AntdSwitch",
    version: 1,
    accentColor: Colors.ROYAL_BLUE_2,
    hoverColor: Colors.ROYAL_BLUE,
    iconName: "star",
    displayContent: "none",
    customText: "好",
    controlSize: "default",
    checkedText: "开启",
    uncheckedText: "关闭",
    loading: false,
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
  methods: {},
  autoLayout: {
    defaults: {
      columns: 14,
      rows: 7,
    },
    disabledPropsDefaults: {
      labelPosition: AntdLabelPosition.Auto,
    },
    autoDimension: {
      height: true,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "240px",
            minHeight: "70px",
          };
        },
      },
    ],
    disableResizeHandles: {
      vertical: true,
    },
  },
};

export default Widget;
