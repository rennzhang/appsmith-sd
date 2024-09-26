import { TableWrapper } from "./TableStyledWrappers";
import { Colors } from "constants/Colors";
import "simplebar-react/dist/simplebar.min.css";
import { createGlobalStyle } from "styled-components";
import { Classes as PopOver2Classes } from "@blueprintjs/popover2";
import { ConnectDataOverlay } from "./ConnectDataOverlay";
import type {
  ActionType,
  DragTableProps,
  EditableProTableProps,
  ProColumns,
} from "@ant-design/pro-components";
import { DragSortTable, EditableProTable } from "@ant-design/pro-components";
import { ConfigProvider, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import React from "react";
import type { AntdTableProps } from "../constants";
// ColumnStateType
import {
  useEditableState,
  useColumnState,
  useTableQuery,
  useExpandState,
  useSelectionState,
  useTableAlertState,
} from "./hooks";
import { data } from "utils/autoLayout/testData";
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

type TableComponentProps = EditableProTableProps<any, any> &
  DragTableProps<any, any> & {
    props: AntdTableProps;
  };
export function EditTableComponent(props: EditableProTableProps<any, any>) {
  return <EditableProTable {...props} />;
}
export function DragSortTableComponent(props: DragTableProps<any, any>) {
  return <DragSortTable {...props} />;
}

export function TableComponent(tableProps: TableComponentProps) {
  const { props } = tableProps;
  const isEditType = props.tableType === "edit";
  const isDragSortType = props.tableType === "dragSort";
  console.log("Antd 表格 333 tableProps", tableProps);
  console.log("Antd 表格 333 props", props);

  if (isEditType) {
    const _props = tableProps as EditableProTableProps<any, any>;
    return <EditTableComponent {..._props} />;
  } else {
    const [dataSource, setDataSource] = useState(tableProps.dataSource);
    useEffect(() => {
      setDataSource(tableProps.dataSource);
    }, [tableProps.dataSource]);
    const _props = tableProps as DragTableProps<any, any>;
    const dragSortColumn = isDragSortType
      ? [
          {
            title: "排序",
            dataIndex: "sort",
            width: 60,
            className: "drag-visible",
          },
          ...(tableProps!.columns as ProColumns<any, "text">[]),
        ]
      : tableProps.columns;
    return (
      <DragSortTable
        // {..._props}
        columns={dragSortColumn}
        dragSortKey="sort"
        expandable={{
          childrenColumnName: "children123",
        }}
        onDragSortEnd={(
          beforeIndex: number,
          afterIndex: number,
          newDataSource: any[],
        ) => {
          setDataSource(newDataSource);

          console.log("Antd 表格 333 onDragSortEnd", {
            beforeIndex,
            afterIndex,
            newDataSource,
          });
        }}
        pagination={false}
        request={async () => {
          return {
            data: tableProps.dataSource as any[],
            success: true,
            total: tableProps.dataSource?.length || 0,
          };
        }}
        search={false}
      />
    );
  }
}
export function ProTableComponent(props: AntdTableProps) {
  const { showConnectDataOverlay } = props;
  const actionRef = useRef<ActionType | null>(null);
  const scrollBarRef = useRef<any>(null);

  const isHeaderVisible =
    props.isVisibleSearch || props.isVisibleDownload || props.allowAddNewRow;

  // useEffect(() => {
  //   if (props.isAddRowInProgress) {
  //     fastdom.mutate(() => {
  //       console.log("scrollBarRef", scrollBarRef);

  //       if (
  //         scrollBarRef &&
  //         scrollBarRef?.current &&
  //         scrollBarRef.current?.getScrollElement()
  //       ) {
  //         scrollBarRef.current.getScrollElement().scrollTop = 0;
  //       }
  //     });
  //   }
  // }, [props.isAddRowInProgress]);

  // const { addNewRowBtn } = useNewRowState(props, actionRef);
  // queryData
  // 抽离查询相关逻辑
  const {
    form,
    habdleReset,
    handleRequest,
    pagination,
    queryData,
    setInitialQueryData,
    setQueryData,
  } = useTableQuery(props);

  const { actionColumn, columnsState, tableColumns } = useColumnState(props, {
    setInitialQueryData,
  });

  const { tableAlertOptionRender, tableAlertRender } =
    useTableAlertState(props);

  const { expandable } = useExpandState(props);

  const { addNewRowBtn, editable } = useEditableState(props, actionRef);

  const { rowSelection } = useSelectionState(props);
  console.group("Antd 表格 Table Protable  222");
  console.log("表格 props", props);
  console.log("primaryColumns", props.primaryColumns);
  console.log("表格 tableColumns", tableColumns);
  console.log(` expandable`, expandable);
  console.log(` expandedKeys`, expandable.expandedRowKeys);
  console.groupEnd();
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
        {
          <div className="overflow-auto">
            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    borderRadius:
                      (props.borderRadius as unknown as number) || 0,
                    fontSize: (props.textSize as unknown as number) || 0,
                    // colorBgContainer: props.tableBackground,
                    headerBorderRadius:
                      (props.headerBorderRadius as unknown as number) || 0,
                  },
                },
              }}
            >
              <TableComponent
                actionRef={actionRef}
                cardBordered={{
                  search: props.cardBorderedSearch,
                  table: props.cardBorderedTable,
                }}
                columns={[
                  // {
                  //   title: "排序",
                  //   dataIndex: "sort",
                  //   width: 60,
                  //   className: "drag-visible",
                  // },
                  ...tableColumns,
                  actionColumn,
                ]}
                columnsState={columnsState}
                dataSource={props.tableData}
                dateFormatter="string"
                expandable={expandable}
                form={form}
                onReset={habdleReset}
                onRow={(record, index) => {
                  return {
                    onClick: (e) => {
                      console.log("antd table onRow onClick", {
                        record,
                        index,
                        e,
                      });
                      props.onRowClick(record, index ?? -1);
                    },
                  };
                }}
                options={{
                  reload: props.isVisibleRefresh,
                  fullScreen: props.isVisibleFullScreen,
                  density: props.isVisibleDensity,
                  setting: props.isVisibleCellSetting
                    ? {
                        listsHeight: 400,
                      }
                    : false,
                }}
                loading={props.isLoading}
                // onDragSortEnd={() => {
                //   console.log("表格 onDragSortEnd: ");
                // }}
                pagination={pagination}
                props={props}
                request={handleRequest}
                rowKey={(record: any) => record[props.primaryColumnId || ""]}
                rowSelection={rowSelection}
                scroll={{ x: "100%" }}
                search={
                  props?.isVisibleSearch
                    ? {
                        labelWidth: "auto",
                      }
                    : false
                }
                style={{ width: "100%" }}
                tableAlertOptionRender={tableAlertOptionRender}
                tableAlertRender={tableAlertRender}
                toolBarRender={() => [
                  addNewRowBtn,
                  // <Button
                  //   icon={<PlusOutlined />}
                  //   key="button"
                  //   onClick={() => {
                  //     actionRef.current?.reload();
                  //   }}
                  //   type="primary"
                  // >
                  //   新建
                  // </Button>,
                ]}
                virtual={props.isVirtual}
                defaultSize={props.compactMode}
                // dragSortKey="sort"
                editable={editable}
              />
            </ConfigProvider>
          </div>
        }
      </TableWrapper>
    </>
  );
}

export default ProTableComponent;
