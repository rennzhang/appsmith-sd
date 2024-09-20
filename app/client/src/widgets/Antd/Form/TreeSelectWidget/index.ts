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
  name: "Antd 树选择",
  searchTags: ["tree select", "树"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    treeExpandAction: "click",
    treeLine: false,
    errorMessage: "必填字段",
    rows: 8,
    columns: 20,
    animateLoading: false,
    labelPosition: AntdLabelPosition.Auto,
    // options: [
    //   {
    //     label: "蓝",
    //     value: "BLUE",
    //     children: [
    //       {
    //         label: "深蓝",
    //         value: "DARK BLUE",
    //       },
    //       {
    //         label: "浅蓝",
    //         value: "LIGHT BLUE",
    //       },
    //     ],
    //   },
    //   { label: "绿", value: "GREEN" },
    //   { label: "红", value: "RED" },
    // ],
    options: [
      {
        value: "parent 1",
        label: "parent 1",
        children: [
          {
            value: "parent 1-0",
            label: "parent 1-0",
            children: [
              {
                value: "leaf1",
                label: "my leaf",
              },
              {
                value: "leaf2",
                label: "your leaf",
              },
            ],
          },
          {
            value: "parent 1-1",
            label: "parent 1-1",
            children: [
              {
                value: "disabled_node",
                label: "disabled node",
                disabled: true,
              },
            ],
          },
        ],
      },
    ],
    widgetName: "AntdTreeSelect",
    defaultValue: undefined,
    defaultLabel: undefined,
    defaultSelectedLabel: [],
    version: 1,
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    expandAll: false,
    isHoverExpand: false,
    placeholderText: "请选择",
    labelText: "标签",
    labelWidth: 6,
    labelTextSize: "0.875rem",
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
