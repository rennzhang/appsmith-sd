import type { ComponentType, Key } from "react";
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
  debounce,
  cloneDeep,
  set,
  difference,
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
  Action,
  AntdTableProps,
  EditableCell,
  JSONFormState,
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
import type { Schema } from "widgets/Antd/JSONFormWidget/constants";
import { ActionUpdateDependency } from "widgets/Antd/JSONFormWidget/constants";
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
import { klona as clone, klona } from "klona";
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
import type { SortOrder } from "antd/es/table/interface";
import { ROOT_SCHEMA_KEY } from "widgets/JSONFormWidget/constants";
import type { ProFormInstance } from "@ant-design/pro-components";
import React from "react";
import { convertSchemaItemToFormData } from "widgets/JSONFormWidget/helper";
import type {
  JSONFormWidgetProps,
  JSONFormWidgetState,
  MetaInternalFieldState,
} from "widgets/Antd/JSONFormWidget/widget";
import {
  ComputedSchemaStatus,
  computeSchema,
  dynamicPropertyPathListFromSchema,
  generateFieldState,
} from "widgets/Antd/JSONFormWidget/widget/helper";
import type { AppState } from "ce/reducers";
import { connect } from "react-redux";

import {
  getCanvasWidth,
  snipingModeSelector,
  getIsAutoLayout,
} from "selectors/editorSelectors";
import ModalWidget from "widgets/ModalWidget";
import { ReduxActionTypes } from "ce/constants/ReduxActionConstants";
import { getAppMode } from "selectors/entitiesSelector";
import { APP_MODE } from "entities/App";
import { message } from "antd";
import { schema } from "normalizr";
import { resetToDefaultValues } from "./propertyUtils";

