import type {
  ActionType,
  ProColumns,
  ProTableProps,
} from "@ant-design/pro-components";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { ConfigProvider, Space, Table } from "antd";
import { useEffect, useMemo, useRef } from "react";
import React from "react";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Colors } from "constants/Colors";

import type { CompactMode, ReactTableColumnProps } from "./Constants";
import type { AntdTableProps } from "../constants";
import { ColumnTypes, type ButtonAction } from "../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Alignment } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
// ColumnStateType
import type { ColumnStateType } from "@ant-design/pro-table/es/typing";

// import request from "umi-request";

const getActionColumn = (props: AntdTableProps): ProColumns => {
  // console.clear();
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
    width: props.actionWidth || 120,
    render: (text, record, recordIndex, action) => [
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
                        size={14}
                      />
                    ) : null}
                    <span
                      onClick={() =>
                        props.columnActionClick(c.onClick, recordIndex)
                      }
                    >
                      {c.label}
                    </span>
                    {c.iconAlign == Alignment.RIGHT && c.iconName ? (
                      <Icon
                        className="ml-1"
                        color={c.iconColor || "currentColor"}
                        icon={c.iconName}
                        size={14}
                      />
                    ) : null}
                  </div>
                ),
              }))}
            style={{
              color: button.buttonColor,
            }}
          >
            <ButtonComponent
              buttonColor={button.buttonColor || Colors.AZURE_RADIANCE}
              buttonSize="sm"
              buttonVariant={"TERTIARY"}
              configToken={{
                paddingInline: 0,
                controlHeight: 22,
              }}
              iconAlign={button.iconAlign}
              iconName={button.menuIconName}
              iconSize={14}
              isDisabled={button.isDisabled}
              key={button.id}
              placement="CENTER"
              text={button.menuButtonLabel}
              tooltip={button.menuTooltip}
              widgetId={button.widgetId}
            />
          </TableDropdown>
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
              props.columnActionClick(button.onBtnClick, recordIndex);
            }}
            placement="CENTER"
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

export default (props: AntdTableProps) => {
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

    return [...transColumns];
  }, [props.columns]);

  const actionColumnMemo = useMemo(
    () => getActionColumn(props),
    [props.columnActions, props.actionWidth],
  );
  console.group("表格 protable");
  console.log("表格 props", props);
  console.groupEnd();

  // const columnActions = useMemo(() => {
  //   return getActionColumn(props);
  // }, [props.columnActions]);

  const columnsState = useMemo((): ColumnStateType => {
    return {
      persistenceKey: "pro-table-singe-demos_" + props.widgetId,
      persistenceType: "localStorage",
      defaultValue: {
        option: {
          fixed: "right",
          disable: true,
        },
      },
      onChange(value) {
        console.log("value: ", value);
      },
    };
  }, [props.widgetId]);

  return (
    <div className="overflow-auto">
      <ProTable<any>
        actionRef={actionRef}
        cardBordered
        columns={[...tableColumns, actionColumnMemo]}
        columnsState={columnsState}
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
