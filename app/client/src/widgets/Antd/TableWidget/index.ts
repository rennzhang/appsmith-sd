import { Colors } from "constants/Colors";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import type { WidgetProps } from "widgets/BaseWidget";
import { ColumnTypes, InlineEditingSaveOptions } from "./constants";
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
    columnActions: {
      edit: {
        columnType: ColumnTypes.BUTTON,
        label: "编辑",
        id: "edit",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 0,
        tooltip: "编辑",
        buttonLabel: "编辑",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "edit",
        onBtnClick: "{{showAlert('请先配置编辑按钮的动作', 'warning');}}",
      },
      delete: {
        columnType: ColumnTypes.BUTTON,
        label: "删除",
        id: "delete",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 1,
        tooltip: "删除",
        buttonLabel: "删除",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "trash",
        onBtnClick: "{{showAlert('请先配置删除按钮的动作', 'warning');}}",
      },
    },
    isVisibleSearchForm: true,
    actionWidth: 100,
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    rows: 28,
    canFreezeColumn: true,
    animateLoading: true,
    isVisibleDensity: true,
    isVisibleCellSetting: true,
    isVisibleRefresh: true,
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
    defaultPageSize: 10,
    dynamicPropertyPathList: [],
    borderColor: Colors.GREY_5,
    borderWidth: "1",
    dynamicBindingPathList: [],
    primaryColumns: {},
    tableData: "",
    columnWidthMap: {},
    columnOrder: [],
    // enableClientSideSearch: true,
    multiRowSelection: false,
    isVisibleSearch: true,
    isVisibleFilters: true,
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