const ReactTableComponent = lazy<ComponentType<AntdTableProps>>(() =>
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

class AntdProTableWidget extends BaseWidget<TableWidgetProps, WidgetState> {
  inlineEditTimer: number | null = null;
  actionQueue: Action[];
  debouncedParseAndSaveFieldState: any;

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
    this.actionQueue = [];
    this.debouncedParseAndSaveFieldState = debounce(
      this.parseAndSaveFieldState,
      400,
    );
  }
  jsonFormRef = React.createRef<ProFormInstance<any>>();
  state = {
    resetObserverCallback: noop,
    metaInternalFieldState: {},
  };

  computeDynamicPropertyPathList = (schema: Schema) => {
    const pathListFromSchema = dynamicPropertyPathListFromSchema(
      schema,
      "autoFormConfig.config.schema",
    );
    const pathListFromProps = (this.props.dynamicPropertyPathList || []).map(
      ({ key }) => key,
    );

    const newPaths = difference(pathListFromSchema, pathListFromProps);

    return [...pathListFromProps, ...newPaths].map((path) => ({ key: path }));
  };

  updateDynamicPropertyPathList = () => {
    const dynamicPropertyPathList = this.computeDynamicPropertyPathList(
      this.props.autoFormConfig.config.schema,
    );
    this.batchUpdateWidgetProperty({
      modify: { dynamicPropertyPathList },
    });
  };

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
        newTableData: generateTypeDef(widget.newTableData, extraDefsToDefine),
        pageNo: "number",
        pageSize: "number",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        searchText: "string",
        totalRecordsCount: "number",
        sortOrder: generateTypeDef(widget.sortOrder),
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
        formData: generateTypeDef(widget.formData),
        fieldState: generateTypeDef(widget.fieldState),
        sourceData: generateTypeDef(widget.sourceData),
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
        setFormData: {
          path: "formData",
          type: "object",
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
    // editableColumn
    if (this.props.tableData?.length) {
      setTimeout(() => {
        console.log("componentDidMount generateJSONFormSchema");

        this.generateJSONFormSchema({
          ...this.props.autoFormConfig.config,
          sourceData: this.cleanObject(this.props.tableData[0]),
        });
      }, 100);
    }

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

    const initialSourceData = this.cleanObject(this.props.tableData?.[0] || {});
    this.batchUpdateWidgetProperty({
      modify: {
        sourceData: initialSourceData,
        defaultFormData: resetToDefaultValues(initialSourceData || {}),
      },
    });
  }
  componentDidUpdate(prevProps: TableWidgetProps) {
    const {
      defaultPageSize,
      defaultSelectedRowKeys,
      pageNo,
      pageSize,
      primaryColumns = {},
      serverSidePaginationEnabled,
      tableType,
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

    if (!equal(prevProps.autoFormConfig, this.props.autoFormConfig)) {
      this.updateDynamicPropertyPathList();
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

    // editableColumn
    if (
      !equal(prevProps.tableData, this.props.tableData) &&
      this.props.tableType !== "edit"
    ) {
      console.log("componentDidUpdate generateJSONFormSchema", this.props);

      const sourceData = isEmpty(this.props.formData)
        ? this.cleanObject(this.props.tableData?.[0]) || {}
        : this.props.formData;
      this.generateJSONFormSchema({
        ...this.props.autoFormConfig.config,
        sourceData: sourceData,
      });
    }

    this.pushResetPageNoUpdates(prevProps);

    commitBatchMetaUpdates();
  }
  getPreviousSourceData = (prevProps?: JSONFormWidgetProps) => {
    const JSONFormProps = this.props.autoFormConfig.config;

    // The autoGenerate flag was switched on.
    if (!prevProps?.autoGenerateForm && JSONFormProps.autoGenerateForm) {
      const rootSchemaItem =
        JSONFormProps.schema && JSONFormProps.schema[ROOT_SCHEMA_KEY];

      return rootSchemaItem?.sourceData || {};
    }

    return prevProps?.sourceData;
  };
  cleanObject = (obj?: Record<string, unknown>) => {
    // 如果不是对象或者是null,直接返回
    if (typeof obj !== "object" || !obj) {
      return obj;
    }

    // 创建新对象
    const cleanedObj: Record<string, unknown> = {};

    // 遍历原对象的所有键
    for (const key in obj) {
      const value = obj[key];

      // 跳过包含双下划线的键名
      if (key.includes("__")) {
        continue;
      }

      // 跳过数组类型的值
      if (Array.isArray(value)) {
        continue;
      }

      // 如果值是对象,递归处理
      if (typeof value === "object" && value !== null) {
        cleanedObj[key] = this.cleanObject(value as Record<string, unknown>);
      } else {
        // 保留其他正常的键值对
        cleanedObj[key] = value;
      }
    }

    return cleanedObj;
  };
  generateJSONFormSchema = (nextProps?: JSONFormWidgetProps) => {
    const JSONFormProps = this.props.autoFormConfig.config;
    if (!JSONFormProps.autoGenerateForm)
      return {
        status: ComputedSchemaStatus.UNCHANGED,
        schema: JSONFormProps?.schema || {},
      };

    const prevSourceData = JSONFormProps?.sourceData;
    const currSourceData = this.getPreviousSourceData(nextProps);

    const prevSchema = JSONFormProps?.schema;

    // auto
    const computedSchema = computeSchema({
      basePath: "autoFormConfig.config.schema",
      currentDynamicPropertyPathList: this.props.dynamicPropertyPathList,
      currSourceData,
      prevSchema: prevSchema,
      prevSourceData,
      widgetName: this.props.widgetName,
      fieldThemeStylesheets: JSONFormProps.childStylesheet,
      isCreateForm: nextProps?.isCreateForm,
    });

    const {
      dynamicPropertyPathList,
      modifiedSchemaItems,
      removedSchemaItems,
      schema,
      status,
    } = computedSchema;
    console.log("表格 generateJSONFormSchema", {
      computedSchema,
      schema,
      prevSourceData,
      currSourceData,
      nextProps,
      prevSchema,
      primaryColumns: this.props.primaryColumns,
    });

    if (
      status === ComputedSchemaStatus.LIMIT_EXCEEDED &&
      !JSONFormProps.fieldLimitExceeded
    ) {
      this.updateWidgetProperty("fieldLimitExceeded", true);
    } else if (status === ComputedSchemaStatus.UPDATED) {
      const payload: BatchPropertyUpdatePayload = {
        modify: {
          dynamicPropertyPathList,
          fieldLimitExceeded: false,
        },
      };

      /**
       * This means there was no schema before and the computeSchema returns a
       * fresh schema than can be directly updated.
       */
      if (isEmpty(JSONFormProps?.schema)) {
        payload.modify = {
          ...payload.modify,
          autoFormConfig: {
            ...this.props.autoFormConfig,
            config: {
              ...JSONFormProps,
              sourceData: currSourceData,
              schema,
            },
          },
        };
      } else {
        payload.modify = {
          ...payload.modify,
          ...modifiedSchemaItems,
        };

        payload.remove = removedSchemaItems;
      }
      payload.modify = {
        ...payload.modify,
        sourceData: currSourceData,
        formData: currSourceData,
      };

      console.log("generateJSONFormSchema UPDATED", {
        payload,
        currSourceData,
        schema,
        prevSchema,
        dynamicPropertyPathList,
        modifiedSchemaItems,
        removedSchemaItems,
      });

      this.batchUpdateWidgetProperty(payload);
    }

    this.updateWidgetProperty("autoFormConfig", {
      ...this.props.autoFormConfig,
      config: {
        ...JSONFormProps,
        sourceData: currSourceData,
        schema,
      },
    });

    return computedSchema;
  };

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
  updateAllColumnsEditable = (isEditable: boolean) => {
    const { primaryColumns } = this.props;
    const propertiesToAdd: Record<string, unknown> = {};

    Object.keys(primaryColumns).forEach((columnId) => {
      propertiesToAdd[`primaryColumns.${columnId}.isEditable`] = isEditable;
    });

    const propertiesToUpdate = {
      modify: propertiesToAdd,
    };

    super.batchUpdateWidgetProperty(propertiesToUpdate);
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
  handleQueryDataChange = (params: any, onlyUpdate?: boolean) => {
    console.log("Antd 表格 handleQueryDataChange", params);
    let actionPayload;
    if (onlyUpdate) {
      actionPayload = undefined;
    } else {
      actionPayload = this.props.onPageChange
        ? {
            dynamicString: this.props.onPageChange,
            event: {
              type: EventType.ON_QUERY_CHANGE,
            },
          }
        : undefined;
      if (!this.props.onPageChange) {
        message.warning("请配置查询事件");
      }
    }

    // this.props.updateWidgetMetaProperty("isLoading", true);
    this.props.updateWidgetMetaProperty("queryData", params, actionPayload);
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
    const { commitBatchMetaUpdates, pushBatchMetaUpdates, updatedRowKeys } =
      this.props;

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

  handleColumnSorting = (sortInfo: {
    sortField: Key | undefined;
    sortOrder: SortOrder | undefined;
    column: any;
  }) => {
    console.log("Antd 表格 handleColumnSorting", sortInfo);

    const columnId = sortInfo?.column?.id;
    const isAsc = sortInfo.sortOrder === "ascend";
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
  updateNewTableData = (value: any[]) => {
    this.props.updateWidgetMetaProperty("newTableData", value);
    console.log("Antd 表格 updateNewTableData", value);
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
    const showConnectDataOverlay =
      primaryColumns &&
      !Object.keys(primaryColumns).length &&
      this.props.renderMode === RenderModes.CANVAS;
    const isEditingMode =
      this.props.appMode === APP_MODE.EDIT && !this.props.isPreviewMode;
    console.group("Antd 表格 Table Widget 111");
    console.log(" this.props", this.props, this);
    console.log("tableColumns", tableColumns);
    console.log(` showConnectDataOverlay`, showConnectDataOverlay);

    console.groupEnd();

    return (
      <Suspense fallback={<Skeleton />}>
        <ReactTableComponent
          accentColor={this.props.accentColor}
          actionWidth={this.props.actionWidth}
          addNewRowPosition={this.props.addNewRowPosition}
          addNewRowText={this.props.addNewRowText}
          allowAddNewRow={this.props.allowAddNewRow}
          allowRowSelection={this.props.allowRowSelection}
          applyFilter={this.updateFilters}
          autoFormConfig={this.props.autoFormConfig}
          autoGenerateTableForm={this.props.autoGenerateTableForm}
          batchUpdateWidgetProperty={this.onBatchUpdateWidgetProperty}
          borderColor={this.props.borderColor}
          borderRadius={this.props.borderRadius}
          borderWidth={this.props.borderWidth}
          boxShadow={this.props.boxShadow}
          canFreezeColumn={this.props.canFreezeColumn}
          cardBorderedSearch={this.props.cardBorderedSearch}
          cardBorderedTable={this.props.cardBorderedTable}
          childrenColumnName={this.props.childrenColumnName}
          columnActions={this.props.columnActions}
          columnWidthMap={this.props.columnWidthMap}
          columns={tableColumns}
          compactMode={this.props.compactMode || "middle"}
          creatorButtonText={this.props.creatorButtonText}
          data={this.props.data}
          defaultExpandAllRows={this.props.defaultExpandAllRows}
          defaultExpandedRowKeys={this.props.defaultExpandedRowKeys}
          defaultNewRow={this.props.defaultNewRow}
          defaultPageSize={this.props.defaultPageSize}
          delimiter={delimiter}
          disableDrag={this.toggleDrag}
          disabledAddNewRowSave={this.props.disabledAddNewRowSave}
          editMode={this.props.renderMode === RenderModes.CANVAS}
          editType={this.props.editType}
          editableCell={this.props.editableCell}
          editableColumn={this.props.editableColumn}
          editableKeys={this.props.editableKeys}
          editableRecords={this.props.editableRecords}
          editingActions={this.props.editingActions}
          enableSearchFormValidation={this.props.enableSearchFormValidation}
          executeAction={this.onExecuteAction}
          expandRowByClick={this.props.expandRowByClick}
          expandedKeys={this.props.expandedKeys}
          filteredTableData={this.props.filteredTableData}
          filters={this.props.filters}
          handleAddNewRow={this.handleAddNewRow}
          handleAlertBtnClick={this.handleAlertBtnClick}
          handleCellValueChange={this.handleCellValueChange}
          handleColumnFreeze={this.handleColumnFreeze}
          handleColumnSorting={this.handleColumnSorting}
          handleDragSortEnd={this.handleDragSortEnd}
          handleEditableRowChange={this.handleEditableRowChange}
          handleEditableValuesChange={this.handleEditableValuesChange}
          handleExpandedRowsChange={this.handleExpandedRowsChange}
          handleQueryDataChange={this.handleQueryDataChange}
          handleReorderColumn={this.handleReorderColumn}
          handleRowBtnClick={this.handleRowBtnClick}
          handleRowClick={this.handleRowClick}
          handleRowSelect={this.handleRowSelect}
          handleRowSelectionChange={this.handleRowSelectionChange}
          handleSwitchValueChange={this.handleSwitchValueChange}
          handleUrlOrImgClick={this.handleUrlOrImgClick}
          headerBorderRadius={this.props.headerBorderRadius}
          headerTitle={this.props.headerTitle}
          height={componentHeight}
          hideOnSinglePage={this.props.hideOnSinglePage}
          hideSelectAll={this.props.hideSelectAll}
          isAddRowInProgress={this.props.isAddRowInProgress}
          isEditingMode={isEditingMode}
          isLoading={this.props.isLoading}
          isRemoteSort={this.props.isRemoteSort}
          isVirtual={this.props.isVirtual}
          isVisibleCellSetting={this.props.isVisibleCellSetting}
          isVisibleDensity={this.props.isVisibleDensity}
          isVisibleDownload={isVisibleDownload}
          isVisibleFullScreen={this.props.isVisibleFullScreen}
          isVisiblePagination={isVisiblePagination}
          isVisibleRefresh={this.props.isVisibleRefresh}
          isVisibleSearch={isVisibleSearch}
          jsonFormRef={this.jsonFormRef}
          multiRowSelection={
            this.props.multiRowSelection && !this.props.isAddRowInProgress
          }
          nextPageClick={this.handleNextPageClick}
          onBulkEditDiscard={this.onBulkEditDiscard}
          onBulkEditSave={this.onBulkEditSave}
          onConnectData={this.onConnectData}
          onExpand={this.onExpand}
          onJsonFormSubmit={this.onJsonFormSubmit}
          pageNo={this.props.pageNo}
          pageSize={this.props.pageSize}
          paginationDisabled={this.props.paginationDisabled}
          paginationSize={this.props.paginationSize}
          prevPageClick={this.handlePrevPageClick}
          primaryColumnId={this.props.primaryColumnId}
          primaryColumns={this.props.primaryColumns}
          renderMode={this.props.renderMode}
          rowSelectionActions={this.props.rowSelectionActions}
          rowSelectionColumnAlign={this.props.rowSelectionColumnAlign}
          rowSelectionColumnRender={this.props.rowSelectionColumnRender}
          rowSelectionColumnTitle={this.props.rowSelectionColumnTitle}
          rowSelectionColumnWidth={this.props.rowSelectionColumnWidth}
          rowSelectionFixed={this.props.rowSelectionFixed}
          rowSelectionType={this.props.rowSelectionType}
          searchKey={this.props.searchText}
          searchTableData={this.handleSearchTable}
          selectedRowKeys={this.props.selectedRowKeys}
          selectedRows={this.props.selectedRows}
          selectionColumnWidth={this.props.selectionColumnWidth}
          serverSidePaginationEnabled={!!this.props.serverSidePaginationEnabled}
          setMetaInternalFieldState={this.setMetaInternalFieldState}
          showConnectDataOverlay={showConnectDataOverlay}
          showQuickJumper={this.props.showQuickJumper}
          showSizeChanger={this.props.showSizeChanger}
          simplePagination={this.props.simplePagination}
          tableBackground={this.props.tableBackground}
          tableData={finalTableData}
          tableInlineEditType={this.props.tableInlineEditType}
          tablePrimaryColor={this.props.tablePrimaryColor}
          tableType={this.props.tableType}
          textSize={this.props.textSize}
          toolBarActions={this.props.toolBarActions}
          totalRecordsCount={totalRecordsCount}
          triggerRowSelection={this.props.triggerRowSelection}
          updateDefaultFormData={this.updateDefaultFormData}
          updateNewTableData={this.updateNewTableData}
          updatePageNo={this.updatePageNumber}
          updatePageSize={this.updatePageSize}
          updateWidgetFormData={this.updateWidgetFormData}
          updateWidgetMetaProperty={this.props.updateWidgetMetaProperty}
          updateWidgetProperty={this.onUpdateWidgetProperty}
          variant={this.props.variant}
          widgetId={this.props.widgetId}
          widgetName={this.props.widgetName}
          width={componentWidth}
        />
      </Suspense>
    );
  }
  onBatchUpdateWidgetProperty = (
    updates: BatchPropertyUpdatePayload,
    shouldReplay?: boolean,
  ) => {
    this.batchUpdateWidgetProperty(updates, shouldReplay);
  };
  onUpdateWidgetProperty = (propertyName: string, propertyValue: any) => {
    this.updateWidgetProperty(propertyName, propertyValue);
  };

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
  applyGlobalContextToAction = (
    actionPayload: ExecuteTriggerPayload,
    context: Record<string, unknown> = {},
  ) => {
    const payload = klona(actionPayload);
    const { globalContext } = payload;

    /**
     * globalContext from the actionPayload takes precedence as it may have latest
     * values compared the ones coming from props
     * */
    payload.globalContext = merge(
      {},
      {
        formData: this.props.formData,
        fieldState: this.props.fieldState,
        sourceData: this.props.sourceData,
      },
      context,
      globalContext,
    );

    return payload;
  };
  onExecuteAction = (action: Action) => {
    const { updateDependencyType, ...actionPayload } = action;

    if (!updateDependencyType) {
      const payload = this.applyGlobalContextToAction(actionPayload);

      super.executeAction(payload);
    } else {
      this.actionQueue.push(action);
    }
  };
  updateDefaultFormData = (values: any) => {
    const defaultFormData = this.props.defaultFormData || {};
    const newFormData = merge(defaultFormData, values);
    console.log("updateDefaultFormData", {
      defaultFormData: this.props.defaultFormData,
      values,
      newFormData,
    });

    this.props.updateWidgetMetaProperty("defaultFormData", newFormData);
  };
  updateWidgetFormData = (values: any, skipConversion = false) => {
    const rootSchemaItem =
      this.props.autoFormConfig.config.schema[ROOT_SCHEMA_KEY];
    const { sourceData, useSourceData } = this.props;
    let formData = values;
    if (!rootSchemaItem) return;
    if (!skipConversion) {
      formData = convertSchemaItemToFormData(rootSchemaItem, values, {
        fromId: "identifier",
        toId: "accessor",
        useSourceData,
        sourceData,
      });
    }

    console.log("updateWidgetFormData", {
      values,
      skipConversion,
      rootSchemaItem,
      useSourceData,
      sourceData,
      formData,
    });
    this.props.updateWidgetMetaProperty("formData", formData);
    // this.batchUpdateWidgetProperty(
    //   {
    //     modify: {
    //       // "autoFormConfig.config.sourceData": formData,
    //       formData: values,
    //     },
    //   },
    //   false,
    // );

    if (this.actionQueue.length) {
      this.actionQueue.forEach(({ updateDependencyType, ...actionPayload }) => {
        if (updateDependencyType === ActionUpdateDependency.FORM_DATA) {
          const payload = this.applyGlobalContextToAction(actionPayload, {
            formData: values,
          });

          super.executeAction(payload);
        }
      });

      this.actionQueue = this.actionQueue.filter(
        ({ updateDependencyType }) =>
          updateDependencyType !== ActionUpdateDependency.FORM_DATA,
      );
    }
  };

  parseAndSaveFieldState = (
    metaInternalFieldState: MetaInternalFieldState,
    schema: Schema,
    afterUpdateAction?: ExecuteTriggerPayload,
  ) => {
    const fieldState = generateFieldState(schema, metaInternalFieldState);
    const action = klona(afterUpdateAction);

    const actionPayload =
      action && this.applyGlobalContextToAction(action, { fieldState });

    if (!equal(fieldState, this.props.fieldState)) {
      this.props.updateWidgetMetaProperty(
        "fieldState",
        fieldState,
        actionPayload,
      );
    }
  };
  setMetaInternalFieldState = (
    updateCallback: (prevState: JSONFormWidgetState) => JSONFormWidgetState,
    afterUpdateAction?: ExecuteTriggerPayload,
  ) => {
    this.setState((prevState) => {
      const newState = updateCallback(prevState as JSONFormWidgetState);

      this.parseAndSaveFieldState(
        newState.metaInternalFieldState,
        this.props.autoFormConfig.config.schema,
        afterUpdateAction,
      );

      return newState;
    });
  };

  onJsonFormSubmit = (
    values: any,
    targetActionName: "onSubmit" | "onSubmitWithEdit",
    cb?: () => void,
  ) => {
    const targetAction = this.props.autoFormConfig.config[targetActionName];

    if (targetAction) {
      super.executeAction({
        triggerPropertyName: "autoFormConfig.config." + targetActionName,
        dynamicString: targetAction,
        event: {
          type: EventType.ON_SUBMIT,
          callback: () => {
            cb && cb();
          },
        },
        globalContext: {
          formData: values,
        },
      });
    } else {
      cb?.();
    }
  };
}

const mapDispatchToProps = (dispatch: any) => ({
  // TODO(abhinav): This is also available in dragResizeHooks
  // DRY this. Maybe leverage, CanvasWidget by making it a CanvasComponent?
  showPropertyPane: (
    widgetId?: string,
    callForDragOrResize?: boolean,
    force = false,
  ) => {
    dispatch({
      type:
        widgetId || callForDragOrResize
          ? ReduxActionTypes.SHOW_PROPERTY_PANE
          : ReduxActionTypes.HIDE_PROPERTY_PANE,
      payload: { widgetId, callForDragOrResize, force },
    });
  },
});

const mapStateToProps = (state: AppState) => {
  const props = {
    appMode: getAppMode(state),
    isSnipingMode: snipingModeSelector(state),
    isPreviewMode: state.ui.editor.isPreviewMode,
  };
  return props;
};

export default connect(mapStateToProps, mapDispatchToProps)(AntdProTableWidget);

// export default AntdProTableWidget;
