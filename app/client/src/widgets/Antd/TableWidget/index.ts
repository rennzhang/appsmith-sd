import { Colors } from "constants/Colors";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import type { WidgetProps } from "widgets/BaseWidget";
import { InlineEditingSaveOptions } from "./constants";
import type { TableWidgetProps } from "./constants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import type {
  WidgetQueryConfig,
  WidgetQueryGenerationFormConfig,
} from "WidgetQueryGenerators/types";
import type { PropertyUpdates, SnipingModeProperty } from "widgets/constants";
import { WIDGET_TAGS } from "constants/WidgetConstants";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "antd 表格",
  searchTags: ["datagrid", "table"],
  iconSVG: IconSVG,
  isCanvas: true,
  tags: [WIDGET_TAGS.ANTD],
  needsMeta: true,
  needsHeightForContent: true,
  defaults: {
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    rows: 28,
    canFreezeColumn: true,
    animateLoading: true,
    columnUpdatedAt: Date.now(),
    columns: 34,
    defaultSelectedRowIndex: 0,
    defaultSelectedRowIndices: [0],
    label: "数据",
    widgetName: "ProTable",
    searchKey: "",
    textSize: "0.875rem",
    horizontalAlignment: "LEFT",
    verticalAlignment: "CENTER",
    totalRecordsCount: 0,
    defaultPageSize: 0,
    dynamicPropertyPathList: [],
    borderColor: Colors.GREY_5,
    borderWidth: "1",
    dynamicBindingPathList: [],
    primaryColumns: {},
    tableData: "",
    columnWidthMap: {},
    columnOrder: [],
    // enableClientSideSearch: true,
    isVisibleSearch: true,
    isVisibleFilters: true,
    isFilterable: true,
    isVisibleDownload: true,
    isVisiblePagination: true,
    serverSidePaginationEnabled: true,

    isSortable: true,
    delimiter: ",",
    version: 2,
    inlineEditingSaveOption: InlineEditingSaveOptions.ROW_LEVEL,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
    loadingProperties: Widget.getLoadingProperties(),
    autocompleteDefinitions: Widget.getAutocompleteDefinitions(),
    setterConfig: Widget.getSetterConfig(),
  },
  methods: {
    getQueryGenerationConfig: (widgetProps: WidgetProps) => {
      return Widget.getQueryGenerationConfig(widgetProps);
    },
    getPropertyUpdatesForQueryBinding: (
      queryConfig: WidgetQueryConfig,
      widget: WidgetProps,
      formConfig: WidgetQueryGenerationFormConfig,
    ) => {
      return Widget.getPropertyUpdatesForQueryBinding(
        queryConfig,
        widget as TableWidgetProps,
        formConfig,
      );
    },
    getSnipingModeUpdates: (
      propValueMap: SnipingModeProperty,
    ): PropertyUpdates[] => {
      return [
        {
          propertyPath: "tableData",
          propertyValue: propValueMap.data,
          isDynamicPropertyPath: false,
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
            minWidth: "100%",
            minHeight: "400px",
          };
        },
      },
    ],
  },
};

export default Widget;
