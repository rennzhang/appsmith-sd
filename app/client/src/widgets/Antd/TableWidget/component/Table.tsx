import { TableWrapper } from "./TableStyledWrappers";
import type { ReactTableColumnProps, StickyType } from "./Constants";
import { Colors } from "constants/Colors";
import type SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { createGlobalStyle } from "styled-components";
import { Classes as PopOver2Classes } from "@blueprintjs/popover2";
import fastdom from "fastdom";
import { ConnectDataOverlay } from "./ConnectDataOverlay";
import type { ActionType } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { ConfigProvider, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import React from "react";
import type { AntdTableProps } from "../constants";
// ColumnStateType
import { useEditableState, useColumnState, useTableQuery } from "./hooks";
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

export function ProTableComponent(props: AntdTableProps) {
  const { showConnectDataOverlay } = props;
  const actionRef = useRef<ActionType>();
  const scrollBarRef = useRef<any>(null);

  const isHeaderVisible =
    props.isVisibleSearch ||
    props.isVisibleFilters ||
    props.isVisibleDownload ||
    props.allowAddNewRow;

  useEffect(() => {
    if (props.isAddRowInProgress) {
      fastdom.mutate(() => {
        if (scrollBarRef && scrollBarRef?.current) {
          scrollBarRef.current.getScrollElement().scrollTop = 0;
        }
      });
    }
  }, [props.isAddRowInProgress]);

  // queryData
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
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

  useEffect(() => {
    const keys: any[] = [];
    props.selectedRowIndices?.map((index) => {
      const record = props.tableData[index];
      record && keys.push(record?.[props.primaryColumnId || ""]);
    });
    setSelectedRowKeys(keys);
  }, [props.selectedRowIndices, props.tableData]);

  const { actionColumn, columnsState, tableColumns } = useColumnState(props, {
    setInitialQueryData,
  });

  const editableMemo = useEditableState(props);

  console.group("Antd 表格 Table Protable  333");
  console.log("表格 props", props);
  console.log("primaryColumns", props.primaryColumns);
  console.log("表格 tableColumns", tableColumns);
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
        triggerRowSelection={props.triggerRowSelection}
        variant={props.variant}
        width={props.width}
      >
        <PopoverStyles
          borderRadius={props.borderRadius}
          widgetId={props.widgetId}
        />
        {
          <div className="overflow-auto" ref={scrollBarRef}>
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
              <ProTable
                actionRef={actionRef}
                cardBordered={{
                  search: props.cardBorderedSearch,
                  table: props.cardBorderedTable,
                }}
                columns={[...tableColumns, actionColumn]}
                columnsState={columnsState}
                dataSource={props.tableData}
                dateFormatter="string"
                defaultSize={props.compactMode}
                editable={editableMemo}
                expandable={{
                  childrenColumnName: props.childrenColumnName,
                  onExpand: props.onExpand,
                  expandRowByClick: props.expandRowByClick,
                }}
                form={form}
                loading={props.isLoading}
                onReset={habdleReset}
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
                pagination={pagination}
                request={handleRequest}
                rowKey={(record: any) => record[props.primaryColumnId || ""]}
                rowSelection={
                  props.multiRowSelection
                    ? {
                        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                        // 注释该行则默认不显示下拉选项
                        selections: [
                          Table.SELECTION_ALL,
                          Table.SELECTION_INVERT,
                        ],
                        selectedRowKeys: selectedRowKeys,
                        // defaultSelectedRowKeys: defaultSelectedRowKeys,

                        onChange: (selectedRowKeys, selectedRows) => {
                          console.log(
                            "selectedRowKeys: ",
                            selectedRowKeys,
                            "selectedRows: ",
                            selectedRows,
                          );
                          setSelectedRowKeys(selectedRowKeys);
                        },
                      }
                    : false
                }
                scroll={{ x: "100%", y: 400 }}
                search={
                  props?.isVisibleSearch
                    ? {
                        labelWidth: "auto",
                      }
                    : false
                }
                style={{ width: "100%" }}
                tableAlertOptionRender={() => {
                  return (
                    <Space size={16}>
                      <a>批量删除</a>
                      <a>导出数据</a>
                    </Space>
                  );
                }}
                virtual={props.isVirtual}
                tableAlertRender={({
                  onCleanSelected,
                  selectedRowKeys,
                  selectedRows,
                }) => {
                  console.log(selectedRowKeys, selectedRows);
                  return (
                    <Space size={24}>
                      <span>
                        已选 {selectedRowKeys.length} 项
                        <a
                          onClick={onCleanSelected}
                          style={{ marginInlineStart: 8 }}
                        >
                          取消选择
                        </a>
                      </span>
                    </Space>
                  );
                }}
                // toolBarRender={() => [
                //   <Button
                //     icon={<PlusOutlined />}
                //     key="button"
                //     onClick={() => {
                //       actionRef.current?.reload();
                //     }}
                //     type="primary"
                //   >
                //     新建
                //   </Button>,
                // ]}
              />
            </ConfigProvider>
          </div>
        }
      </TableWrapper>
    </>
  );
}

export default ProTableComponent;
