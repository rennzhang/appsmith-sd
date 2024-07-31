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
  name: "Antd 滑动输入条",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      active: true,
    },
  },
  searchTags: ["slider", "滑动输入条"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    heightForVertical: "200px",
    tooltips: "{{currentValue}}",
    min: 0,
    max: 100,
    step: 1,
    rows: 6,
    columns: 20,
    animateLoading: false,
    label: "标签",
    labelPosition: AntdLabelPosition.Auto,
    labelTextSize: 14,
    labelWidth: 6,
    defaultValue: 2,
    isRequired: false,
    isDisabled: false,
    isInline: true,
    alignment: Alignment.LEFT,
    widgetName: "AntdSlider",
    version: 1,
    accentColor: Colors.ROYAL_BLUE_2,
    hoverColor: Colors.ROYAL_BLUE,
    startIconName: "",
    endsIconName: "",
    displayContent: "none",
    controlSize: "default",
    startText: "",
    endText: "",
    loading: false,
    displayContentColor: "rgba(0, 0, 0, 0.25)",
    placement: "top",
    keyboard: false,
    marks: {
      0: "0°C",
      26: "26°C",
      37: "37°C",
      100: {
        style: {
          color: "#f50",
          fontWeight: 900,
        },
        label: "100°C",
      },
    },
    isInc: true,
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
