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
  name: "Antd 自动完成输入框",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  searchTags: ["form", "text input", "number", "textarea"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,
    ...BaseConfig.defaults,
    labelWidth: 6,
    labelPosition: AntdLabelPosition.Auto,
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    options: ["option1", "option2", "option3"],
    emailOptions: {
      item1: {
        label: "@gmail.com",
        id: "@gmail.com",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 0,
      },
      item2: {
        label: "@163.com",
        id: "@163.com",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 1,
      },
      item3: {
        label: "@qq.com",
        id: "@qq.com",
        widgetId: "",
        isVisible: true,
        isDisabled: false,
        index: 2,
      },
    },
    defaultValue: "",
    // 组件拖拽后的默认高度
    rows: 8,
    // 组件拖拽后的默认宽度
    columns: 24,
    inputType: "TEXT",
    widgetName: "AntdAutoComplete",
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
      labelPosition: AntdLabelPosition.Auto,
      labelTextSize: "0.875rem",
    },
    autoDimension: (props: BaseInputWidgetProps) => ({
      height: props.inputType !== "MULTI_LINE_TEXT",
    }),
    defaults: {
      rows: 8,
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
