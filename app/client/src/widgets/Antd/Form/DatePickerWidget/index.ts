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
  name: "Antd 日期选择",
  searchTags: ["tree select", "树"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    errorMessage: "必填字段",
    rows: 8,
    columns: 20,
    animateLoading: false,
    labelPosition: AntdLabelPosition.Auto,
    widgetName: "AntdDatePicker",
    defaultValue: undefined,
    version: 1,
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    expandAll: false,
    isHoverExpand: false,
    placeholderText: "请选择日期",
    labelText: "标签",
    labelWidth: 6,
    labelTextSize: "0.875rem",
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    picker: "date",
    format: "YYYY-MM-DD HH:mm:ss",
    showTime: true,
    allowEmpty: [false, false],
    disabledDateRule: {
      label: "禁用日期",
      id: "config",
      config: {
        id: "config",
        label: "菜单项",
        isVisible: true,
        isDisabled: false,
        offsetWay: "front",
        disabledRule: "none",
        specificYear: "",
        specificQuarters: [],
        specificMonths: [],
        specificDaysOfWeek: [],
        specificDates: [],
        // specificQuarters: [],
      },
    },
    isRangePicker: false,
    presetDate: [
      "today",
      "yesterday",
      "this week",
      "last week",
      "this month",
      "last month",
    ],
    presetRange: ["past 3 days", "past 7 days", "past 30 days"],
    showPreset: true,
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
