import { AntdLabelPosition } from "components/constants";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { Alignment, ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import { CONFIG as BaseConfig } from "widgets/BaseInputWidget";
import type { BaseInputWidgetProps } from "widgets/BaseInputWidget/widget";

import IconSVG from "./icon.svg";
import Widget from "./widget";
import type { SnipingModeProperty, PropertyUpdates } from "widgets/constants";
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
  name: "Antd 输入框",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  searchTags: ["form", "text input", "number", "textarea"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,

    textareaRowsControlType: "固定值",
    textareaRows: 4,
    textareaMinRows: 2,
    textareaMaxRows: 6,
    labelWidth: 6,
    labelPosition: AntdLabelPosition.Auto,
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    labelTextSize: "0.875rem",
    defaultValue: "",
    // 组件拖拽后的默认高度
    rows: 8,
    // 组件拖拽后的默认宽度
    columns: 16,
    inputType: "TEXT",
    widgetName: "AntdInput",
    version: 2,
    showStepArrows: false,
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
  methods: {
    getSnipingModeUpdates: (
      propValueMap: SnipingModeProperty,
    ): PropertyUpdates[] => {
      return [
        {
          propertyPath: "defaultValue",
          propertyValue: propValueMap.data,
          isDynamicPropertyPath: true,
        },
      ];
    },
  },
  autoLayout: {
    disabledPropsDefaults: {
      // labelPosition: AntdLabelPosition.Auto,
      labelTextSize: "0.875rem",
    },
    autoDimension: (props: BaseInputWidgetProps) => ({
      height: props.inputType !== "MULTI_LINE_TEXT",
    }),
    defaults: {
      rows: 8,
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
    disableResizeHandles: (props: BaseInputWidgetProps) => ({
      vertical: props.inputType !== "MULTI_LINE_TEXT",
    }),
  },
};

export default Widget;
