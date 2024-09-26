import { Colors } from "constants/Colors";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import type { WidgetProps } from "widgets/BaseWidget";
import { ButtonTypes, ColumnTypes, TableInlineEditTypes } from "./constants";
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
    addNewRowText: "新增一行",
    allowAddNewRow: false,
    addNewRowPosition: "bottom",
    editableKeys: [],
    editType: "multiple",
    rightColumn: 64,
    rows: 48,
    columns: 64,
    width: 456,
    rowSelectionActions: {
      // 批量删除
      delete: {
        menuButtonLabel: "批量删除",
        buttonType: ButtonTypes.BUTTON,
        label: "批量删除",
        id: "delete",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 0,
        tooltip: "批量删除",
        buttonLabel: "批量删除",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:DeleteOutlined",
        onBtnClick: "{{showAlert('请先配置批量删除按钮的动作', 'warning');}}",
      },
      // 导出数据
      export: {
        menuButtonLabel: "导出数据",
        buttonType: ButtonTypes.BUTTON,
        label: "导出数据",
        id: "export",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 1,
        tooltip: "导出数据",
        buttonLabel: "导出数据",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:DownloadOutlined",
        onBtnClick: "{{showAlert('请先配置导出数据按钮的动作', 'warning');}}",
      },
    },
    editingActions: {
      save: {
        buttonType: ButtonTypes.BUTTON,
        label: "保存",
        id: "save",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 0,
        tooltip: "保存",
        buttonLabel: "保存",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:SaveOutlined",
        onBtnClick: "{{showAlert('请先配置保存按钮的动作', 'warning');}}",
        isHideDelete: true,
      },
      delete: {
        buttonType: ButtonTypes.BUTTON,
        label: "删除",
        id: "delete",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 1,
        tooltip: "删除",
        buttonLabel: "删除",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:DeleteOutlined",
        onBtnClick: "{{showAlert('请先配置删除按钮的动作', 'warning');}}",
        isHideDelete: true,
      },
      cancel: {
        buttonType: ButtonTypes.BUTTON,
        label: "取消",
        id: "cancel",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 1,
        tooltip: "取消",
        buttonLabel: "取消",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:CloseOutlined",
        onBtnClick: "{{showAlert('请先配置取消按钮的动作', 'warning');}}",
        isHideDelete: true,
      },
    },
    columnActions: {
      edit: {
        menuButtonLabel: "编辑",
        isHideDelete: true,
        buttonType: ButtonTypes.BUTTON,
        label: "编辑",
        id: "edit",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 0,
        tooltip: "编辑",
        buttonLabel: "编辑",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:EditOutlined",
        onBtnClick: "{{showAlert('请先配置编辑按钮的动作', 'warning');}}",
      },
      delete: {
        menuButtonLabel: "删除",
        buttonType: ButtonTypes.BUTTON,
        label: "删除",
        id: "delete",
        widgetId: "",
        showButton: true,
        isDisabled: false,
        index: 1,
        tooltip: "删除",
        buttonLabel: "删除",
        buttonColor: Colors.AZURE_RADIANCE,
        btnIconName: "ant-design:DeleteOutlined",
        onBtnClick: "{{showAlert('请先配置删除按钮的动作', 'warning');}}",
      },
    },
    showSizeChanger: true,
    defaultPageSize: 10,
    paginationDisabled: false,
    simplePagination: false,
    hideOnSinglePage: false,
    paginationSize: "default",
    showQuickJumper: true,
    headerBorderRadius: 0,
    // borderRadius: 0,
    isVisibleSearchForm: true,
    actionWidth: 130,
    responsiveBehavior: ResponsiveBehavior.Fill,
    minWidth: FILL_WIDGET_MIN_WIDTH,
    canFreezeColumn: true,
    animateLoading: true,
    isVisibleDensity: true,
    isVisibleCellSetting: true,
    isVisibleRefresh: true,
    columnUpdatedAt: Date.now(),
    defaultSelectedRowIndex: undefined,
    defaultSelectedRowKeys: [],
    label: "数据",
    widgetName: "ProTable",
    searchKey: "",
    textSize: "0.875rem",
    horizontalAlignment: "LEFT",
    verticalAlignment: "CENTER",
    totalRecordsCount: 0,
    dynamicPropertyPathList: [],
    borderColor: Colors.GREY_5,
    borderWidth: "1",
    dynamicBindingPathList: [],
    primaryColumns: {},
    tableData: "",
    childrenColumnName: "children",
    columnWidthMap: {},
    columnOrder: [],
    // enableClientSideSearch: true,
    multiRowSelection: false,
    isVisibleSearch: true,
    isVisibleDownload: true,
    isVisiblePagination: true,
    serverSidePaginationEnabled: true,
    allowRowSelection: false,
    rowSelectionType: "checkbox",
    isSortable: true,
    delimiter: ",",
    version: 2,
    tableInlineEditType: TableInlineEditTypes.ROW_LEVEL,
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
