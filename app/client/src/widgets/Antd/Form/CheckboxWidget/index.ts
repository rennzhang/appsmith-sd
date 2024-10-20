import { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import type { SnipingModeProperty, PropertyUpdates } from "widgets/constants";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DEFAULT_CONFIG } from "../CONST/DEFAULT_CONFIG";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "Antd 多选框",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      active: true,
    },
  },
  searchTags: ["choice", "radio group"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,

    rows: 6,
    columns: 20,
    animateLoading: false,
    labelWidth: 6,
    options: [
      { label: "红", value: "red" },
      { label: "蓝", value: "blue" },
      { label: "绿", value: "green" },
    ],
    selectedLabel: ["红", "蓝"],
    defaultValue: ["red", "blue"],
    isRequired: false,
    isDisabled: false,
    isInline: true,
    alignment: Alignment.LEFT,
    widgetName: "AntdCheckbox",
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
  methods: {
    getSnipingModeUpdates: (
      propValueMap: SnipingModeProperty,
    ): PropertyUpdates[] => {
      return [
        {
          propertyPath: "options",
          propertyValue: propValueMap.data,
          isDynamicPropertyPath: true,
        },
      ];
    },
  },
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
