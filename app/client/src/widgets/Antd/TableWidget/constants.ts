import type {
  ColumnProperties,
  CompactMode,
  ReactTableFilter,
  TableStyles,
  SortOrderTypes,
  ReactTableColumnProps,
  StickyType,
  AddNewRowActions,
} from "./component/Constants";
import type { WidgetProps } from "widgets/BaseWidget";
import type { WithMeta } from "widgets/MetaHOC";
import type {
  EventType,
  ExecuteTriggerPayload,
} from "constants/AppsmithActionConstants/ActionConstants";
import { IconNames } from "@blueprintjs/icons";
import type { ColumnAction } from "components/propertyControls/ColumnActionSelectorControl";
import type { Alignment } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { ButtonPlacementTypes } from "components/constants";
import { ButtonVariantTypes, type ButtonVariant } from "components/constants";
import type { Row } from "react-table";
import type { Key, ProFormInstance } from "@ant-design/pro-components";
import type { ProTableProps } from "@ant-design/pro-components";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { TablePaginationConfig } from "antd";
export type Action = ExecuteTriggerPayload & {
  updateDependencyType?: ActionUpdateDependency;
};

export type JSONFormState = {
  isJsonFormVisible?: boolean;
  jsonFormData?: Record<string, unknown>;
  jsonFormType?: "edit" | "add" | "view";
  isSubmitting?: boolean;
};
export type JSONFormProps = {
  updateDefaultFormData: (values: any) => void;
  setMetaInternalFieldState: (
    updateCallback: (prevState: JSONFormWidgetState) => JSONFormWidgetState,
    afterUpdateAction?: ExecuteTriggerPayload,
  ) => void;
  onJsonFormSubmit: (
    values: any,
    targetActionName: "onSubmit" | "onSubmitWithEdit",
    cb?: () => void,
  ) => void;
  jsonFormRef: React.RefObject<ProFormInstance<any>>;
  updateWidgetFormData: (values: any, skipConversion?: boolean) => void;
  executeAction: (action: Action) => void;
};
export interface AntdTableProps extends ProTableProps<any, any>, JSONFormProps {
  isTableLoading?: boolean;
  isEditingMode: boolean;
  autoGenerateTableForm: boolean;
  renderMode: RenderMode;
  updateWidgetProperty: (propertyName: string, propertyValue: any) => void;
  updateWidgetMetaProperty: (propertyName: string, propertyValue: any) => void;
  batchUpdateWidgetProperty: (
    updates: BatchPropertyUpdatePayload,
    shouldReplay?: boolean,
  ) => void;
  autoFormConfig: {
    config: JSONFormComponentProps;
  };
  updateNewTableData: (value: any[]) => void;
  // configProviderTheme: any;
  tablePrimaryColor: string;
  toolBarActions: Record<string, ButtonAction>;
  creatorButtonText: string;
  handleColumnSorting: (sortInfo: {
    sortField: Key | undefined;
    sortOrder: SortOrder | undefined;
    column: any;
  }) => void;
  isRemoteSort: boolean;
  handleDragSortEnd: (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: any,
  ) => void;
  tableType: "dragSort" | "edit" | "normal";
  handleAlertBtnClick: (action: string) => void;
  editableColumn: any[];
  handleUrlOrImgClick: (column: any, row?: Record<string, unknown>) => void;
  rowSelectionActions: Record<string, ButtonAction>;
  selectionColumnWidth: number;
  selectedRows: Record<string, any>[];
  selectedRowKeys: React.Key[];
  // 行选择相关
  handleRowSelect: (
    record: any,
    selected: boolean,
    selectedRows: any[],
  ) => void;
  handleRowSelectionChange: (
    selectedRowKeys: React.Key[],
    selectedRows: any[],
  ) => void;
  allowRowSelection: boolean;
  rowSelectionType: "checkbox" | "radio";
  // TODO: 暂未适配改属性
  preserveSelectedRowKeys?: boolean;
  hideSelectAll: boolean;
  rowSelectionFixed: boolean;
  rowSelectionColumnWidth: number;
  rowSelectionColumnTitle: string;
  rowSelectionColumnAlign: "left" | "center" | "right";
  rowSelectionColumnRender: (
    value: any,
    row: any,
    index: number,
  ) => React.ReactNode;
  addNewRowText: string;
  defaultNewRow: Record<string, unknown>;
  addNewRowPosition: "top" | "bottom";
  handleAddNewRow: (id: string | number) => void;
  editType: "single" | "multiple";
  editableKeys: Key[];
  editableRecords: Record<string, unknown>[];
  defaultExpandAllRows: boolean;
  defaultExpandedRowKeys: Key[];
  expandedKeys: Key[];
  handleCellValueChange: (
    value: any,
    alias: string,
    column: ReactTableColumnProps,
  ) => void;

