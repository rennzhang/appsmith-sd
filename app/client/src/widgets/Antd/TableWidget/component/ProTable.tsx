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
import type { TableColumnProps } from "widgets/Antd/TableWidget/component/Constants";
import type { CompactMode, ReactTableColumnProps } from "./Constants";
import type { AntdTableProps } from "../constants";
import {
  ColumnTypes,
  type ButtonAction,
  InlineEditingSaveOptions,
} from "../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Alignment } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
// ColumnStateType
import type { ColumnStateType } from "@ant-design/pro-table/es/typing";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
import { type } from "@testing-library/user-event/dist/type";
import type { Rule } from "antd/es/form";

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
    key: "operation",
    fixed: "right",
    width: props.actionWidth || 120,
    render: (text, record, recordIndex, action, ...rest) => {
      console.log("antd 表格 operation", {
        text,
        record,
        recordIndex,
        action,
        rest,
      });

      return [
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
                        <IconRenderer
                          className="mr-1"
                          color={c.iconColor || "currentColor"}
                          icon={c.iconName}
                          size={14}
                        />
                      ) : null}
                      <span
                        onClick={() =>
                          props.columnActionClick(
                            c.onClick,
                            record,
                            recordIndex,
                          )
                        }
                      >
                        {c.label}
                      </span>
                      {c.iconAlign == Alignment.RIGHT && c.iconName ? (
                        <IconRenderer
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
                if (button.id === "edit") {
                  if (
                    props.inlineEditingSaveOption ===
                    InlineEditingSaveOptions.ROW_LEVEL
                  ) {
                    action?.startEditable?.(record.id);
                  }
                }
                props.columnActionClick(button.onBtnClick, record, recordIndex);
              }}
              placement="CENTER"
              popconfirmMessage={button.popconfirmMessage}
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
      ];
    },
  };
};
const getRules = (column: TableColumnProps) => {
  const { columnProperties } = column;
  const { validation } = columnProperties;
  const rules: Rule[] = [];

  const getErrorMessage = (defaultMessage: string) =>
    validation?.errorMessage || defaultMessage;

  // 通用的必填规则
  if (validation?.isColumnEditableCellRequired) {
    rules.push({
      required: true,
      message: getErrorMessage(`${columnProperties.label}是必填项`),
    });
  }

  // 根据不同的 columnType 添加特定的规则
  switch (columnProperties.columnType) {
    case "text":
    case "password":
    case "textarea":
      rules.push({
        type: "string",
        min: validation?.min,
        max: validation?.max,
        message: `${columnProperties.label}的长度必须在${
          validation?.min || 0
        }到${validation?.max || "+∞"}之间`,
      });
      break;

    case "digit":
    case "percent":
    case "second":
      rules.push({
        type: "number",
        min: validation?.min,
        max: validation?.max,
        message: `${columnProperties.label}必须在${validation?.min || "-∞"}到${
          validation?.max || "+∞"
        }之间`,
      });
      break;

    case "money":
      rules.push({
        pattern: /^\d+(\.\d{1,2})?$/,
        message: `请输入有效的金额`,
      });
      break;

    case "date":
    case "dateWeek":
    case "dateMonth":
    case "dateQuarter":
    case "dateYear":
    case "dateTime":
    case "time":
      rules.push({
        type: "date",
        message: `请输入有效的${columnProperties.label}`,
      });
      break;

    case "dateRange":
    case "dateTimeRange":
    case "timeRange":
      rules.push({
        type: "array",
        message: `请选择有效的${columnProperties.label}`,
      });
      break;

    case "select":
    case "cascader":
    case "treeSelect":
      // 这些类型通常由组件本身处理验证，但我们可以添加自定义验证如果需要
      break;

    case "checkbox":
    case "radio":
    case "switch":
      // 这些类型通常不需要额外的验证规则
      break;

    case "rate":
      rules.push({
        type: "number",
        min: 0,
        max: 5, // 假设最大值为5，可以根据实际情况调整
        message: `请选择有效的评分`,
      });
      break;

    case "slider":
      rules.push({
        type: "number",
        min: validation?.min,
        max: validation?.max,
        message: `${columnProperties.label}必须在${validation?.min || 0}到${
          validation?.max || 100
        }之间`,
      });
      break;

    case "image":
      // 可以添加文件类型验证如果需要
      break;

    case "color":
      rules.push({
        pattern: /^#([0-9A-F]{3}){1,2}$/i,
        message: `请输入有效的颜色值`,
      });
      break;

    case "code":
    case "jsonCode":
      // 这些类型可能需要特定的验证逻辑，这里只提供基本的必填控制
      break;

    // 对于其他不常见或复杂的类型，我们只提供基本的必填控制
    default:
      // 基本的必填控制已经在函数开始处添加，这里不需要额外操作
      break;
  }

  // 如果提供了正则表达式，添加正则验证
  if (validation?.regex) {
    rules.push({
      pattern: new RegExp(validation?.regex),
      message: getErrorMessage(`${columnProperties.label}不符合指定格式`),
    });
  }

  // 如果外部验证失败，添加自定义验证器
  if (validation?.isEditableCellValid === false) {
    rules.push({
      validator: () =>
        Promise.reject(
          new Error(getErrorMessage(`${columnProperties.label}不符合验证规则`)),
        ),
    });
  }

  return rules;
};

