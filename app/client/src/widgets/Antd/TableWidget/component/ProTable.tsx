import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { Space, Tag, Table } from "antd";
import { useEffect, useMemo, useRef } from "react";
import React from "react";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Colors } from "constants/Colors";

import type { CompactMode, ReactTableColumnProps } from "./Constants";
import { ColumnTypes, type ButtonAction } from "../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Alignment } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";

// import request from "umi-request";
export const waitTimePromise = async (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time = 100) => {
  await waitTimePromise(time);
};

export interface TableProps {
  columnActionClick: (onClick: string | undefined, index: number) => void;
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
  totalRecordsCount?: number;
  editMode: boolean;
  // editableCell: EditableCell;
  sortTableColumn: (columnIndex: number, asc: boolean) => void;
  handleResizeColumn: (columnWidthMap: { [key: string]: number }) => void;
  handleReorderColumn: (columnOrder: string[]) => void;
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
  disableDrag: () => void;
  enableDrag: () => void;
  toggleAllRowSelect: (
    isSelect: boolean,
    pageData: Record<string, unknown>[],
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
type GithubIssueItem = {
  url: string;
  id: number;
  number: number;
  title: string;
  labels: {
    name: string;
    color: string;
  }[];
  state: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
};

const getActionColumn = (props: TableProps): ProColumns => {
  console.clear();
  console.group("表格 getActionColumn");
  console.log("props", props);
  console.groupEnd();

  const sortedButtons = Object.values(props.columnActions)
    .sort((a, b) => a.index - b.index)
    .filter((c) => c.showButton);
  return {
    title: "操作",
    valueType: "option",
    key: "option",
    fixed: "right",
    width: 140,
    render: (text, record, _, action) => [
      ...Object.values(sortedButtons).map((button) => {
        return button.columnType == ColumnTypes.MENU_BUTTON ? (
          <TableDropdown
            key="actionGroup"
            menus={Object.values(button.menuItems || {})
              .filter((c) => c.isVisible)
              ?.map((c) => ({
                disabled: c.isDisabled,
                key: c.id,
                name: (
                  <div
                    className="inline-flex justify-center items-center"
                    style={{
                      color: c.textColor,
                      backgroundColor: c.backgroundColor,
                    }}
                  >
                    {c.iconAlign !== Alignment.RIGHT && c.iconName ? (
                      <Icon
                        className="mr-1"
                        color={c.iconColor || "currentColor"}
                        icon={c.iconName}
                      />
                    ) : null}
                    <span
                      onClick={() =>
                        props.columnActionClick(c.onClick, record.index)
                      }
                    >
                      {c.label}
                    </span>
                    {c.iconAlign == Alignment.RIGHT && c.iconName ? (
                      <Icon
                        className="ml-1"
                        color={c.iconColor || "currentColor"}
                        icon={c.iconName}
                      />
                    ) : null}
                  </div>
                ),
              }))}
          />
        ) : (
          <ButtonComponent
            buttonColor={button.buttonColor || Colors.AZURE_RADIANCE}
            buttonSize="sm"
            buttonVariant={"TERTIARY"}
            configToken={{
              paddingInline: 0,
              controlHeight: 22,
            }}
            iconAlign={button.iconAlign}
            iconName={
              button.columnType == ColumnTypes.BUTTON
                ? button.iconName
                : button.btnIconName
            }
            isDisabled={button.isDisabled}
            key={button.id}
            onClick={() => {
              props.columnActionClick(button.onBtnClick, record.index);
            }}
            text={
              button.columnType == ColumnTypes.ICON_BUTTON
                ? ""
                : button.buttonLabel
            }
            tooltip={button.tooltip}
            widgetId={button.widgetId}
          />
        );
      }),
    ],
  };
};

export default (props: TableProps) => {
  const actionRef = useRef<ActionType>();
  // queryData
  const [queryData, setQueryData] = React.useState({ ...props.queryData });
  const [pageNumber, setPageNumber] = React.useState(props.pageNo || 1);
  const [pageSize, setPageSize] = React.useState(props.pageSize || 10);
  const [dataSource, setDataSource] = React.useState(props.tableData);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  useEffect(() => {
    setPageNumber(props.pageNo || 1);
    setPageSize(props.pageSize || 10);
  }, [props.pageNo, props.pageSize]);

  useEffect(() => {
    setDataSource(props.tableData);
  }, [props.tableData]);

  useEffect(() => {
    const keys: any[] = [];
    props.selectedRowIndices?.map((index) => {
      const record = dataSource[index];
      record && keys.push(record?.[props.primaryColumnId || ""]);
    });
    setSelectedRowKeys(keys);
  }, [props.selectedRowIndices, dataSource]);

  const initialQueryData: Record<string, any> = {};
  const tableColumns = useMemo(() => {
    const transColumns =
      props.columns?.map((column, i) => {
        initialQueryData[column.id] = "";
        const columnType = column.columnProperties.columnType;
        const proColumn: ProColumns<Record<string, any>> = {
          ...column,
          fixed: column.sticky || false,
          hideInTable: column.isHidden,
          title: column.Header,
          ellipsis: !column.columnProperties.allowCellWrapping,
          dataIndex: column.id,
          valueType: columnType,
          // copyable: column.columnProperties.isCopyable,
          filters:
            props.isVisibleFilters && column.columnProperties.isFilterable,
          hideInSearch: !(
            props.isVisibleSearch && column.columnProperties.isVisibleCellSearch
          ),
          // 筛选时使用本地搜索
          onFilter: true,
        };
        if (columnType.includes("select")) {
          proColumn.valueEnum = {} as Record<string, { text: string }>;
          let selectOptions = column?.columnProperties?.selectOptions || [];
          if (
            typeof selectOptions == "string" &&
            (selectOptions as any)?.includes("[{")
          ) {
            try {
              selectOptions = JSON.parse(selectOptions);
            } catch (error) {
              selectOptions = [];
            }
          }
          selectOptions?.map &&
            selectOptions?.map((option: any) => {
              (proColumn.valueEnum as any)[option.value] = {
                text: option.label,
                ...option,
              };
            });
        }
        delete proColumn.sticky;
        return proColumn;
      }) || [];
    props?.onQueryDataChange(initialQueryData, true);

    return [...transColumns, getActionColumn(props)];
  }, [props.columns, props.columnActions]);

  // const columnActions = useMemo(() => {
  //   return getActionColumn(props);
  // }, [props.columnActions]);

  return (
    <div className="overflow-auto">
      <ProTable<any>
        actionRef={actionRef}
        cardBordered
        columns={tableColumns}
        columnsState={{
          persistenceKey: "pro-table-singe-demos",
          persistenceType: "localStorage",
          defaultValue: {
            option: { fixed: "right", disable: true },
          },
          onChange(value) {
            console.log("value: ", value);
          },
        }}
        dataSource={dataSource}
        dateFormatter="string"
        editable={{
          type: "multiple",
        }}
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === "get") {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        loading={props.isLoading}
        onReset={() => {
          setQueryData(initialQueryData);
          props?.onQueryDataChange(initialQueryData);
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
        pagination={
          props.isVisiblePagination
            ? {
                total: props.totalRecordsCount,
                pageSize: pageSize,
                showSizeChanger: true,
                current: pageNumber,
                onChange: (page: number, pageSize: number) => {
                  console.log(
                    "page: ",
                    page,
                    pageNumber,
                    props.serverSidePaginationEnabled,
                  );

                  if (page < pageNumber) {
                    console.log("page: 向前", page, pageNumber);

                    props.updatePageNo(page, EventType.ON_PREV_PAGE);
                  } else if (page > pageNumber) {
                    console.log("page: 向后", page, pageNumber);

                    props.updatePageNo(page, EventType.ON_NEXT_PAGE);
                  }
                  setPageNumber(page);
                  pageSize && setPageSize(pageSize);
                },
              }
            : false
        }
        request={async (params, sort, filter) => {
          // 初始 queryData

          return new Promise((resolve) => {
            props?.onQueryDataChange(params);

            return resolve({
              data: dataSource,
              success: true,
              total: props.totalRecordsCount || 0,
            });
          });
        }}
        rowKey={(record: any) => record[props.primaryColumnId || ""]}
        rowSelection={
          props.multiRowSelection
            ? {
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
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
        scroll={{ x: "100%" }}
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
                <a onClick={onCleanSelected} style={{ marginInlineStart: 8 }}>
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
    </div>
  );
};