  handleEditableRowChange: (data: {
    editableKeys: React.Key[];
    editableRecords: Record<string, unknown>[];
  }) => void;
  handleEditableValuesChange: TableWidgetProps["handleEditableValuesChange"];
  handleSwitchValueChange: TableWidgetProps["handleSwitchValueChange"];
  handleRowClick: TableWidgetProps["handleRowClick"];
  isVirtual: boolean;
  hideOnSinglePage: boolean;
  paginationSize: "default" | "small";
  showQuickJumper: boolean;
  simplePagination: boolean;
  paginationDisabled: boolean;
  primaryColumns: Record<string, ColumnProperties>;
  tableBackground: string;
  defaultPageSize: number;
  showSizeChanger: boolean;
  headerBorderRadius: string;
  cardBorderedSearch: boolean;
  cardBorderedTable: boolean;
  enableSearchFormValidation: boolean;
  tableInlineEditType?: TableInlineEditTypes;
  expandRowByClick?: boolean;
  handleExpandedRowsChange: (expandedKeys: Key[]) => void;
  onExpand: (expanded: boolean, record: any) => void;
  childrenColumnName: string;
  isActionFixed?: boolean;
  actionWidth?: number;
  editableCell?: EditableCell;
  variant?: TableVariant;
  handleRowBtnClick: TableWidgetProps["handleRowBtnClick"];
  columnActions: Record<string, ButtonAction>;
  editingActions: Record<string, ButtonAction>;
  textSize?: string;
  compactMode?: SizeType;
  queryData: Record<string, any>;
  tableData: Record<string, unknown>[];
  width: number;
  height: number;
  pageSize: number;
  widgetId: string;
  widgetName: string;
  searchKey: string;
  isLoading: boolean;
  columnWidthMap?: { [key: string]: number };
  columns: ReactTableColumnProps[];
  filteredTableData: Array<
    Record<string, unknown> & {
      __originalIndex__: number;
      __primaryKey__: string;
    }
  >;
  data: Array<Record<string, unknown>>;
  filters?: ReactTableFilter[];
  totalRecordsCount?: number;
  editMode: boolean;
  // editableCell: EditableCell;
  applyFilter: (filters: ReactTableFilter[]) => void;
  handleReorderColumn: (columnOrder: string[]) => void;
  handleColumnFreeze?: (columnName: string, sticky?: StickyType) => void;
  pageNo: number;
  updatePageSize: (pageSize: number) => void;
  updatePageNo: (pageNo: number, event?: EventType) => void;
  multiRowSelection?: boolean;
  nextPageClick: () => void;
  prevPageClick: () => void;
  serverSidePaginationEnabled: boolean;
  disableDrag: (disable: boolean) => void;
  triggerRowSelection: boolean;
  searchTableData: (searchKey: any) => void;
  // filters?: ReactTableFilter[];
  // applyFilter: (filters: ReactTableFilter[]) => void;
  // compactMode?: CompactMode;
  isVisibleDownload?: boolean;
  isVisiblePagination?: boolean;
  isVisibleSearch?: boolean;
  isVisibleDensity?: boolean;
  isVisibleFullScreen?: boolean;
  isVisibleRefresh?: boolean;
  isVisibleCellSetting?: boolean;
  delimiter: string;
  accentColor: string;
  borderRadius: string;
  boxShadow?: BoxShadow;
  borderWidth?: number;
  borderColor?: string;
  onBulkEditDiscard: () => void;
  onBulkEditSave: () => void;
  // variant?: TableVariant;
  primaryColumnId: string;
  isAddRowInProgress: boolean;
  allowAddNewRow: boolean;
  // onAddNewRowAction: (
  //   type: AddNewRowActions,
  //   onActionComplete: () => void,
  // ) => void;
  disabledAddNewRowSave: boolean;
  // handleColumnFreeze?: (columnName: string, sticky?: StickyType) => void;
  canFreezeColumn?: boolean;
  showConnectDataOverlay: boolean;
  onConnectData: () => void;
  handleQueryDataChange: (
    queryData: Record<string, unknown>,
    isInit?: boolean,
  ) => void;
}