const getValueEnum = (column: TableColumnProps) => {
  const { columnProperties } = column;
  const { fieldNames, options } = columnProperties;

  // 如果不需要显示筛选或没有选项，则返回 undefined
  if (!options || options.length === 0) return undefined;

  const valueEnum: Record<string, any> = {};
  options.forEach((option: any) => {
    const value = option[fieldNames?.value || "value"];
    const label = option[fieldNames?.label || "label"];
    if (value !== undefined && label !== undefined) {
      valueEnum[value] = {
        text: label,
        ...option,
      };
    }
  });

  console.log("表格 getValueEnum valueEnum", valueEnum);
  return valueEnum;
};

export default React.forwardRef((props: AntdTableProps, scrollBarRef: any) => {
  const actionRef = useRef<ActionType>();
  // queryData
  const [queryData, setQueryData] = React.useState({ ...props.queryData });
  const [pageNumber, setPageNumber] = React.useState(props.pageNo || 1);
  const [pageSize, setPageSize] = React.useState(props.pageSize || 10);
  const [dataSource, setDataSource] = React.useState(props.tableData || []);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  useEffect(() => {
    setPageNumber(props.pageNo || 1);
    setPageSize(props.pageSize || 10);
  }, [props.pageNo, props.pageSize]);

  useEffect(() => {
    console.log(" props.tableData", props.tableData);
    setDataSource(props.tableData || []);
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
          editable: () => column.columnProperties.isCellEditable,
          fixed: column.sticky || false,
          hideInTable: column.isHidden,
          title: column.Header,
          ellipsis: !column.columnProperties.allowCellWrapping,
          dataIndex: column.id,
          valueType: columnType,
          formItemProps: {
            rules: getRules(column),
          },
          valueEnum: getValueEnum(column),
          fieldProps: {
            ...column.columnProperties,
            options: column.columnProperties.options?.map((option: any) => {
              // fieldNames
              return {
                label:
                  option[column.columnProperties.fieldNames?.label || ""] ||
                  option.label,
                value:
                  option[column.columnProperties.fieldNames?.value || ""] ||
                  option.value,
                ...option,
              };
            }),
          },
          copyable: column.columnProperties.isCellCopyable,
          filters: column.columnProperties.isVisibleCellFilters,
          // 筛选时使用本地搜索
          onFilter: true,
          hideInSearch: !(
            props.isVisibleSearch && column.columnProperties.isVisibleCellSearch
          ),
        };
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
  console.group("Antd 表格 Table Protable  444");
  console.log("表格 props", props);
  console.log("表格 tableColumns", tableColumns);
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

  const editableMemo = useMemo((): ProTableProps<any, any>["editable"] => {
    if (props.inlineEditingSaveOption === InlineEditingSaveOptions.ROW_LEVEL) {
      const sortedButtons = Object.values(props.editingActions)
        .sort((a, b) => a.index - b.index)
        .filter((c) => c.showButton);

      const saveButton = sortedButtons.find((b) => b.id === "save")!;
      const cancelButton = sortedButtons.find((b) => b.id === "cancel")!;
      const deleteButton = sortedButtons.find((b) => b.id === "delete")!;
      return {
        type: "multiple",
        deletePopconfirmMessage: "确定删除吗？",
        saveText: (
          <ButtonComponent
            buttonColor={saveButton.buttonColor || Colors.AZURE_RADIANCE}
            buttonSize="sm"
            buttonVariant="TERTIARY"
            configToken={{ paddingInline: 0, controlHeight: 22 }}
            iconAlign={saveButton.iconAlign}
            iconName={
              saveButton.columnType == ColumnTypes.BUTTON
                ? saveButton.iconName
                : saveButton.btnIconName
            }
            text={
              saveButton.columnType == ColumnTypes.ICON_BUTTON
                ? ""
                : saveButton.buttonLabel
            }
            widgetId={saveButton.widgetId}
          />
        ),
        cancelText: (
          <ButtonComponent
            buttonColor={cancelButton.buttonColor || Colors.AZURE_RADIANCE}
            buttonSize="sm"
            buttonVariant="TERTIARY"
            configToken={{ paddingInline: 0, controlHeight: 22 }}
            iconAlign={cancelButton.iconAlign}
            iconName={
              cancelButton.columnType == ColumnTypes.BUTTON
                ? cancelButton.iconName
                : cancelButton.btnIconName
            }
            text={
              cancelButton.columnType == ColumnTypes.ICON_BUTTON
                ? ""
                : cancelButton.buttonLabel
            }
            widgetId={cancelButton.widgetId}
          />
        ),
        deleteText: (
          <ButtonComponent
            buttonColor={deleteButton.buttonColor || Colors.AZURE_RADIANCE}
            buttonSize="sm"
            buttonVariant="TERTIARY"
            configToken={{ paddingInline: 0, controlHeight: 22 }}
            iconAlign={deleteButton.iconAlign}
            iconName={
              deleteButton.columnType == ColumnTypes.BUTTON
                ? deleteButton.iconName
                : deleteButton.btnIconName
            }
            text={
              deleteButton.columnType == ColumnTypes.ICON_BUTTON
                ? ""
                : deleteButton.buttonLabel
            }
            widgetId={deleteButton.widgetId}
          />
        ),
        onSave: async (key, row, originRow, newLine) => {
          if (saveButton) {
            await props.columnActionClick(saveButton.onBtnClick, row, 0);
          }
          // 这里可以添加默认的保存逻辑
        },
        onCancel: async (key, row, originRow, newLine) => {
          if (cancelButton) {
            await props.columnActionClick(cancelButton.onBtnClick, row, 0);
          }
          // 这里可以添加默认的取消逻辑
        },
        onDelete: async (key, row) => {
          if (deleteButton) {
            await props.columnActionClick(deleteButton.onBtnClick, row, 0);
          }
          // 这里可以添加默认的删除逻辑
        },
      };
    }
    return undefined;
  }, [props.inlineEditingSaveOption, props.editingActions]);
  return (
    <div className="overflow-auto" ref={scrollBarRef}>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              borderRadius: (props.borderRadius as unknown as number) || 0,
              fontSize: (props.textSize as unknown as number) || 0,
              // colorBgContainer: props.tableBackground,
              headerBorderRadius:
                (props.headerBorderRadius as unknown as number) || 0,
            },
          },
        }}
      >
        <ProTable<any>
          actionRef={actionRef}
          cardBordered={{
            search: props.cardBorderedSearch,
            table: props.cardBorderedTable,
          }}
          columns={[...tableColumns, actionColumnMemo]}
          columnsState={columnsState}
          dataSource={dataSource}
          dateFormatter="string"
          defaultSize={props.compactMode}
          editable={editableMemo}
          expandable={{
            childrenColumnName: props.childrenColumnName,
            onExpand: props.onExpand,
            expandRowByClick: props.expandRowByClick,
          }}
          form={{
            ignoreRules: !props.enableSearchFormValidation,
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
                  defaultPageSize: 10,
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
                data: dataSource || [],
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
      </ConfigProvider>
    </div>
  );
});
