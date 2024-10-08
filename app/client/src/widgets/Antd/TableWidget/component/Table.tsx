import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Button, ConfigProvider, message } from "antd";
import {
  DragSortTable,
  EditableProTable,
  ProTable,
} from "@ant-design/pro-components";
import type {
  ActionType,
  DragTableProps,
  EditableProTableProps,
  ProTableProps,
} from "@ant-design/pro-components";
import type { SearchConfig } from "@ant-design/pro-table/es/components/Form/FormRender";
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
  const isDragSortType = props.tableType === "dragSort";

  const {
    dataSource,
    form,
    habdleReset,
    handleRequest,
    onChange,
    pagination,
    setDataSource,
    setInitialQueryData,
    sortInfo,
  } = useTableQuery(props);

  const { columnsState, tableColumns } = useColumnState(props, {
    setInitialQueryData,
    sortInfo,
  });

  const { tableAlertOptionRender, tableAlertRender } =
    useTableAlertState(props);
  const { expandable } = useExpandState(props);
  const { addNewRowBtn, editable } = useEditableState(props, actionRef);
  const { rowSelection } = useSelectionState(props);

  const commonProps: Omit<ProTableProps<any, any>, "onChange"> = useMemo(
    () => ({
      dataSource,
      headerTitle: props.headerTitle,
      actionRef,
      cardBordered: {
        search: props.cardBorderedSearch,
        table: props.cardBorderedTable,
      },
      columns: tableColumns,
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
      search: props?.isVisibleSearch
        ? ({
            labelWidth: "auto",
          } as SearchConfig)
        : false,
      style: { width: "100%" },
      tableAlertOptionRender,
      tableAlertRender,
      toolBarRender: () => [
        addNewRowBtn,
        <Button
          key="save"
          onClick={() => {
            // dataSource 就是当前数据，可以调用 api 将其保存
            console.log(dataSource);
          }}
          type="primary"
        >
          保存数据
        </Button>,
      ],
      virtual: props.isVirtual,
    }),
    [
      props.isVisibleSearch,
      props.isVisibleRefresh,
      props.isVisibleFullScreen,
      props.isVisibleDensity,
      props.isVisibleCellSetting,
      tableColumns,
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
      dataSource,
    ],
  );

  const editableProps: EditableProTableProps<any, any> = useMemo(
    () =>
      isEditType
        ? {
            controlled: true,
            value: dataSource,
            request: undefined,
            onChange: (value) => {
              setDataSource(value as any);
              console.log("antd 表格 onChange editableProps ", value);
            },
            recordCreatorProps: {
              position: props.addNewRowPosition,
              creatorButtonText: props.creatorButtonText,
              newRecordType: "dataSource",
              record: () => ({
                id: Date.now(),
                ...props.defaultNewRow,
              }),
            },
          }
        : {},
    [
      dataSource,
      isEditType,
      props.creatorButtonText,
      props.addNewRowPosition,
      props.defaultNewRow,
    ],
  );

  const onDragSortEnd = (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: any,
  ) => {
    console.log("antd 表格 排序 排序后的数据", {
      newDataSource,
      dataSource,
      beforeIndex,
      afterIndex,
    });
    setDataSource(newDataSource);
    props.handleDragSortEnd?.(beforeIndex, afterIndex, newDataSource);
    message.success("修改列表排序成功");
  };

  console.group("Antd 表格 TABLE");
  console.log(" props", props);
  console.log(" commonProps", commonProps);
  console.log(" editableProps", editableProps);
  console.log(" columns", tableColumns);
  console.groupEnd();

  return isEditType ? (
    <EditableProTable {...commonProps} {...editableProps} />
  ) : isDragSortType ? (
    <DragSortTable
      {...commonProps}
      dragSortKey="sort"
      onChange={onChange}
      onDragSortEnd={onDragSortEnd}
      rowKey={props.primaryColumnId}
    />
  ) : (
    <ProTable {...commonProps} onChange={onChange} />
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