export type MenuItemAction = {
  id: string;
  index: number;
  label: string;
  widgetId: string;
  isDisabled: boolean;
  isVisible: boolean;
  onClick?: string;
  iconName: IconName;
  iconAlign: Alignment;
  backgroundColor: string;
  iconColor: string;
  textColor: string;
};

export interface ButtonAction {
  isHiddenItem?: boolean;
  placement?: ButtonPlacementTypes;
  textColor: string;
  loading?: boolean;
  iconColor: string;
  popconfirmMessage: string;
  btnIconName: IconName;
  iconName: IconName;
  iconAlign: Alignment;
  buttonType: ButtonTypes;
  label: string;
  id: string;
  widgetId: string;
  index: number;
  tooltip: string;
  buttonLabel: string;
  boxShadow: string;
  borderRadius: string;
  buttonColor: string;
  buttonSize: string;
  buttonVariant: ButtonVariant;
  isDisabled: boolean;
  onBtnClick: string;
  showButton: boolean;
  menuButtonLabel: string;
  menuIconName: IconName;
  menuTooltip: string;
  menuItems: {
    [key: string]: MenuItemAction;
  };
}

export type EditableCell = {
  column: string;
  index: number;
  value: string | number | null;
  initialValue: string;
  inputValue: string;
};

export enum PaginationDirection {
  INITIAL = "INITIAL",
  PREVIOUS_PAGE = "PREVIOUS_PAGE",
  NEXT_PAGE = "NEXT_PAGE",
}

export enum EditableCellActions {
  SAVE = "SAVE",
  DISCARD = "DISCARD",
}

export enum TableInlineEditTypes {
  ROW_LEVEL = "ROW_LEVEL",
  TABLE_LEVEL = "TABLE_LEVEL",
  CUSTOM = "CUSTOM",
}

interface AddNewRowProps {
  isAddRowInProgress: boolean;
  allowAddNewRow: boolean;
  onAddNewRowSave: string;
  onAddNewRowDiscard: string;
  defaultNewRow: Record<string, unknown>;
}
export interface TableWidgetProps
  extends WidgetProps,
    WithMeta,
    TableStyles,
    AddNewRowProps {
  queryData: Record<string, any>;
  pristine: boolean;
  nextPageKey?: string;
  prevPageKey?: string;
  label: string;
  searchText: string;
  defaultSearchText: string;
  defaultSelectedRowKeys?: number[] | string;
  tableData: Array<Record<string, unknown>>;
  onPageChange?: string;
  pageSize: number;
  onRowSelected?: string;
  onSearchTextChanged: string;
  onSort: string;
  selectedRowKeys: Key[];
  serverSidePaginationEnabled?: boolean;
  multiRowSelection?: boolean;
  rowSelectionType: "checkbox" | "radio";
  // enableClientSideSearch?: boolean;
  hiddenColumns?: string[];
  columnOrder?: string[];
  frozenColumnIndices: Record<string, number>;
  canFreezeColumn?: boolean;
  columnNameMap?: { [key: string]: string };
  columnTypeMap?: {
    [key: string]: { type: string; format: string; inputFormat?: string };
  };
  columnWidthMap?: { [key: string]: number };
  filters?: ReactTableFilter[];
  compactMode?: SizeType;
  primaryColumnId: string;
  primaryColumns: Record<string, ColumnProperties>;
  derivedColumns: Record<string, ColumnProperties>;
  sortOrder: {
    column: string;
    order: SortOrderTypes | null;
  };
  totalRecordsCount?: number;
  transientTableData: {
    [key: string]: Record<string, string>;
  };
  editableCell?: EditableCell;
  primaryColor: string;
  borderRadius: string;
  boxShadow?: BoxShadow;
  tableInlineEditType?: TableInlineEditTypes;
  variant?: TableVariant;
  selectColumnFilterText?: Record<string, string>;
  isAddRowInProgress: boolean;
  newRow: Record<string, unknown>;
  firstEditableColumnIdByOrder: string;
}

export enum TableVariantTypes {
  DEFAULT = "DEFAULT",
  VARIANT2 = "VARIANT2",
  VARIANT3 = "VARIANT3",
}

export type TableVariant = keyof typeof TableVariantTypes;

export const ORIGINAL_INDEX_KEY = "__originalIndex__";

export const PRIMARY_COLUMN_KEY_VALUE = "__primaryKey__";

