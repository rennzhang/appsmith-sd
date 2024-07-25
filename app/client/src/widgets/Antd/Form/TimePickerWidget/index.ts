import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DEFAULT_CONFIG } from "../CONST/DEFAULT_CONFIG";
export const CONFIG = {
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      defaultValue: DynamicHeight.AUTO_HEIGHT,
      active: true,
    },
  },
  type: Widget.getWidgetType(),
  name: "Antd 时间选择",
  searchTags: ["time select", "时间选择", "picker"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
    errorMessage: "必填字段",
    rows: 8,
    columns: 20,
    animateLoading: false,
    labelPosition: AntdLabelPosition.Auto,
    widgetName: "AntdTimePicker",
    defaultValue: undefined,
    version: 1,
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    expandAll: false,
    isHoverExpand: false,
    placeholderText: "请选择时间",
    labelText: "标签",
    labelWidth: 6,
    labelTextSize: "0.875rem",
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    format: "HH:mm:ss",
    showNow: true,
    allowEmpty: [false, false],
    disabledTimeRule: {
      label: "禁用时间",
      id: "config",
      config: {
        id: "config",
        // customRanges: [],
        disabledRule: "none",
      },
    },
    isRangePicker: false,
    presetSingle: [
      "5 minutes ago",
      "15 minutes ago",
      "30 minutes ago",
      "1 hour ago",
      "3 hours ago",
      "6 hours ago",
    ],
    presetRange: [
      "past 10 minutes",
      "past 30 minutes",
      "past 1 hour",
      "past 3 hours",
    ],
    showPreset: false,
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
      labelPosition: AntdLabelPosition.Auto,
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
