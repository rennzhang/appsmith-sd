import { AntdLabelPosition } from "components/constants";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import { WIDGET_TAGS } from "constants/WidgetConstants";

import IconSVG from "./icon.svg";
import Widget from "./widget";
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
  name: "Antd 文本展示",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  searchTags: ["form", "text display"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    textSize: "0.875rem",
    textColor: "#000000",
    textStyle: "normal",
    rows: 4,
    columns: 16,
    labelWidth: 6,
    labelPosition: AntdLabelPosition.Auto,
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    defaultValue: "",
    widgetName: "AntdTextDisplay",
    version: 1,
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
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
      labelTextSize: "0.875rem",
    },
    defaults: {
      rows: 4,
      columns: 24,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "120px",
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
