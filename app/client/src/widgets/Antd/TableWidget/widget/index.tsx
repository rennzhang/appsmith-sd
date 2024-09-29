import type { Key } from "react";
import { lazy, Suspense } from "react";
import log from "loglevel";
import memoizeOne from "memoize-one";

import _, {
  isNumber,
  isString,
  isNil,
  xor,
  without,
  xorWith,
  isEmpty,
  union,
  isObject,
  pickBy,
  filter,
  merge,
  last,
} from "lodash";

import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { WidgetType } from "constants/WidgetConstants";
import { RenderModes, WIDGET_PADDING } from "constants/WidgetConstants";
import type { ExecuteTriggerPayload } from "constants/AppsmithActionConstants/ActionConstants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import Skeleton from "components/utils/Skeleton";
import { noop, retryPromise } from "utils/AppsmithUtils";
import { SORT_ORDER } from "../component/Constants";
import { StickyType } from "../component/Constants";
import type { ReactTableFilter } from "../component/Constants";
import { AddNewRowActions, DEFAULT_FILTER } from "../component/Constants";
import type {
  EditableCell,
  OnColumnEventArgs,
  TableWidgetProps,
  TransientDataPayload,
} from "../constants";
import {
  ColumnTypes,
  defaultEditableCell,
  EditableCellActions,
  ORIGINAL_INDEX_KEY,
  TABLE_COLUMN_ORDER_KEY,
  PaginationDirection,
  ORIGINAL_INDEX_PATH_KEY,
} from "../constants";
import derivedProperties from "./parseDerivedProperties";
import {
  getAllTableColumnKeys,
  getDefaultColumnProperties,
  getDerivedColumns,
  getTableStyles,
  getColumnType,
  deleteLocalTableColumnOrderByWidgetId,
  getColumnOrderByWidgetIdFromLS,
  generateLocalNewColumnOrderFromStickyValue,
  updateAndSyncTableLocalColumnOrders,
  getAllStickyColumnsCount,
} from "./utilities";
import type {
  ColumnProperties,
  ReactTableColumnProps,
} from "../component/Constants";
import { CompactModeTypes, SortOrderTypes } from "../component/Constants";
import contentConfig from "./propertyConfig/contentConfig";
import styleConfig from "./propertyConfig/styleConfig";
import type { BatchPropertyUpdatePayload } from "actions/controlActions";
import equal from "fast-deep-equal/es6";
import {
  sanitizeKey,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import { klona as clone } from "klona";
import localStorage from "utils/localStorage";
import { generateNewColumnOrderFromStickyValue } from "./utilities";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import type { getColumns } from "./reactTableUtils/getColumnsPureFn";
import { getMemoiseGetColumnsWithLocalStorageFn } from "./reactTableUtils/getColumnsPureFn";
import type {
  tableData,
  transformDataWithEditableCell,
} from "./reactTableUtils/transformDataPureFn";
import { getMemoiseTransformDataWithEditableCell } from "./reactTableUtils/transformDataPureFn";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import type { AutocompletionDefinitions } from "widgets/constants";
import type {
  WidgetQueryConfig,
  WidgetQueryGenerationFormConfig,
} from "WidgetQueryGenerators/types";
import type { DynamicPath } from "utils/DynamicBindingUtils";

const ReactTableComponent = lazy(() =>
  retryPromise(() => import("../component")),
);

const emptyArr: any = [];

type addNewRowToTable = (
  tableData: tableData,
  isAddRowInProgress: boolean,
  newRowContent: Record<string, unknown>,
) => tableData;

const getMemoisedAddNewRow = (): addNewRowToTable =>
  memoizeOne((tableData, isAddRowInProgress, newRowContent) => {
    if (isAddRowInProgress) {
      return [newRowContent, ...tableData];
    }
    return tableData;
  });

class TableWidgetV2 extends BaseWidget<TableWidgetProps, WidgetState> {
  inlineEditTimer: number | null = null;
  memoisedAddNewRow: addNewRowToTable;
  memoiseGetColumnsWithLocalStorage: (localStorage: any) => getColumns;
  memoiseTransformDataWithEditableCell: transformDataWithEditableCell;

  static getQueryGenerationConfig(widget: WidgetProps) {
    return {
      select: {
        limit: `${widget.widgetName}.pageSize`,
        where: `${widget.widgetName}.searchText`,
        offset: `${widget.widgetName}.pageOffset`,
        orderBy: `${widget.widgetName}.sortOrder.column`,
        sortOrder: `${widget.widgetName}.sortOrder.order !== "desc"`,
      },
      create: {
        value: `(${widget.widgetName}.newRow || {})`,
      },
      update: {
        value: `${widget.widgetName}.updatedRow`,
        where: `${widget.widgetName}.updatedRow`,
      },
      totalRecord: true,
    };
  }

  static getPropertyUpdatesForQueryBinding(
    queryConfig: WidgetQueryConfig,
    widget: TableWidgetProps,
    formConfig: WidgetQueryGenerationFormConfig,
  ) {
    let modify = {};
    const dynamicPropertyPathList: DynamicPath[] = [];

    if (queryConfig.select) {
      modify = merge(modify, {
        tableData: queryConfig.select.data,
        onPageChange: queryConfig.select.run,
        serverSidePaginationEnabled: true,
        onSearchTextChanged: formConfig.searchableColumn
          ? queryConfig.select.run
          : undefined,
        onSort: queryConfig.select.run,
        enableClientSideSearch: !formConfig.searchableColumn,
        primaryColumnId: formConfig.primaryColumn,
        isVisibleDownload: false,
      });
    }

    if (queryConfig.create) {
      modify = merge(modify, {
        onAddNewRowSave: queryConfig.create.run,
        allowAddNewRow: true,
        ...Object.keys(widget.primaryColumns).reduce(
          (prev: Record<string, boolean>, curr) => {
            if (formConfig.primaryColumn !== curr) {
              prev[`primaryColumns.${curr}.isEditable`] = true;
              prev[`primaryColumns.${curr}.isCellEditable`] = true;
            }

            return prev;
          },
          {},
        ),
      });
    }

    if (queryConfig.total_record) {
      modify = merge(modify, {
        totalRecordsCount: queryConfig.total_record.data,
      });
    }

    return {
      modify,
      dynamicUpdates: {
        dynamicPropertyPathList,
      },
    };
  }

  static getPropertyPaneContentConfig() {
    return contentConfig;
  }

  static getPropertyPaneStyleConfig() {
    return styleConfig;
  }

  constructor(props: TableWidgetProps) {
    super(props);
    // generate new cache instances so that each table widget instance has its own respective cache instance
    this.memoisedAddNewRow = getMemoisedAddNewRow();
    this.memoiseGetColumnsWithLocalStorage =
      getMemoiseGetColumnsWithLocalStorageFn();
    this.memoiseTransformDataWithEditableCell =
      getMemoiseTransformDataWithEditableCell();
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      queryData: {},
      pageNo: 1,
      selectedRowKeys: undefined,
      updatedRowKeys: undefined,
      updatedRowKey: undefined,
      expandedKeys: undefined,
      searchText: undefined,
      triggeredRowKey: undefined,
      dragSortRowKey: undefined,
      dragSortRow: undefined,
      dragSortRowState: undefined,
      dragSortEndTableData: undefined,
      filters: [],
      sortOrder: {
        column: "",
        order: null,
      },
      transientTableData: {},
      editableCell: defaultEditableCell,
      columnEditableCellValue: {},
      selectColumnFilterText: {},
      isAddRowInProgress: false,
      newRowContent: undefined,
      newRow: undefined,
      previousPageVisited: false,
      nextPageVisited: false,
      columns: [],
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: TableWidgetProps, extraDefsToDefine?: ExtraDef) => {
      const config = {
        "!doc":
          "The Table is the hero widget of Appsmith. You can display data from an API in a table, trigger an action when a user selects a row and even work with large paginated data sets",
        "!url": "https://docs.appsmith.com/widget-reference/table",
        queryData: generateTypeDef(widget.queryData, extraDefsToDefine),
        selectedRows: generateTypeDef(widget.selectedRows, extraDefsToDefine),
        selectedRowKeys: generateTypeDef(widget.selectedRowKeys),
        triggeredRow: generateTypeDef(widget.triggeredRow),
        // currentRecord: generateTypeDef(widget.currentRecord),
        updatedRow: generateTypeDef(widget.updatedRow),
        tableData: generateTypeDef(widget.tableData, extraDefsToDefine),
        pageNo: "number",
        pageSize: "number",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        searchText: "string",
        totalRecordsCount: "number",
        sortOrder: {
          column: "string",
          order: ["asc", "desc"],
        },
        editableColumn: generateTypeDef(widget.editableColumn),
        updatedRows: generateTypeDef(widget.updatedRows, extraDefsToDefine),
        triggeredRowKey: generateTypeDef(widget.triggeredRowKey),
        dragSortRowKey: generateTypeDef(widget.dragSortRowKey),
        dragSortRow: generateTypeDef(widget.dragSortRow),
        dragSortEndTableData: generateTypeDef(widget.dragSortEndTableData),
        dragSortRowState: generateTypeDef(widget.dragSortRowState),
        pageOffset: generateTypeDef(widget.pageOffset),
        tableHeaders: generateTypeDef(widget.tableHeaders),
        newRow: generateTypeDef(widget.newRow),
        isAddRowInProgress: "bool",
        previousPageVisited: generateTypeDef(widget.previousPageVisited),
        nextPageVisited: generateTypeDef(widget.nextPageButtonClicked),
        columns: generateTypeDef(widget.tableColumns || widget.columns),
        expandedKeys: "array",
        updatedRowKeys: generateTypeDef(widget.updatedRowKeys),
        updatedRowKey: generateTypeDef(widget.updatedRowKey),
        expandedRows: generateTypeDef(widget.expandedRows),
      };

      return config;
    };
  }

  static getDerivedPropertiesMap() {
    return {
      queryData: `{{(()=>{${derivedProperties.getQueryData}})()}}`,
      triggeredRow: `{{(()=>{${derivedProperties.getTriggeredRow}})()}}`,
      pageSize: `{{(()=>{${derivedProperties.getPageSize}})()}}`,
      triggerRowSelection: "{{!!this.onRowSelected}}",
      processedTableData: `{{(()=>{${derivedProperties.getProcessedTableData}})()}}`,
      orderedTableColumns: `{{(()=>{${derivedProperties.getOrderedTableColumns}})()}}`,
      filteredTableData: `{{(()=>{ ${derivedProperties.getFilteredTableData}})()}}`,
      pageOffset: `{{(()=>{${derivedProperties.getPageOffset}})()}}`,
      tableHeaders: `{{(()=>{${derivedProperties.getTableHeaders}})()}}`,
      expandedRows: `{{(()=>{${derivedProperties.getExpandedRows}})()}}`,
      updatedRows: `{{(()=>{ ${derivedProperties.getUpdatedRows}})()}}`,
      editableColumn: `{{(()=>{ ${derivedProperties.getEditableColumn}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      searchText: "defaultSearchText",
      selectedRowKeys: "defaultSelectedRowKeys",
      updatedRowKeys: "defaultUpdatedKeys",
      expandedKeys: "defaultExpandedRowKeys",
    };
  }

  static getLoadingProperties(): Array<RegExp> | undefined {
    return [/\.tableData$/];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      headerBorderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "{{appsmith.theme.boxShadow.appBoxShadow}}",
      childStylesheet: {
        button: {
          buttonColor: "{{appsmith.theme.colors.primaryColor}}",
          borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
          boxShadow: "none",
        },
        menuButton: {
          borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
          boxShadow: "none",
        },
        iconButton: {
          buttonColor: "{{appsmith.theme.colors.primaryColor}}",
          borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
          boxShadow: "none",
        },
        editActions: {
          saveButtonColor: "{{appsmith.theme.colors.primaryColor}}",
          saveBorderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
          discardButtonColor: "{{appsmith.theme.colors.primaryColor}}",
          discardBorderRadius:
            "{{appsmith.theme.borderRadius.appBorderRadius}}",
        },
      },
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "string",
        },
        setSelectedRowKeys: {
          path: "selectedRowKeys",
          type: "array",
        },
        setData: {
          path: "tableData",
          type: "object",
        },
        setExpandedKeys: {
          path: "expandedKeys",
          type: "array",
        },
        setUpdatedRowKeys: {
          path: "updatedRowKeys",
          type: "array",
        },
      },
    };
  }

  /*
   * Function to get the table columns with appropriate render functions
   * based on columnType
   */
  getTableColumns = () => {
    const { columnWidthMap, orderedTableColumns, renderMode, widgetId } =
      this.props;
    const { componentWidth } = this.getPaddingAdjustedDimensions();
    const widgetLocalStorageState = getColumnOrderByWidgetIdFromLS(widgetId);
    const memoisdGetColumnsWithLocalStorage =
      this.memoiseGetColumnsWithLocalStorage(widgetLocalStorageState);
    const columns = memoisdGetColumnsWithLocalStorage(
      columnWidthMap,
      orderedTableColumns,
      componentWidth,
      renderMode,
    );

    // this.batchUpdateWidgetProperty({
    //   modify: {
    //     columns,
    //   },
    // }, false);
    return columns;
  };

  transformData = (
    tableData: Array<Record<string, unknown>>,
    columns: ReactTableColumnProps[],
  ) => {
    return this.memoiseTransformDataWithEditableCell(
      this.props.editableCell,
      tableData,
      columns,
    );
  };

  updateDerivedColumnsIndex = (
    derivedColumns: Record<string, ColumnProperties>,
    tableColumnCount: number,
  ) => {
    if (!derivedColumns) {
      return [];
    }

    //update index property of all columns in new derived columns
    return Object.values(derivedColumns).map(
      (column: ColumnProperties, index: number) => {
        return {
          ...column,
          index: index + tableColumnCount,
        };
      },
    );
  };

  /*
   * Function to create new primary Columns from the tableData
   * gets called on component mount and on component update
   */
  createTablePrimaryColumns = ():
    | Record<string, ColumnProperties>
    | undefined => {
    const { primaryColumns = {}, tableData = [] } = this.props;

    if (!_.isArray(tableData) || tableData.length === 0) {
      return;
    }

    const existingColumnIds = Object.keys(primaryColumns);
    const newTableColumns: Record<string, ColumnProperties> = {};
    const tableStyles = getTableStyles(this.props);
    const columnKeys: string[] = getAllTableColumnKeys(tableData);

    /*
     * Generate default column properties for all columns
     * But do not replace existing columns with the same id
     */
    columnKeys.forEach((columnKey, index) => {
      const existingColumn = this.getColumnByOriginalId(columnKey);

      if (!!existingColumn) {
        // Use the existing column properties
        newTableColumns[existingColumn.id] = existingColumn;
      } else {
        const hashedColumnKey = sanitizeKey(columnKey, {
          existingKeys: union(existingColumnIds, Object.keys(newTableColumns)),
        });
        // Create column properties for the new column
        const columnType = getColumnType(tableData, columnKey);
        const columnProperties = getDefaultColumnProperties(
          columnKey,
          hashedColumnKey,
          index,
          this.props.widgetName,
          false,
          columnType,
        );

        newTableColumns[columnProperties.id] = {
          ...columnProperties,
          ...tableStyles,
        };
      }
    });

    const derivedColumns: Record<string, ColumnProperties> =
      getDerivedColumns(primaryColumns);

    const updatedDerivedColumns = this.updateDerivedColumnsIndex(
      derivedColumns,
      Object.keys(newTableColumns).length,
    );

    //add derived columns to new Table columns
    updatedDerivedColumns.forEach((derivedColumn: ColumnProperties) => {
      newTableColumns[derivedColumn.id] = derivedColumn;
    });

    const newColumnIds = Object.keys(newTableColumns);

    // check if the columns ids differ
    if (_.xor(existingColumnIds, newColumnIds).length > 0) {
      return newTableColumns;
    } else {
      return;
    }
  };

  /*
   * Function to update primaryColumns when the tablData schema changes
   */
  updateColumnProperties = (
    tableColumns?: Record<string, ColumnProperties>,
    shouldPersistLocalOrderWhenTableDataChanges = false,
  ) => {
    const { columnOrder = [], primaryColumns = {} } = this.props;
    const derivedColumns = getDerivedColumns(primaryColumns);

    if (tableColumns) {
      const existingColumnIds = Object.keys(primaryColumns);
      const existingDerivedColumnIds = Object.keys(derivedColumns);

      const newColumnIds = Object.keys(tableColumns);

      //Check if there is any difference in the existing and new columns ids
      if (_.xor(existingColumnIds, newColumnIds).length > 0) {
        const newColumnIdsToAdd = _.without(newColumnIds, ...existingColumnIds);

        const propertiesToAdd: Record<string, unknown> = {};

        newColumnIdsToAdd.forEach((columnId: string) => {
          // id could be an empty string
          if (!!columnId) {
            Object.entries(tableColumns[columnId]).forEach(([key, value]) => {
              propertiesToAdd[`primaryColumns.${columnId}.${key}`] = value;
            });
          }
        });

        /*
         * If new columnOrders have different values from the original columnOrders
         * Only update when there are new Columns(Derived or Primary)
         */
        if (
          !!newColumnIds.length &&
          !!_.xor(newColumnIds, columnOrder).length &&
          !equal(_.sortBy(newColumnIds), _.sortBy(existingDerivedColumnIds))
        ) {
          // Maintain original columnOrder and keep new columns at the end
          let newColumnOrder = _.intersection(columnOrder, newColumnIds);
          newColumnOrder = _.union(newColumnOrder, newColumnIds);

          const compareColumns = (a: string, b: string) => {
            const aSticky = tableColumns[a].sticky || "none";
            const bSticky = tableColumns[b].sticky || "none";

            if (aSticky === bSticky) {
              return 0;
            }

            return SORT_ORDER[aSticky] - SORT_ORDER[bSticky];
          };

          // Sort the column order to retain the position of frozen columns
          newColumnOrder.sort(compareColumns);

          propertiesToAdd["columnOrder"] = newColumnOrder;

          /**
           * As the table data changes in Deployed app, we also update the local storage.
           *
           * this.updateColumnProperties gets executed on mount and on update of the component.
           * On mount we get new tableColumns that may not have any sticky columns.
           * This will lead to loss of sticky column that were frozen by the user.
           * To avoid this and to maintain user's sticky columns we use shouldPersistLocalOrderWhenTableDataChanges below
           * so as to avoid updating the local storage on mount.
           **/
          if (
            this.props.renderMode === RenderModes.PAGE &&
            shouldPersistLocalOrderWhenTableDataChanges
          ) {
            const leftOrder = newColumnOrder.filter(
              (col: string) => tableColumns[col].sticky === StickyType.LEFT,
            );
            const rightOrder = newColumnOrder.filter(
              (col: string) => tableColumns[col].sticky === StickyType.RIGHT,
            );
            this.persistColumnOrder(newColumnOrder, leftOrder, rightOrder);
          }
        }

        const propertiesToUpdate: BatchPropertyUpdatePayload = {
          modify: propertiesToAdd,
        };

        const pathsToDelete: string[] = [];
        const columnsIdsToDelete = without(existingColumnIds, ...newColumnIds);

        if (!!columnsIdsToDelete.length) {
          columnsIdsToDelete.forEach((id: string) => {
            if (!primaryColumns[id].isDerived) {
              pathsToDelete.push(`primaryColumns.${id}`);
            }
          });
          propertiesToUpdate.remove = pathsToDelete;
        }

        super.batchUpdateWidgetProperty(propertiesToUpdate, false);
      }
    }
  };

  //no need to batch meta updates
  hydrateStickyColumns = () => {
    const localTableColumnOrder = getColumnOrderByWidgetIdFromLS(
      this.props.widgetId,
    );
    const leftLen: number = Object.keys(
      pickBy(this.props.primaryColumns, (col) => col.sticky === "left"),
    ).length;

    const leftOrder = [...(this.props.columnOrder || [])].slice(0, leftLen);

    const rightLen: number = Object.keys(
      pickBy(this.props.primaryColumns, (col) => col.sticky !== "right"),
    ).length;

    const rightOrder: string[] = [...(this.props.columnOrder || [])].slice(
      rightLen,
    );

    if (localTableColumnOrder) {
      const {
        columnOrder,
        columnUpdatedAt,
        leftOrder: localLeftOrder,
        rightOrder: localRightOrder,
      } = localTableColumnOrder;

      if (this.props.columnUpdatedAt !== columnUpdatedAt) {
        // Delete and set the column orders defined by the developer
        deleteLocalTableColumnOrderByWidgetId(this.props.widgetId);

        this.persistColumnOrder(
          this.props.columnOrder ?? [],
          leftOrder,
          rightOrder,
        );
      } else {
        const propertiesToAdd: Record<string, string> = {};

        propertiesToAdd["columnOrder"] = columnOrder;

        /**
         * We reset the sticky values of the columns that were frozen by the developer.
         */
        if (Object.keys(this.props.primaryColumns).length > 0) {
          columnOrder.forEach((colName: string) => {
            if (
              this.props.primaryColumns[colName]?.sticky !== StickyType.NONE
            ) {
              propertiesToAdd[`primaryColumns.${colName}.sticky`] =
                StickyType.NONE;
            }
          });
        }

        /**
         * We pickup the left and the right frozen columns from the localstorage
         * and update the sticky value of these columns respectively.
         */

        if (localLeftOrder.length > 0) {
          localLeftOrder.forEach((colName: string) => {
            propertiesToAdd[`primaryColumns.${colName}.sticky`] =
              StickyType.LEFT;
          });
        }

        if (localRightOrder.length > 0) {
          localRightOrder.forEach((colName: string) => {
            propertiesToAdd[`primaryColumns.${colName}.sticky`] =
              StickyType.RIGHT;
          });
        }

        const propertiesToUpdate = {
          modify: propertiesToAdd,
        };
        super.batchUpdateWidgetProperty(propertiesToUpdate);
      }
    } else {
      // If user deletes local storage or no column orders for the given table widget exists hydrate it with the developer changes.
      this.persistColumnOrder(
        this.props.columnOrder ?? [],
        leftOrder,
        rightOrder,
      );
    }
  };

  componentDidMount() {
    const { canFreezeColumn, defaultPageSize, renderMode, tableData } =
      this.props;

    this.updatePageSize(defaultPageSize);

    if (_.isArray(tableData) && !!tableData.length) {
      const newPrimaryColumns = this.createTablePrimaryColumns();

      // When the Table data schema changes
      if (newPrimaryColumns && !!Object.keys(newPrimaryColumns).length) {
        this.updateColumnProperties(newPrimaryColumns);
      }
    }

    if (canFreezeColumn && renderMode === RenderModes.PAGE) {
      //dont neet to batch this since single action
      this.hydrateStickyColumns();
    }
  }

  componentDidUpdate(prevProps: TableWidgetProps) {
    const {
      defaultPageSize,
      defaultSelectedRowKeys,
      pageNo,
      pageSize,
      primaryColumns = {},
      serverSidePaginationEnabled,
      totalRecordsCount,
    } = this.props;
    // defaultPageSize
    if (defaultPageSize !== prevProps.defaultPageSize) {
      this.updatePageSize(defaultPageSize);
    }
    // defaultUpdatedKeys
    if (!equal(prevProps.defaultUpdatedKeys, this.props.defaultUpdatedKeys)) {
      this.updateWidgetProperty(
        "updatedRowKeys",
        this.props.defaultUpdatedKeys,
      );
    }
    // defaultExpandedRowKeys
    if (
      !equal(
        prevProps.defaultExpandedRowKeys,
        this.props.defaultExpandedRowKeys,
      )
    ) {
      this.updateWidgetProperty(
        "expandedKeys",
        this.props.defaultExpandedRowKeys,
      );
    }

    // Bail out if tableData is a string. This signifies an error in evaluations
    if (isString(this.props.tableData)) {
      return;
    }

    if (
      this.props.primaryColumns &&
      (!equal(prevProps.columnOrder, this.props.columnOrder) ||
        filter(prevProps.orderedTableColumns, { isVisible: false }).length !==
          filter(this.props.orderedTableColumns, { isVisible: false }).length ||
        getAllStickyColumnsCount(prevProps.orderedTableColumns) !==
          getAllStickyColumnsCount(this.props.orderedTableColumns))
    ) {
      if (this.props.renderMode === RenderModes.CANVAS) {
        super.batchUpdateWidgetProperty(
          {
            modify: {
              columnUpdatedAt: Date.now(),
            },
          },
          false,
        );
      }
    }

    //check if necessary we are batching now updates
    // Check if tableData is modifed
    const isTableDataModified = !equal(
      this.props.tableData,
      prevProps.tableData,
    );

    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;
    // If the user has changed the tableData OR
    // The binding has returned a new value
    if (isTableDataModified) {
      pushBatchMetaUpdates("triggeredRowKey", undefined);

      const newColumnIds: string[] = getAllTableColumnKeys(
        this.props.tableData,
      );
      const primaryColumnIds = Object.keys(primaryColumns).filter(
        (id: string) => !primaryColumns[id].isDerived,
      );

      if (xor(newColumnIds, primaryColumnIds).length > 0) {
        const newTableColumns = this.createTablePrimaryColumns();

        if (newTableColumns) {
          this.updateColumnProperties(newTableColumns, isTableDataModified);
        }

        pushBatchMetaUpdates("filters", [DEFAULT_FILTER]);
      }
    }

    /*
     * Clear transient table data and editablecell when tableData changes
     */
    if (isTableDataModified) {
      pushBatchMetaUpdates("transientTableData", {});

      pushBatchMetaUpdates("selectColumnFilterText", {});
    }

    if (!pageNo) {
      pushBatchMetaUpdates("pageNo", 1);
      this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
    }

    //check if pageNo does not excede the max Page no, due to change of totalRecordsCount
    if (serverSidePaginationEnabled !== prevProps.serverSidePaginationEnabled) {
      //reset pageNo when serverSidePaginationEnabled is toggled
      pushBatchMetaUpdates("pageNo", 1);
      this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
    } else {
      //check if pageNo does not excede the max Page no, due to change of totalRecordsCount or change of pageSize
      if (serverSidePaginationEnabled && totalRecordsCount) {
        const maxAllowedPageNumber = Math.ceil(totalRecordsCount / pageSize);

        if (pageNo > maxAllowedPageNumber) {
          pushBatchMetaUpdates("pageNo", maxAllowedPageNumber);
          this.updatePaginationDirectionFlags(PaginationDirection.NEXT_PAGE);
        }
      }
    }
    // defaultSelectedRowKeys
    if (!equal(defaultSelectedRowKeys, prevProps.defaultSelectedRowKeys)) {
      pushBatchMetaUpdates("selectedRowKeys", defaultSelectedRowKeys);
    }

    this.pushResetPageNoUpdates(prevProps);

    commitBatchMetaUpdates();
  }

  pushResetPageNoUpdates = (prevProps: TableWidgetProps) => {
    const { onPageSizeChange, pageSize, pushBatchMetaUpdates } = this.props;

    if (pageSize !== prevProps.pageSize) {
      if (onPageSizeChange) {
        this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
        pushBatchMetaUpdates("pageNo", 1, {
          triggerPropertyName: "onPageSizeChange",
          dynamicString: onPageSizeChange,
          event: {
            type: EventType.ON_PAGE_SIZE_CHANGE,
          },
        });
      } else {
        pushBatchMetaUpdates("pageNo", 1);
        this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
      }
    }
  };

  updateFilters = (filters: ReactTableFilter[]) => {
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    pushBatchMetaUpdates("filters", filters);

    // Reset Page only when a filter is added
    if (!isEmpty(xorWith(filters, [DEFAULT_FILTER], equal))) {
      pushBatchMetaUpdates("pageNo", 1);
      this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
    }
    commitBatchMetaUpdates();
  };

  toggleDrag = (disable: boolean) => {
    this.disableDrag(disable);
  };

  getPaddingAdjustedDimensions = () => {
    // eslint-disable-next-line prefer-const
    let { componentHeight, componentWidth } = this.getComponentDimensions();
    // (2 * WIDGET_PADDING) gives the total horizontal padding (i.e. paddingLeft + paddingRight)
    componentWidth = componentWidth - 2 * WIDGET_PADDING;
    return { componentHeight, componentWidth };
  };

  // updateCurrentRecord = (currentRecord: Record<string, unknown>) => {
  //   console.log("Antd 表格 updateCurrentRecord", currentRecord);

  //   this.updateWidgetProperty("currentRecord", currentRecord);
  // };

  handleExpandedRowsChange = (expandedKeys: readonly Key[]) => {
    const { commitBatchMetaUpdates } = this.props;
    console.log("Antd 表格 handleExpandedRowsChange", expandedKeys);
    this.props.updateWidgetMetaProperty("expandedKeys", expandedKeys);

    // commitBatchMetaUpdates();
  };
  updataTriggeredRowKey = (triggeredRowKey: string) => {
    this.props.updateWidgetMetaProperty("triggeredRowKey", triggeredRowKey);
  };

  onExpand = (expanded: boolean, record: any) => {
    console.log("Antd 表格 onExpand", expanded, record);
    // super.executeAction(config);

    this.onColumnEvent({
      action: this.props.onExpand,
      triggerPropertyName: "triggeredRowKey",
      eventType: EventType.ON_CLICK,
      row: {
        ...record,
      },
      additionalData: {
        expanded,
      },
    });
  };

  getFinalTableData = () => {
    const { filteredTableData = [] } = this.props;
    const tableColumns = this.getTableColumns() || emptyArr;
    const transformedData = this.transformData(filteredTableData, tableColumns);

    const finalTableData = this.memoisedAddNewRow(
      transformedData,
      this.props.isAddRowInProgress,
      this.props.newRowContent,
    );
    return finalTableData;
  };

  handleRowSelectionChange = (
    selectedRowKeys: React.Key[],
    selectedRows: any[],
  ) => {
    console.log(
      "Antd 表格 handleRowSelectionChange",
      selectedRowKeys,
      selectedRows,
    );
    this.props.updateWidgetMetaProperty("selectedRowKeys", selectedRowKeys);
    // 触发对应事件
    this.props.updateWidgetMetaProperty("selectedRows", selectedRows, {
      triggerPropertyName: "onSelectionChange",
      dynamicString: this.props.onSelectionChange,
      event: {
        type: EventType.ON_SELECTION_CHANGE,
      },
    });
  };
  handleRowSelect = (record: any, selected: boolean, selectedRows: any[]) => {
    console.log(
      "Antd 表格 handleRowSelect",
      record,
      selected,
      selectedRows,
      this.props.onSelect,
    );

    this.onColumnEvent({
      action: this.props.onSelect,
      triggerPropertyName: "onSelect",
      eventType: EventType.ON_ROW_SELECTED,
      row: {
        ...record,
      },
      additionalData: {
        selected,
      },
    });
  };
  handleDragSortEnd = (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: Record<string, unknown>[],
  ) => {
    const dragSortRow = newDataSource[afterIndex];
    const dragSortRowKey = dragSortRow[this.props.primaryColumnId];
    console.log("Antd 表格 handleDragSortEnd", {
      newDataSource,
      beforeIndex,
      afterIndex,
      dragSortRow,
      dragSortRowKey,
    });
    this.props.updateWidgetMetaProperty("dragSortRowKey", dragSortRowKey);
    this.props.updateWidgetMetaProperty("dragSortRow", dragSortRow);
    this.props.updateWidgetMetaProperty("dragSortRowState", {
      row: dragSortRow,
      beforeIndex,
      afterIndex,
    });
    this.props.updateWidgetMetaProperty("dragSortEndTableData", newDataSource);
  };
  handleRowClick = (row: Record<string, unknown>) => {
    this.props.updateWidgetMetaProperty(
      "triggeredRowKey",
      row[this.props.primaryColumnId],
    );

    if (this.props.onRowClick) {
      this.onColumnEvent({
        row,
        action: this.props.onRowClick,
        triggerPropertyName: "onRowClick",
        eventType: EventType.ON_ROW_SELECTED,
      });
    }
  };
  handleQueryDataChange = (params: any, isInit?: boolean) => {
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    if (isInit) {
      pushBatchMetaUpdates("queryData", params);
    } else {
      pushBatchMetaUpdates("queryData", params, {
        triggerPropertyName: "onPageChange",
        dynamicString: this.props.onPageChange,
        event: {
          type: EventType.ON_QUERY_CHANGE,
        },
      });

      commitBatchMetaUpdates();
    }
  };

  handleNextPageClick = () => {
    const pageNo = (this.props.pageNo || 1) + 1;
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    this.updatePaginationDirectionFlags(PaginationDirection.NEXT_PAGE);

    pushBatchMetaUpdates("pageNo", pageNo, {
      triggerPropertyName: "onPageChange",
      dynamicString: this.props.onPageChange,
      event: {
        type: EventType.ON_NEXT_PAGE,
      },
    });
    commitBatchMetaUpdates();
  };

  handlePrevPageClick = () => {
    const pageNo = (this.props.pageNo || 1) - 1;
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    if (pageNo >= 1) {
      this.updatePaginationDirectionFlags(PaginationDirection.PREVIOUS_PAGE);
      pushBatchMetaUpdates("pageNo", pageNo, {
        triggerPropertyName: "onPageChange",
        dynamicString: this.props.onPageChange,
        event: {
          type: EventType.ON_PREV_PAGE,
        },
      });
    }
    commitBatchMetaUpdates();
  };
  handleEditableRowChange = (data: {
    editableKeys: React.Key[];
    editableRecords: Record<string, unknown>[];
  }) => {
    console.log("表格 handleEditableRowChange: ", data);
    this.props.updateWidgetMetaProperty("updatedRowKeys", data.editableKeys);
    this.props.updateWidgetMetaProperty("updatedRows", data.editableRecords);
    // updatedRowKey
    this.props.updateWidgetMetaProperty(
      "updatedRowKey",
      last(data.editableRecords)?.[this.props.primaryColumnId],
    );
    this.props.updateWidgetMetaProperty(
      "updatedRow",
      last(data.editableRecords),
    );
  };

  handleUrlOrImgClick = (column: any, row?: Record<string, unknown>) => {
    // this.updataTriggeredRowKey(row[this.props.primaryColumnId] as string);
    this.onColumnEvent({
      action: column.columnProperties.onUrlOrImgClick,
      triggerPropertyName: "onUrlOrImgClick",
      eventType: EventType.ON_CLICK,
      row: {
        ...(row || {}),
      },
    });
  };
  handleAlertBtnClick = (onClick: string) => {
    console.log("Antd 表格 handleAlertBtnClick", onClick);
    super.executeAction({
      dynamicString: onClick,
      event: {
        type: EventType.ON_CLICK,
      },
    });
  };
  handleRowBtnClick = (onClick: string, record: Record<string, any>) => {
    console.log(
      "Antd 表格 handleRowBtnClick",
      onClick,
      record,
      this.props,
      record.__originalIndex__,
    );

    this.updataTriggeredRowKey(record[this.props.primaryColumnId]);

    this.onColumnEvent({
      action: onClick,
      triggerPropertyName: "triggeredRowKey",
      eventType: EventType.ON_CLICK,
      row: {
        ...record,
      },
    });
  };
  handleSwitchValueChange = (
    column: any,
    row: Record<string, unknown>,
    value: boolean,
    alias: string,
    originalIndex: number,
    rowIndex: number,
  ) => {
    console.log("表格onCheckChange", {
      column,
      row,
      value,
      alias,
      originalIndex,
      rowIndex,
    });

    // 添加这一行
    this.updataTriggeredRowKey(row[this.props.primaryColumnId] as string);

    this.onColumnEvent({
      action: column.columnProperties.onSwitchClick,
      triggerPropertyName: "onSwitchClick",
      eventType: EventType.ON_CHECK_CHANGE,
      row: {
        ...row,
        [alias]: value,
      },
      additionalData: {
        checked: value,
      },
    });
  };

  // 统一处理 protable 编辑状态 onChange
  handleCellValueChange = (value: any, alias: string, column: any) => {
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    const columnType = column.columnProperties.columnType;
    let eventName = "onCellTextChange";
    let eventType = EventType.ON_TEXT_CHANGE;
    console.log("Antd 表格 handleCellValueChange", {
      value,
      alias,
      column,
      props: this.props,
      columnType,
    });
    switch (columnType) {
      case ColumnTypes.SELECT:
        eventName = "onSelectChange";
        eventType = EventType.ON_SELECT;
        break;
      case ColumnTypes.CHECKBOX:
      case ColumnTypes.SWITCH:
        eventName = "onCheckChange";
        eventType = EventType.ON_CHECK_CHANGE;
        break;
      case ColumnTypes.RADIO:
        eventName = "onRadioChange";
        eventType = EventType.ON_SELECT;
        break;
      case ColumnTypes.DATE:
      case ColumnTypes.DATE_RANGE:
        eventName = "onDateSelected";
        eventType = EventType.ON_DATE_SELECTED;
        break;
    }
    this.onColumnEvent({
      action: column.columnProperties[eventName],
      triggerPropertyName: eventName,
      eventType: eventType,
      row: {
        // ...row,
        [alias]: value,
      },
    });
  };

  handleEditableValuesChange = (data: {
    record: Record<string, unknown>;
    dataSource: Record<string, unknown>[];
    rowIndex?: number;
  }) => {
    const { record, rowIndex } = data;
    const { commitBatchMetaUpdates } = this.props;

    function findSimpleChanges(
      objA: Record<string, unknown>,
      objB: Record<string, unknown>,
    ) {
      return _.pickBy(objB, (value, key) => {
        if (typeof value !== "object" && typeof objA[key] !== "object") {
          return !_.isEqual(value, objA?.[key]);
        }
        return false;
      });
    }

    const originalRecord =
      this.getRecordForKey(record[this.props.primaryColumnId] as string) || {};
    // lodash 取出修改的内容
    const diffRecord = findSimpleChanges(originalRecord, record);
    console.log("diffRecord", {
      originalRecord,
      diffRecord,
      record,
      primaryColumnId: this.props.primaryColumnId,
    });
    // return;
    // this.pushTransientTableDataActionsUpdates({
    //   [ORIGINAL_INDEX_KEY]: record.__originalIndex__ as number,
    //   [ORIGINAL_INDEX_PATH_KEY]: record.__originalIndexPath__ as string,
    //   ...diffRecord,
    // });

    // 添加这一行
    this.updataTriggeredRowKey(record[this.props.primaryColumnId] as string);
    this.props.updateWidgetMetaProperty("updatedRow", record);
    this.props.updateWidgetMetaProperty(
      "updatedRowKey",
      record[this.props.primaryColumnId],
    );
    this.onColumnEvent({
      action: this.props.onRowValueChange,
      triggerPropertyName: "onRowValueChange",
      eventType: EventType.ON_ROW_VALUE_CHANGE,
      row: {
        ...record,
      },
    });
  };
  getPageView() {
    const {
      delimiter,
      filteredTableData = [],
      isVisibleDownload,
      isVisiblePagination,
      isVisibleSearch,
      pageSize,
      primaryColumns,
      totalRecordsCount,
    } = this.props;

    const { componentHeight, componentWidth } =
      this.getPaddingAdjustedDimensions();
    const tableColumns = this.getTableColumns() || emptyArr;
    const finalTableData = this.getFinalTableData();

    console.group("Antd 表格 Table Widget 111");
    console.log(" this.props", this.props);
    console.log("tableColumns", tableColumns);

    console.groupEnd();

    return (
      <Suspense fallback={<Skeleton />}>
        <ReactTableComponent
          {...this.props}
          accentColor={this.props.accentColor}
          allowAddNewRow={this.props.allowAddNewRow}
          allowSorting={!this.props.isAddRowInProgress}
          applyFilter={this.updateFilters}
          borderColor={this.props.borderColor}
          borderRadius={this.props.borderRadius}
          borderWidth={this.props.borderWidth}
          boxShadow={this.props.boxShadow}
          canFreezeColumn={this.props.canFreezeColumn}
          columnActions={this.props.columnActions}
          columnWidthMap={this.props.columnWidthMap}
          columns={tableColumns}
          compactMode={this.props.compactMode || CompactModeTypes.DEFAULT}
          defaultPageSize={this.props.defaultPageSize}
          delimiter={delimiter}
          disableDrag={this.toggleDrag}
          editMode={this.props.renderMode === RenderModes.CANVAS}
          editableCell={this.props.editableCell}
          filters={this.props.filters}
          handleAddNewRow={this.handleAddNewRow}
          handleAddNewRowAction={this.handleAddNewRowAction}
          handleAlertBtnClick={this.handleAlertBtnClick}
          handleCellValueChange={this.handleCellValueChange}
          handleColumnFreeze={this.handleColumnFreeze}
          handleDragSortEnd={this.handleDragSortEnd}
          handleEditableRowChange={this.handleEditableRowChange}
          handleEditableValuesChange={this.handleEditableValuesChange}
          handleExpandedRowsChange={this.handleExpandedRowsChange}
          handleReorderColumn={this.handleReorderColumn}
          handleRowBtnClick={this.handleRowBtnClick}
          handleRowClick={this.handleRowClick}
          handleRowSelect={this.handleRowSelect}
          handleRowSelectionChange={this.handleRowSelectionChange}
          handleSwitchValueChange={this.handleSwitchValueChange}
          handleUrlOrImgClick={this.handleUrlOrImgClick}
          height={componentHeight}
          isAddRowInProgress={this.props.isAddRowInProgress}
          isLoading={this.props.isLoading}
          isVisibleCellSetting={this.props.isVisibleCellSetting}
          isVisibleDensity={this.props.isVisibleDensity}
          isVisibleDownload={isVisibleDownload}
          isVisibleFullScreen={this.props.isVisibleFullScreen}
          isVisiblePagination={isVisiblePagination}
          isVisibleRefresh={this.props.isVisibleRefresh}
          isVisibleSearch={isVisibleSearch}
          multiRowSelection={
            this.props.multiRowSelection && !this.props.isAddRowInProgress
          }
          nextPageClick={this.handleNextPageClick}
          onBulkEditDiscard={this.onBulkEditDiscard}
          onBulkEditSave={this.onBulkEditSave}
          onConnectData={this.onConnectData}
          onExpand={this.onExpand}
          onQueryDataChange={this.handleQueryDataChange}
          pageNo={this.props.pageNo}
          pageSize={this.props.pageSize}
          prevPageClick={this.handlePrevPageClick}
          primaryColumnId={this.props.primaryColumnId}
          queryData={this.props.queryData}
          searchKey={this.props.searchText}
          searchTableData={this.handleSearchTable}
          serverSidePaginationEnabled={!!this.props.serverSidePaginationEnabled}
          showConnectDataOverlay={
            primaryColumns &&
            !Object.keys(primaryColumns).length &&
            this.props.renderMode === RenderModes.CANVAS
          }
          sortTableColumn={this.handleColumnSorting}
          tableData={finalTableData}
          totalRecordsCount={totalRecordsCount}
          triggerRowSelection={this.props.triggerRowSelection}
          updatePageNo={this.updatePageNumber}
          updatePageSize={this.updatePageSize}
          variant={this.props.variant}
          widgetId={this.props.widgetId}
          widgetName={this.props.widgetName}
          width={componentWidth}
        />
      </Suspense>
    );
  }

  /**
   * Function to update or add the tableWidgetColumnOrder key in the local storage
   * tableWidgetColumnOrder = {
   *  <widget-id>: {
   *    columnOrder: [],
   *    leftOrder: [],
   *    rightOrder: [],
   *  }
   * }
   */
  persistColumnOrder = (
    newColumnOrder: string[],
    leftOrder: string[],
    rightOrder: string[],
  ) => {
    const widgetId = this.props.widgetId;
    const localTableWidgetColumnOrder = localStorage.getItem(
      TABLE_COLUMN_ORDER_KEY,
    );
    let newTableColumnOrder;

    if (localTableWidgetColumnOrder) {
      try {
        let parsedTableWidgetColumnOrder = JSON.parse(
          localTableWidgetColumnOrder,
        );

        let columnOrder;

        if (newColumnOrder) {
          columnOrder = newColumnOrder;
        } else if (parsedTableWidgetColumnOrder[widgetId]) {
          columnOrder = parsedTableWidgetColumnOrder[widgetId];
        } else {
          columnOrder = this.props.columnOrder;
        }

        parsedTableWidgetColumnOrder = {
          ...parsedTableWidgetColumnOrder,
          [widgetId]: {
            columnOrder,
            columnUpdatedAt: this.props.columnUpdatedAt,
            leftOrder,
            rightOrder,
          },
        };

        newTableColumnOrder = parsedTableWidgetColumnOrder;
      } catch (e) {
        log.debug("Unable to parse local column order:", { e });
      }
    } else {
      const tableWidgetColumnOrder = {
        [widgetId]: {
          columnOrder: newColumnOrder,
          columnUpdatedAt: this.props.columnUpdatedAt,
          leftOrder,
          rightOrder,
        },
      };
      newTableColumnOrder = tableWidgetColumnOrder;
    }
    localStorage.setItem(
      TABLE_COLUMN_ORDER_KEY,
      JSON.stringify(newTableColumnOrder),
    );
  };

  handleColumnFreeze = (columnName: string, sticky?: StickyType) => {
    if (this.props.columnOrder) {
      let newColumnOrder;
      const localTableColumnOrder = getColumnOrderByWidgetIdFromLS(
        this.props.widgetId,
      );
      if (this.props.renderMode === RenderModes.CANVAS) {
        newColumnOrder = generateNewColumnOrderFromStickyValue(
          this.props.primaryColumns,
          this.props.columnOrder,
          columnName,
          sticky,
        );

        // Updating these properties in batch so that undo/redo gets executed in a combined way.
        super.batchUpdateWidgetProperty(
          {
            modify: {
              [`primaryColumns.${columnName}.sticky`]: sticky,
              columnOrder: newColumnOrder,
            },
          },
          true,
        );
      } else if (
        localTableColumnOrder &&
        this.props.renderMode === RenderModes.PAGE
      ) {
        const { leftOrder, rightOrder } = localTableColumnOrder;
        newColumnOrder = generateLocalNewColumnOrderFromStickyValue(
          localTableColumnOrder.columnOrder,
          columnName,
          sticky,
          leftOrder,
          rightOrder,
        );
        const updatedOrders = updateAndSyncTableLocalColumnOrders(
          columnName,
          leftOrder,
          rightOrder,
          sticky,
        );
        this.persistColumnOrder(
          newColumnOrder,
          updatedOrders.leftOrder,
          updatedOrders.rightOrder,
        );

        super.batchUpdateWidgetProperty(
          {
            modify: {
              [`primaryColumns.${columnName}.sticky`]: sticky,
              columnOrder: newColumnOrder,
            },
          },
          true,
        );
      }
    }
  };

  handleReorderColumn = (columnOrder: string[]) => {
    columnOrder = columnOrder.map((alias) => this.getColumnIdByAlias(alias));

    if (
      this.props.canFreezeColumn &&
      this.props.renderMode === RenderModes.PAGE
    ) {
      const localTableColumnOrder = getColumnOrderByWidgetIdFromLS(
        this.props.widgetId,
      );
      if (localTableColumnOrder) {
        const { leftOrder, rightOrder } = localTableColumnOrder;
        this.persistColumnOrder(columnOrder, leftOrder, rightOrder);
      } else {
        this.persistColumnOrder(columnOrder, [], []);
      }
    }

    super.updateWidgetProperty("columnOrder", columnOrder);
  };

  handleColumnSorting = (columnAccessor: string, isAsc: boolean) => {
    const columnId = this.getColumnIdByAlias(columnAccessor);
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    let sortOrderProps;

    if (columnId) {
      sortOrderProps = {
        column: columnId,
        order: isAsc ? SortOrderTypes.asc : SortOrderTypes.desc,
      };
    } else {
      sortOrderProps = {
        column: "",
        order: null,
      };
    }

    pushBatchMetaUpdates("sortOrder", sortOrderProps, {
      triggerPropertyName: "onSort",
      dynamicString: this.props.onSort,
      event: {
        type: EventType.ON_SORT,
      },
    });
    commitBatchMetaUpdates();
  };

  handleSearchTable = (searchKey: any) => {
    const {
      commitBatchMetaUpdates,
      multiRowSelection,
      onSearchTextChanged,
      pushBatchMetaUpdates,
    } = this.props;
    pushBatchMetaUpdates("selectedRowKeys", []);

    pushBatchMetaUpdates("pageNo", 1);
    this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);

    pushBatchMetaUpdates("searchText", searchKey, {
      triggerPropertyName: "onSearchTextChanged",
      dynamicString: onSearchTextChanged,
      event: {
        type: EventType.ON_SEARCH,
      },
    });

    commitBatchMetaUpdates();
  };

  /**
   * This function just pushes the meta update
   */
  pushOnColumnEvent = ({
    action,
    additionalData = {},
    callbackData,
    eventType,
    onComplete = noop,
    // rowIndex,
    row,
    triggerPropertyName,
  }: OnColumnEventArgs) => {
    const { filteredTableData = [], pushBatchMetaUpdates } = this.props;

    const currentRow = row;
    const rowKey = currentRow?.[this.props.primaryColumnId];

    pushBatchMetaUpdates("triggeredRowKey", rowKey, {
      triggerPropertyName: triggerPropertyName,
      dynamicString: action,
      event: {
        type: eventType,
        callback: onComplete,
      },
      callbackData,
      globalContext: { currentRow, ...additionalData },
    });
  };

  // 更新 triggeredRowKey
  updateTriggeredRowKey = (rowKey: string) => {
    console.log("updateTriggeredRowKey", rowKey);
    this.props.updateWidgetMetaProperty("triggeredRowKey", rowKey);
  };

  onColumnEvent = ({
    action,
    additionalData = {},
    callbackData,
    eventType,
    onComplete = noop,
    row,
    triggerPropertyName,
  }: OnColumnEventArgs) => {
    if (action) {
      const { commitBatchMetaUpdates } = this.props;

      this.pushOnColumnEvent({
        action,
        onComplete,
        triggerPropertyName,
        eventType,
        row,
        additionalData,
        callbackData,
      });
      commitBatchMetaUpdates();
    } else {
      row &&
        this.updateTriggeredRowKey(row[this.props.primaryColumnId] as string);
      onComplete();
    }
  };

  updatePageSize = (_pageSize: number) => {
    const { commitBatchMetaUpdates, pageSize, pushBatchMetaUpdates } =
      this.props;

    console.log("Antd 表格 updatePageSize", _pageSize, pageSize);

    if (pageSize === _pageSize) {
      return;
    }
    pushBatchMetaUpdates("pageSize", _pageSize, {
      triggerPropertyName: "onPageSizeChange",
      dynamicString: this.props.onPageSizeChange,
      event: {
        type: EventType.ON_PAGE_SIZE_CHANGE,
      },
    });
    commitBatchMetaUpdates();
  };

  updatePageNumber = (pageNo: number, event?: EventType) => {
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    const paginationDirection =
      event == EventType.ON_NEXT_PAGE
        ? PaginationDirection.NEXT_PAGE
        : PaginationDirection.PREVIOUS_PAGE;
    this.updatePaginationDirectionFlags(paginationDirection);
    console.log(" updatePageNumber", pageNo, event);

    if (event) {
      pushBatchMetaUpdates("pageNo", pageNo, {
        triggerPropertyName: "onPageChange",
        dynamicString: this.props.onPageChange,
        event: {
          type: event,
        },
      });
    } else {
      pushBatchMetaUpdates("pageNo", pageNo);
    }

    commitBatchMetaUpdates();
  };

  updatePaginationDirectionFlags = (direction?: PaginationDirection) => {
    const { pushBatchMetaUpdates } = this.props;

    let previousButtonFlag = false;
    let nextButtonFlag = false;

    if (direction) {
      switch (direction) {
        case PaginationDirection.INITIAL: {
          previousButtonFlag = false;
          nextButtonFlag = false;
          break;
        }
        case PaginationDirection.NEXT_PAGE: {
          nextButtonFlag = true;
          break;
        }
        case PaginationDirection.PREVIOUS_PAGE: {
          previousButtonFlag = true;
          break;
        }
      }
    }

    pushBatchMetaUpdates("previousPageVisited", previousButtonFlag);
    pushBatchMetaUpdates("nextPageVisited", nextButtonFlag);
  };

  static getWidgetType(): WidgetType {
    return "ANTD_PRO_TABLE_WIDGET";
  }

  getColumnIdByAlias(alias: string) {
    const { primaryColumns } = this.props;

    if (primaryColumns) {
      const column = Object.values(primaryColumns).find(
        (column) => column.alias === alias,
      );

      if (column) {
        return column.id;
      }
    }

    return alias;
  }

  getColumnByOriginalId(originalId: string) {
    return Object.values(this.props.primaryColumns).find((column) => {
      return column.originalId === originalId;
    });
  }

  pushTransientTableDataActionsUpdates = (data: TransientDataPayload) => {
    const { __originalIndex__, __originalIndexPath__, ...transientData } = data;
    const { pushBatchMetaUpdates } = this.props;

    pushBatchMetaUpdates("transientTableData", {
      ...this.props.transientTableData,
      [__originalIndex__]: {
        ...this.props.transientTableData[__originalIndex__],
        ...transientData,
      },
    });
  };

  removeRowFromTransientTableData = (index: number) => {
    const newTransientTableData = clone(this.props.transientTableData);
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    if (newTransientTableData) {
      delete newTransientTableData[index];

      pushBatchMetaUpdates("transientTableData", newTransientTableData);
    }
    commitBatchMetaUpdates();
  };

  getRowOriginalIndex = (index: number) => {
    const { filteredTableData } = this.props;

    if (filteredTableData) {
      const row = filteredTableData[index];

      if (row) {
        return row[ORIGINAL_INDEX_KEY];
      }
    }

    return -1;
  };

  onBulkEditSave = () => {
    this.props.updateWidgetMetaProperty(
      "transientTableData",
      this.props.transientTableData,
      {
        triggerPropertyName: "onBulkSave",
        dynamicString: this.props.onBulkSave,
        event: {
          type: EventType.ON_BULK_SAVE,
        },
      },
    );
  };

  onBulkEditDiscard = () => {
    this.props.updateWidgetMetaProperty(
      "transientTableData",
      {},
      {
        triggerPropertyName: "onBulkDiscard",
        dynamicString: this.props.onBulkDiscard,
        event: {
          type: EventType.ON_BULK_DISCARD,
        },
      },
    );
  };

  // 需要处理树形数据情况
  getRecordForKey = (
    key: React.Key,
    _rows?: Record<string, any>[],
  ): Record<string, any> | null => {
    const { filteredTableData } = this.props;
    const rows = (_rows ||
      filteredTableData ||
      this.props.processedTableData ||
      []) as Record<string, any>[];
    for (const item of rows) {
      if (item[this.props.primaryColumnId] === key) {
        return item;
      }
      if (
        item[this.props.childrenColumnName] &&
        Array.isArray(item[this.props.childrenColumnName])
      ) {
        return this.getRecordForKey(key, item[this.props.childrenColumnName]);
      }
    }
    return null;
  };

  handleAddNewRow = (id?: string | number) => {
    const defaultNewRow = this.props.defaultNewRow || {};
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    pushBatchMetaUpdates("isAddRowInProgress", true);
    pushBatchMetaUpdates("newRowContent", defaultNewRow);
    pushBatchMetaUpdates("newRow", defaultNewRow);

    // New row gets added at the top of page 1 when client side pagination enabled
    if (!this.props.serverSidePaginationEnabled) {
      this.updatePaginationDirectionFlags(PaginationDirection.INITIAL);
    }

    //Since we're adding a newRowContent thats not part of tableData, the index changes
    // so we're resetting the row selection
    pushBatchMetaUpdates("selectedRowKeys", []);
    commitBatchMetaUpdates();
  };

  handleAddNewRowAction = (
    type: AddNewRowActions,
    row: Record<string, unknown>,
    onActionComplete: () => void,
  ) => {
    console.log("Antd 表格 handleAddNewRowAction", type, row);

    let triggerPropertyName, action, eventType;

    const onComplete = () => {
      const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

      pushBatchMetaUpdates("isAddRowInProgress", false);
      pushBatchMetaUpdates("newRowContent", undefined);
      pushBatchMetaUpdates("newRow", undefined);
      commitBatchMetaUpdates();

      onActionComplete();
    };

    if (type === AddNewRowActions.SAVE) {
      triggerPropertyName = "onAddNewRowSave";
      action = this.props.onAddNewRowSave;
      eventType = EventType.ON_ADD_NEW_ROW_SAVE;
    } else {
      triggerPropertyName = "onAddNewRowDiscard";
      action = this.props.onAddNewRowDiscard;
      eventType = EventType.ON_ADD_NEW_ROW_DISCARD;
    }

    this.onColumnEvent({
      action: action,
      triggerPropertyName: triggerPropertyName,
      eventType: EventType.ON_CHECK_CHANGE,
      onComplete: onComplete,
      row: {
        ...row,
      },
    });
  };

  updateNewRowValues = (
    alias: string,
    value: unknown,
    parsedValue: unknown,
  ) => {
    const { commitBatchMetaUpdates, pushBatchMetaUpdates } = this.props;

    /*
     * newRowContent holds whatever the user types while newRow holds the parsed value
     * newRowContent is being used to populate the cell while newRow is being used
     * for validations.
     */
    pushBatchMetaUpdates("newRowContent", {
      ...this.props.newRowContent,
      [alias]: value,
    });
    pushBatchMetaUpdates("newRow", {
      ...this.props.newRow,
      [alias]: parsedValue,
    });
    commitBatchMetaUpdates();
  };

  onConnectData = () => {
    if (this.props.renderMode === RenderModes.CANVAS) {
      super.updateOneClickBindingOptionsVisibility(true);
    }
  };
}

export default TableWidgetV2;
