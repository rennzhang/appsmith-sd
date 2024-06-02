import { LabelPosition } from "components/constants";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import { CONFIG as BaseConfig } from "widgets/BaseInputWidget";
import type { BaseInputWidgetProps } from "widgets/BaseInputWidget/widget";

import IconSVG from "./icon.svg";
import Widget from "./widget";
import type { SnipingModeProperty, PropertyUpdates } from "widgets/constants";
import { WIDGET_TAGS } from "constants/WidgetConstants";

export const CONFIG = {
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      defaultValue: DynamicHeight.FIXED,
      active: true,
    },
  },
  type: Widget.getWidgetType(),
  name: "Antd 自动完成输入框",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD],
  needsMeta: true,
  searchTags: ["form", "text input", "number", "textarea"],
  defaults: {
    ...BaseConfig.defaults,
    labelTextSize: 14,
    options: [
      {
        label: "option1",
        value: "Option 1",
      },
      {
        label: "option2",
        value: "Option 2",
      },
      {
        label: "option3",
        value: "Option 3",
      },
    ],

    // emailOptions: [
    //   { label: "@gmail.com", value: "@gmail.com" },
    //   { label: "@163.com", value: "@163.com" },
    //   { label: "@qq.com", value: "@qq.com" },
    // ],
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
    rows: 7,
    labelPosition: LabelPosition.Top,
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
          propertyPath: "defaultText",
          propertyValue: propValueMap.data,
          isDynamicPropertyPath: true,
        },
      ];
    },
  },
  autoLayout: {
    disabledPropsDefaults: {
      labelPosition: LabelPosition.Top,
      labelTextSize: 14,
    },
    autoDimension: (props: BaseInputWidgetProps) => ({
      height: props.inputType !== "MULTI_LINE_TEXT",
    }),
    defaults: {
      rows: 6.6,
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
