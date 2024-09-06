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
import type { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { IconNames } from "@blueprintjs/icons";
import type { ColumnAction } from "components/propertyControls/ColumnActionSelectorControl";
import type { Alignment } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { ButtonVariant } from "components/constants";
import type { Row } from "react-table";
import { ProTableProps } from "@ant-design/pro-components";
// export enum ColumnTypes {
//   TEXT = "text",
//   URL = "url",
//   NUMBER = "digit",
//   IMAGE = "image",
//   VIDEO = "video",
//   DATE = "date",
//   BUTTON = "button",
//   ICON_BUTTON = "iconButton",
//   MENU_BUTTON = "menuButton",
//   SELECT = "select",
//   EDIT_ACTIONS = "editActions",
//   CHECKBOX = "checkbox",
//   SWITCH = "switch",
// }
export interface AntdTableProps {
  enableSearchFormValidation: boolean;
  inlineEditingSaveOption?:  InlineEditingSaveOptions
  expandRowByClick?: boolean;
  onExpand: (expanded: boolean, record: any) => void;
  childrenColumnName: string;
  isActionFixed?: boolean;
  actionWidth?: number;
  editableCell: EditableCell;
  variant?: TableVariant;
  columnActionClick: (
    onClick: string | undefined,
    record: Record<string, any>,
    index: number,
  ) => void;
  columnActions: ButtonAction[];
  compactMode?: CompactMode;
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
  data: Array<Record<string, unknown>>;
  filters?: ReactTableFilter[];
  totalRecordsCount?: number;
  editMode: boolean;
  onAddNewRowAction: (
    type: AddNewRowActions,
    onActionComplete: () => void,
  ) => void;
  // editableCell: EditableCell;
  applyFilter: (filters: ReactTableFilter[]) => void;
  sortTableColumn: (columnIndex: number, asc: boolean) => void;
  handleResizeColumn: (columnWidthMap: { [key: string]: number }) => void;
  handleReorderColumn: (columnOrder: string[]) => void;
  handleColumnFreeze?: (columnName: string, sticky?: StickyType) => void;
  selectTableRow: (row: {
    original: Record<string, unknown>;
    index: number;
  }) => void;
  pageNo: number;
  updatePageNo: (pageNo: number, event?: EventType) => void;
  multiRowSelection?: boolean;
  isSortable?: boolean;
  nextPageClick: () => void;
  prevPageClick: () => void;
  serverSidePaginationEnabled: boolean;
  selectedRowIndex: number;
  selectedRowIndices: number[];
  disableDrag: (disable: boolean) => void;
  enableDrag: () => void;
  toggleAllRowSelect: (
    isSelect: boolean,
    pageData: Row<Record<string, unknown>>[],
  ) => void;
  triggerRowSelection: boolean;
  searchTableData: (searchKey: any) => void;
  // filters?: ReactTableFilter[];
  // applyFilter: (filters: ReactTableFilter[]) => void;
  // compactMode?: CompactMode;
  isVisibleDownload?: boolean;
  isVisibleFilters?: boolean;
  isVisiblePagination?: boolean;
  isVisibleSearch?: boolean;
  isVisibleDensity?: boolean;
  isVisibleFullScreen?: boolean;
  isVisibleRefresh?: boolean;
  isVisibleCellSetting?: boolean;
  delimiter: string;
  accentColor: string;
  borderRadius: string;
  boxShadow: string;
  borderWidth?: number;
  borderColor?: string;
  onBulkEditDiscard: () => void;
  onBulkEditSave: () => void;
  // variant?: TableVariant;
  primaryColumnId?: string;
  isAddRowInProgress: boolean;
  allowAddNewRow: boolean;
  onAddNewRow: () => void;
  // onAddNewRowAction: (
  //   type: AddNewRowActions,
  //   onActionComplete: () => void,
  // ) => void;
  disabledAddNewRowSave: boolean;
  // handleColumnFreeze?: (columnName: string, sticky?: StickyType) => void;
  canFreezeColumn?: boolean;
  showConnectDataOverlay: boolean;
  onConnectData: () => void;
  onQueryDataChange: (
    queryData: Record<string, unknown>,
    isInit?: boolean,
  ) => void;
  disableAddNewRow: boolean;
}

export interface ButtonAction {
  btnIconName: IconName;
  iconName: IconName;
  iconAlign: Alignment;
  columnType:
    | ColumnTypes.BUTTON
    | ColumnTypes.ICON_BUTTON
    | ColumnTypes.MENU_BUTTON;
  label: string;
  id: string;
  widgetId: string;
  index: number;
  tooltip: string;
  buttonLabel: string;
  boxShadow: string;
  borderRadius: string;
  buttonColor: string;
  buttonVariant: ButtonVariant;
  isDisabled: boolean;
  onBtnClick: string;
  showButton: boolean;
  menuButtonLabel: string;
  menuIconName: IconName;
  menuTooltip: string;
  menuItems: {
    [key: string]: {
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

export enum InlineEditingSaveOptions {
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
  defaultSelectedRowIndex?: number | string;
  defaultSelectedRowIndices?: number[] | string;
  tableData: Array<Record<string, unknown>>;
  onPageChange?: string;
  pageSize: number;
  onRowSelected?: string;
  onSearchTextChanged: string;
  onSort: string;
  selectedRowIndex?: number;
  selectedRowIndices: number[];
  serverSidePaginationEnabled?: boolean;
  multiRowSelection?: boolean;
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
  compactMode?: CompactMode;
  isSortable?: boolean;
  primaryColumnId?: string;
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
  boxShadow?: string;
  inlineEditingSaveOption?: InlineEditingSaveOptions;
  showInlineEditingOptionDropdown?: boolean;
  variant?: TableVariant;
  isEditableCellsValid: Record<string, boolean>;
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

export enum ColumnTypes {
  TEXT = "text",
  URL = "url",
  NUMBER = "digit",
  IMAGE = "image",
  VIDEO = "video",
  DATE = "date",
  BUTTON = "button",
  ICON_BUTTON = "iconButton",
  MENU_BUTTON = "menuButton",
  SELECT = "select",
  EDIT_ACTIONS = "editActions",
  CHECKBOX = "checkbox",
  SWITCH = "switch",
  PASSWORD = "password",
  MONY = "money",
  RADIO = "radio",
  // color
  COLOR = "color",
  // textarea
  TEXTAREA = "textarea",


}

export enum ReadOnlyColumnTypes {
  TEXT = "text",
  URL = "url",
  NUMBER = "number",
  IMAGE = "image",
  VIDEO = "video",
  DATE = "date",
  CHECKBOX = "checkbox",
  SWITCH = "switch",
  SELECT = "select",
  PASSWORD = "password",

}

export const ActionColumnTypes = [
  ColumnTypes.BUTTON,
  ColumnTypes.ICON_BUTTON,
  ColumnTypes.MENU_BUTTON,
  ColumnTypes.EDIT_ACTIONS,
];

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
  rowIndex: number;
  action: string;
  onComplete?: () => void;
  triggerPropertyName: string;
  eventType: EventType;
  row?: Record<string, unknown>;
  additionalData?: Record<string, unknown>;
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

export const DEFAULT_COLUMN_NAME = "Table Column";
