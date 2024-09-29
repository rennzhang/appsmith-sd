import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { ConfigProvider, message } from "antd";
import { DragSortTable, EditableProTable } from "@ant-design/pro-components";
import type {
  ActionType,
  DragTableProps,
  EditableProTableProps,
  ProTableProps,
} from "@ant-design/pro-components";
import { TableWrapper } from "./TableStyledWrappers";
import { Colors } from "constants/Colors";
import { createGlobalStyle } from "styled-components";
import { Classes as PopOver2Classes } from "@blueprintjs/popover2";
import { ConnectDataOverlay } from "./ConnectDataOverlay";
import type { AntdTableProps } from "../constants";
import {
  useEditableState,
  useColumnState,
  useTableQuery,
  useExpandState,
  useSelectionState,
  useTableAlertState,
  useDragSortState,
} from "./hooks";

const HEADER_MENU_PORTAL_CLASS = ".header-menu-portal";

const PopoverStyles = createGlobalStyle<{
  widgetId: string;
  borderRadius: string;
}>`
  ${HEADER_MENU_PORTAL_CLASS}-${({ widgetId }) => widgetId} {
    font-family: var(--wds-font-family) !important;

    & .${PopOver2Classes.POPOVER2},
    .${PopOver2Classes.POPOVER2_CONTENT},
    .bp3-menu {
      border-radius: ${({ borderRadius }) =>
        borderRadius >= `1.5rem` ? `0.375rem` : borderRadius} !important;
    }
  }
`;

const ProtableRender = React.memo(function ProtableRender(
  props: AntdTableProps,
) {
  const actionRef = useRef<ActionType>(null);

  const isEditType = props.tableType === "edit";

  const {
    dataSource,
    form,
    habdleReset,
    handleRequest,
    pagination,
    setDataSource,
    setInitialQueryData,
  } = useTableQuery(props);

  const { columnsState, tableColumns } = useColumnState(props, {
    setInitialQueryData,
  });

  const { dragSortProps, isDragSortType } = useDragSortState(
    props,
    dataSource,
    setDataSource,
  );

  const { tableAlertOptionRender, tableAlertRender } =
    useTableAlertState(props);
  const { expandable } = useExpandState(props);
  const { addNewRowBtn, editable } = useEditableState(props, actionRef);
  const { rowSelection } = useSelectionState(props);

  const columns = useMemo(() => {
    if (isDragSortType) {
      return [
        {
          title: "排序",
          dataIndex: "sort",
          width: 90,
          className: "drag-visible",
        },
        ...tableColumns,
      ];
    }
    return tableColumns;
  }, [isDragSortType, tableColumns]);

  const commonProps: Omit<ProTableProps<any, any>, "onChange"> = useMemo(
    () => ({
      dataSource,
      headerTitle: props.headerTitle,
      actionRef,
      cardBordered: {
        search: props.cardBorderedSearch,
        table: props.cardBorderedTable,
      },
      columns,
      columnsState,
      dateFormatter: "string",
      defaultSize: props.compactMode,
      editable,
      expandable,
      form,
      loading: props.isLoading,
      onReset: habdleReset,
      onRow: (record, index) => ({
        onClick: (e) => {
          console.log("antd table onRow onClick", { record, index, e });
          props.handleRowClick?.(record, index ?? -1);
        },
      }),
      options: {
        reload: props.isVisibleRefresh,
        fullScreen: props.isVisibleFullScreen,
        density: props.isVisibleDensity,
        setting: props.isVisibleCellSetting ? { listsHeight: 400 } : false,
      },
      pagination,
      request: handleRequest,
      rowKey: (record: any) => record[props.primaryColumnId || ""],
      rowSelection,
      scroll: { x: "100%" },
      search: props?.isVisibleSearch ? { labelWidth: "auto" } : false,
      style: { width: "100%" },
      tableAlertOptionRender,
      tableAlertRender,
      toolBarRender: () => [addNewRowBtn],
      virtual: props.isVirtual,
    }),
    [
      props,
      columns,
      columnsState,
      editable,
      expandable,
      form,
      habdleReset,
      handleRequest,
      pagination,
      rowSelection,
      tableAlertOptionRender,
      tableAlertRender,
      addNewRowBtn,
    ],
  );

  const editableProps: EditableProTableProps<any, any> = useMemo(
    () =>
      isEditType
        ? {
            onChange: (value) => {
              console.log("antd 表格 editableProps onChange", value);
            },
          }
        : {},
    [isEditType],
  );

  return isEditType ? (
    <EditableProTable {...commonProps} {...editableProps} />
  ) : (
    <DragSortTable {...commonProps} {...dragSortProps} />
  );
});

export function ProTableComponent(props: AntdTableProps) {
  const { showConnectDataOverlay } = props;
  const scrollBarRef = useRef<any>(null);

  const isHeaderVisible = useMemo(
    () =>
      props.isVisibleSearch || props.isVisibleDownload || props.allowAddNewRow,
    [props.isVisibleSearch, props.isVisibleDownload, props.allowAddNewRow],
  );

  const configProviderTheme = useMemo(
    () => ({
      components: {
        Table: {
          borderRadius: (props.borderRadius as unknown as number) || 0,
          fontSize: (props.textSize as unknown as number) || 0,
          headerBorderRadius:
            (props.headerBorderRadius as unknown as number) || 0,
        },
      },
    }),
    [props.borderRadius, props.textSize, props.headerBorderRadius],
  );

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
        multiRowSelection={props.multiRowSelection}
        ref={scrollBarRef}
        triggerRowSelection={props.triggerRowSelection}
        variant={props.variant}
        width={props.width}
      >
        <PopoverStyles
          borderRadius={props.borderRadius}
          widgetId={props.widgetId}
        />
        <div className="overflow-auto">
          <ConfigProvider theme={configProviderTheme}>
            <ProtableRender {...props} />
          </ConfigProvider>
        </div>
      </TableWrapper>
    </>
  );
}

export default React.memo(ProTableComponent);
