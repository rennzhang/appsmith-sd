import React, { useEffect, useMemo, useRef } from "react";
import { reduce } from "lodash";
import type { Row as ReactTableRowType } from "react-table";
import {
  useTable,
  usePagination,
  useBlockLayout,
  useResizeColumns,
  useRowSelect,
} from "react-table";
import { useSticky } from "react-table-sticky";
import { TableWrapper } from "./TableStyledWrappers";
import type {
  ReactTableColumnProps,
  ReactTableFilter,
  CompactMode,
  AddNewRowActions,
  StickyType,
} from "./Constants";
import { Colors } from "constants/Colors";
import type { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type {
  AntdTableProps,
  ButtonAction,
  EditableCell,
  TableVariant,
} from "../constants";
import type SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { createGlobalStyle } from "styled-components";
import { Classes as PopOver2Classes } from "@blueprintjs/popover2";
import fastdom from "fastdom";
import { ConnectDataOverlay } from "./ConnectDataOverlay";
import Protable from "./ProTable";
const HEADER_MENU_PORTAL_CLASS = ".header-menu-portal";

const PopoverStyles = createGlobalStyle<{
  widgetId: string;
  borderRadius: string;
}>`
    ${HEADER_MENU_PORTAL_CLASS}-${({ widgetId }) => widgetId}
    {
      font-family: var(--wds-font-family) !important;

      & .${PopOver2Classes.POPOVER2},
      .${PopOver2Classes.POPOVER2_CONTENT},
      .bp3-menu {
        border-radius: ${({ borderRadius }) =>
          borderRadius >= `1.5rem` ? `0.375rem` : borderRadius} !important;
      }
    }
`;

const defaultColumn = {
  minWidth: 30,
  width: 150,
};

export type HeaderComponentProps = {
  enableDrag: () => void;
  disableDrag: () => void;
  multiRowSelection?: boolean;
  handleAllRowSelectClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
  handleReorderColumn: (columnOrder: string[]) => void;
  columnOrder?: string[];
  accentColor: string;
  borderRadius: string;
  headerGroups: any;
  canFreezeColumn?: boolean;
  editMode: boolean;
  handleColumnFreeze?: (columnName: string, sticky?: StickyType) => void;
  isResizingColumn: React.MutableRefObject<boolean>;
  isSortable?: boolean;
  sortTableColumn: (columnIndex: number, asc: boolean) => void;
  columns: ReactTableColumnProps[];
  width: number;
  subPage: ReactTableRowType<Record<string, unknown>>[];
  prepareRow: any;
  headerWidth?: number;
  rowSelectionState: 0 | 1 | 2 | null;
  widgetId: string;
};

const emptyArr: any = [];

export function Table(props: AntdTableProps) {
  const isResizingColumn = React.useRef(false);
  const handleResizeColumn = (columnWidths: Record<string, number>) => {
    const columnWidthMap = {
      ...props.columnWidthMap,
      ...columnWidths,
    };
    for (const i in columnWidthMap) {
      if (columnWidthMap[i] < 60) {
        columnWidthMap[i] = 60;
      } else if (columnWidthMap[i] === undefined) {
        const columnCounts = props.columns.filter(
          (column) => !column.isHidden,
        ).length;
        columnWidthMap[i] = props.width / columnCounts;
      }
    }
    props.handleResizeColumn(columnWidthMap);
  };
  const {
    columns,
    data,
    multiRowSelection,
    showConnectDataOverlay,
    toggleAllRowSelect,
  } = props;
  console.log("Table -> props", props, columns, data);


  const tableHeadercolumns = React.useMemo(
    () =>
      columns.filter((column: ReactTableColumnProps) => {
        return column.alias !== "actions" && column.alias!=="children";
      }),
    [columns],
  );

  const pageCount =
    props.serverSidePaginationEnabled && props.totalRecordsCount
      ? Math.ceil(props.totalRecordsCount / props.pageSize)
      : Math.ceil(props.data.length / props.pageSize);
  const currentPageIndex = props.pageNo < pageCount ? props.pageNo : 0;
  const { page, pageOptions, prepareRow, state, totalColumnsWidth } = useTable(
    {
      //columns and data needs to be memoised as per useTable specs
      columns,
      data,
      defaultColumn,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: props.pageSize,
      },
      manualPagination: true,
      pageCount,
    },
    useBlockLayout,
    useResizeColumns,
    usePagination,
    useRowSelect,
    useSticky,
  );
  //Set isResizingColumn as true when column is resizing using table state
  if (state.columnResizing.isResizingColumn) {
    isResizingColumn.current = true;
  } else {
    // We are updating column size since the drag is complete when we are changing value of isResizing from true to false
    if (isResizingColumn.current) {
      //clear timeout logic
      //update isResizingColumn in next event loop so that dragEnd event does not trigger click event.
      setTimeout(function () {
        isResizingColumn.current = false;
        handleResizeColumn(state.columnResizing.columnWidths);
      }, 0);
    }
  }
  let startIndex = currentPageIndex * props.pageSize;
  let endIndex = startIndex + props.pageSize;
  if (props.serverSidePaginationEnabled) {
    startIndex = 0;
    endIndex = props.data.length;
  }
  const subPage = useMemo(
    () => page.slice(startIndex, endIndex),
    [page, startIndex, endIndex],
  );
  const selectedRowIndices = props.selectedRowIndices || emptyArr;
  const scrollBarRef = useRef<SimpleBar | null>(null);
  const rowSelectionState = React.useMemo(() => {
    // return : 0; no row selected | 1; all row selected | 2: some rows selected
    if (!multiRowSelection) return null;
    const selectedRowCount = reduce(
      page,
      (count, row) => {
        return selectedRowIndices.includes(row.index) ? count + 1 : count;
      },
      0,
    );
    const result =
      selectedRowCount === 0 ? 0 : selectedRowCount === page.length ? 1 : 2;
    return result;
  }, [multiRowSelection, page, selectedRowIndices]);
  const isHeaderVisible =
    props.isVisibleSearch ||
    props.isVisibleFilters ||
    props.isVisibleDownload ||
    props.allowAddNewRow;

  const shouldUseVirtual =
    props.serverSidePaginationEnabled &&
    !props.columns.some(
      (column) => !!column.columnProperties.allowCellWrapping,
    );

  useEffect(() => {
    if (props.isAddRowInProgress) {
      fastdom.mutate(() => {
        if (scrollBarRef && scrollBarRef?.current) {
          scrollBarRef.current.getScrollElement().scrollTop = 0;
        }
      });
    }
  }, [props.isAddRowInProgress]);

  return (
    <>
      {showConnectDataOverlay && (
        <ConnectDataOverlay onConnectData={props.onConnectData} />
      )}
      <TableWrapper
        accentColor={props.accentColor}
        backgroundColor={Colors.ATHENS_GRAY_DARKER}
        borderColor={props.borderColor}
        borderRadius={props.borderRadius}
        borderWidth={props.borderWidth}
        boxShadow={props.boxShadow}
        className={showConnectDataOverlay ? "blur" : ""}
        height={props.height}
        id={`table${props.widgetId}`}
        isAddRowInProgress={props.isAddRowInProgress}
        isHeaderVisible={isHeaderVisible}
        isResizingColumn={isResizingColumn.current}
        multiRowSelection={props.multiRowSelection}
        triggerRowSelection={props.triggerRowSelection}
        variant={props.variant}
        width={props.width}
      >
        <PopoverStyles
          borderRadius={props.borderRadius}
          widgetId={props.widgetId}
        />
        {
          <Protable
            {...props}
            accentColor={props.accentColor}
            allowAddNewRow={props.allowAddNewRow}
            borderRadius={props.borderRadius}
            boxShadow={props.boxShadow}
            canFreezeColumn={props.canFreezeColumn}
            columnActions={props.columnActions}
            columns={tableHeadercolumns}
            compactMode={props.compactMode}
            delimiter={props.delimiter}
            disableAddNewRow={!!props.editableCell.column}
            disableDrag={props.disableDrag}
            disabledAddNewRowSave={props.disabledAddNewRowSave}
            editMode={props.editMode}
            enableDrag={props.enableDrag}
            handleReorderColumn={props.handleReorderColumn}
            height={props.height}
            isAddRowInProgress={props.isAddRowInProgress}
            isLoading={props.isLoading}
            isSortable={props.isSortable}
            isVisibleCellSetting={props.isVisibleCellSetting}
            isVisibleDensity={props.isVisibleDensity}
            isVisibleFilters={props.isVisibleFilters}
            isVisibleFullScreen={props.isVisibleFullScreen}
            isVisiblePagination={props.isVisiblePagination}
            isVisibleRefresh={props.isVisibleRefresh}
            isVisibleSearch={props.isVisibleSearch}
            multiRowSelection={props?.multiRowSelection}
            nextPageClick={props.nextPageClick}
            onAddNewRow={props.onAddNewRow}
            onAddNewRowAction={props.onAddNewRowAction}
            onQueryDataChange={props.onQueryDataChange}
            pageCount={pageCount}
            pageNo={props.pageNo}
            pageOptions={pageOptions}
            pageSize={props.pageSize}
            prepareRow={prepareRow}
            prevPageClick={props.prevPageClick}
            primaryColumnId={props.primaryColumnId}
            queryData={props.queryData}
            ref={scrollBarRef}
            rowSelectionState={rowSelectionState}
            selectTableRow={props.selectTableRow}
            selectedRowIndex={props.selectedRowIndex}
            selectedRowIndices={props.selectedRowIndices}
            serverSidePaginationEnabled={props.serverSidePaginationEnabled}
            sortTableColumn={props.sortTableColumn}
            subPage={subPage}
            tableColumns={columns}
            tableData={data}
            totalColumnsWidth={totalColumnsWidth}
            totalRecordsCount={props.totalRecordsCount}
            updatePageNo={props.updatePageNo}
            useVirtual={shouldUseVirtual}
            widgetId={props.widgetId}
            widgetName={props.widgetName}
            width={props.width}
          />
        }
      </TableWrapper>
    </>
  );
}

export default Table;
