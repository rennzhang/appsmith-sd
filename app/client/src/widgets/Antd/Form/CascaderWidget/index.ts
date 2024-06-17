import { Alignment } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import { WIDGET_TAGS } from "constants/WidgetConstants";

export const CONFIG = {
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      defaultValue: DynamicHeight.AUTO_HEIGHT,
      active: true,
    },
  },
  type: Widget.getWidgetType(),
  name: "Antd 级联选择",
  searchTags: ["dropdown", "tree select", "级联选择"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  defaults: {
    rows: 8,
    columns: 20,
    animateLoading: false,
    labelPosition: LabelPosition.Auto,
    options: [
      {
        label: "蓝",
        value: "BLUE",
        children: [
          {
            label: "深蓝",
            value: "DARK BLUE",
          },
          {
            label: "浅蓝",
            value: "LIGHT BLUE",
          },
        ],
      },
      { label: "绿", value: "GREEN" },
      { label: "红", value: "RED" },
    ],
    widgetName: "AntdCascader",
    defaultValue: "BLUE",
    version: 1,
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    expandAll: false,
    isHoverExpand: false,
    placeholderText: "请选择",
    labelText: "标签",
    labelAlignment: Alignment.LEFT,
    labelWidth: 5,
    labelTextSize: "0.875rem",
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    fieldNames: {
      label: "label",
      value: "value",
      children: "children",
    },
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
    disabledPropsDefaults: {
      labelPosition: LabelPosition.Auto,
      labelTextSize: "0.875rem",
    },
    defaults: {
      rows: 6.6,
    },
    autoDimension: {
      height: true,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "160px",
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