export const DEFAULT_COLUMN_WIDTH = 150;

export const COLUMN_MIN_WIDTH = 60;

export const TABLE_COLUMN_ORDER_KEY = "tableWidgetColumnOrder";

export const ORIGINAL_INDEX_PATH_KEY = "__originalIndexPath__";
export enum ButtonTypes {
  BUTTON = "button",
  ICON_BUTTON = "iconButton",
  MENU_BUTTON = "menuButton",
}
export enum ColumnTypes {
  TEXT = "input",
  URL = "url",
  NUMBER = "digit",
  IMAGE = "image",
  VIDEO = "video",
  DATE = "date",
  DATE_RANGE = "dateRange",
  SELECT = "select",
  // EDIT_ACTIONS = "editActions",
  CHECKBOX = "checkbox",
  SWITCH = "switch",
  PASSWORD = "password",
  MONEY = "money",
  RADIO = "radio",
  // color
  COLOR = "color",
  // textarea
  TEXTAREA = "textarea",
  INDEX = "index",
  INDEX_BORDER = "indexBorder",
  // PROGRESS = "progress",
  // CODE = "code",
  // JSON_CODE = "jsonCode",
  // CASCADER = "cascader",
  // TREE_SELECT = "treeSelect",
  // SEGMENTED = "segmented",
  // GROUP = "group",
}

export enum ReadOnlyColumnTypes {
  TEXT = "inpu",
  URL = "url",
  NUMBER = "number",
  // IMAGE = "image",
  VIDEO = "video",
  DATE = "date",
  CHECKBOX = "checkbox",
  SWITCH = "switch",
  SELECT = "select",
  PASSWORD = "password",
}

export const FilterableColumnTypes = [
  ColumnTypes.TEXT,
  ColumnTypes.URL,
  ColumnTypes.NUMBER,
  ColumnTypes.DATE,
  ColumnTypes.SELECT,
  ColumnTypes.CHECKBOX,
  ColumnTypes.SWITCH,
];

export const DEFAULT_BUTTON_COLOR = "rgb(3, 179, 101)";

export const DEFAULT_BUTTON_LABEL = "动作";

export const DEFAULT_MENU_VARIANT = "PRIMARY";

export const DEFAULT_MENU_BUTTON_LABEL = "打开菜单";

export type TransientDataPayload = {
  [key: string]: string | number | boolean;
  __originalIndex__: number;
};

export type OnColumnEventArgs = {
  // rowIndex: number;
  rowKey?: string;
  action: string;
  onComplete?: () => void;
  triggerPropertyName: string;
  eventType: EventType;
  row?: Record<string, unknown>;
  additionalData?: Record<string, unknown>;
  callbackData?: any[];
};

export const ICON_NAMES = Object.keys(IconNames).map(
  (name: string) => IconNames[name as keyof typeof IconNames],
);

export type ButtonColumnActions = ColumnAction & {
  eventType: EventType;
  iconName?: IconName;
  variant: ButtonVariant;
  backgroundColor?: string;
  iconAlign?: Alignment;
  borderRadius?: string;
  isVisible?: boolean;
  isDisabled?: boolean;
  boxShadow?: string;
};

export enum DateInputFormat {
  EPOCH = "Epoch",
  MILLISECONDS = "Milliseconds",
}

export const defaultEditableCell = {
  column: "",
  index: -1,
  inputValue: "",
  value: "",
  initialValue: "",
};
import { Colors } from "constants/Colors";
import type { SortOrder } from "antd/es/table/interface";
import type { ActionUpdateDependency } from "widgets/JSONFormWidget/constants";
import type { RenderMode, RenderModes } from "constants/WidgetConstants";
import type { JSONFormWidgetState } from "widgets/JSONFormWidget/widget";
import type { JSONFormComponentProps } from "widgets/Antd/JSONFormWidget/component";
import type { BoxShadow } from "components/designSystems/appsmith/WidgetStyleContainer";
import type { BatchPropertyUpdatePayload } from "actions/controlActions";

export const DEFAULT_COLUMN_NAME = "Table Column";

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD HH:mm";
export const BUTTON_DEFAULT_CONFIG = {
  borderRadius: "0.375rem",
  boxShadow: "none",
  buttonSize: "small",
  buttonVariant: ButtonVariantTypes.TERTIARY,
  buttonType: ButtonTypes.BUTTON,
  buttonColor: Colors.AZURE_RADIANCE,
  showButton: true,
  isDisabled: false,
};
