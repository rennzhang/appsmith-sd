import { ButtonVariantTypes } from "components/constants";
import { Colors } from "constants/Colors";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import { DynamicHeight } from "utils/WidgetFeatures";
import {
  BlueprintOperationTypes,
  type SnipingModeProperty,
  type PropertyUpdates,
} from "widgets/constants";

import { CONFIG as ANTD_FORM_WIDGET_CONFIG } from "widgets/Antd/Form/FormWidget";

import IconSVG from "./icon.svg";
import type { JSONFormWidgetProps } from "./widget";
import Widget from "./widget";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { theme } from "antd";
import { CONFIG as ANTD_BUTTON_WIDGET_CONFIG } from "widgets/Antd/ButtonWidget";

const SUBMIT_BUTTON_DEFAULT_STYLES = {
  buttonVariant: ButtonVariantTypes.PRIMARY,
};

const RESET_BUTTON_DEFAULT_STYLES = {
  buttonVariant: ButtonVariantTypes.SECONDARY,
};

export const CONFIG = {
  features: {
    dynamicHeight: {
      sectionIndex: 1,
      defaultValue: DynamicHeight.AUTO_HEIGHT,
      active: true,
    },
  },
  type: Widget.getWidgetType(),
  name: "Antd JSON表单",
  searchTags: ["json form"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.INPUTS, WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  defaults: {
    ...ANTD_FORM_WIDGET_CONFIG.defaults,
    buttonAlignment: "flex-start",
    labelAlignment: "left",
    colorPrimary: theme.defaultSeed.colorPrimary,
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    useSourceData: false,
    animateLoading: false,
    backgroundColor: "#fff",
    columns: 35,
    disabledWhenInvalid: true,
    fixedFooter: true,
    rows: 41,
    schema: {},
    scrollContents: true,
    showReset: true,
    title: "表单",
    version: 1,
    borderWidth: "1",
    borderColor: Colors.GREY_5,
    widgetName: "AntdJSONForm",
    autoGenerateForm: true,
    fieldLimitExceeded: false,
    sourceData: {
      name: "John Wick",
      date_of_birth: "20/02/1990",
      employee_id: 1001,
    },
    submitButtonLabel: "提交",
    resetButtonLabel: "重置",
    submitButtonStyles: {
      buttonColor: theme.defaultSeed.colorPrimary,
      ...ANTD_BUTTON_WIDGET_CONFIG.defaults,
      borderRadius: "0.375rem",
      boxShadow: "none",
    },
    resetButtonStyles: {
      buttonColor: theme.defaultSeed.colorPrimary,
      ...ANTD_BUTTON_WIDGET_CONFIG.defaults,
      buttonVariant: ButtonVariantTypes.SECONDARY,
      borderRadius: "0.375rem",
      boxShadow: "none",
    },
    // blueprint: {
    //   operations: [
    //     {
    //       type: BlueprintOperationTypes.MODIFY_PROPS,
    //       fn: (widget: JSONFormWidgetProps) => {
    //         /**
    //          * As submitButtonStyles are objects, the tend to override the submitButtonStyles
    //          * present in the defaults so a merge is necessary to incorporate non theme related props.
    //          */
    //         return [
    //           {
    //             widgetId: widget.widgetId,
    //             propertyName: "submitButtonStyles",
    //             propertyValue: {
    //               ...widget.submitButtonStyles,
    //               ...SUBMIT_BUTTON_DEFAULT_STYLES,
    //             },
    //           },
    //           {
    //             widgetId: widget.widgetId,
    //             propertyName: "resetButtonStyles",
    //             propertyValue: {
    //               ...widget.resetButtonStyles,
    //               ...RESET_BUTTON_DEFAULT_STYLES,
    //             },
    //           },
    //         ];
    //       },
    //     },
    //   ],
    // },
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
          propertyPath: "sourceData",
          propertyValue: propValueMap.data,
          isDynamicPropertyPath: true,
        },
      ];
    },
  },
  autoLayout: {
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "280px",
            minHeight: "300px",
          };
        },
      },
    ],
  },
};

export default Widget;
