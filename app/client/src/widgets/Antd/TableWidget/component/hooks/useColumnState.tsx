import { useMemo } from "react";
import type { ProFieldValueType } from "@ant-design/pro-components";
import { type ProColumns } from "@ant-design/pro-components";
import type { TableColumnProps } from "widgets/Antd/TableWidget/component/Constants";
import type { Rule } from "antd/es/form";
import type { ColumnStateType } from "@ant-design/pro-table/es/typing";
import type { AntdTableProps, ButtonAction } from "../../constants";
import { ColumnTypes, TableInlineEditTypes } from "../../constants";
import { Switch } from "antd";
import styled from "styled-components";
import useButtonRender from "./useTableButtonRender";
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
    case "input":
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
      // case "percent":
      // case "second":
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
    // case "dateWeek":
    // case "dateMonth":
    // case "dateQuarter":
    // case "dateYear":
    // case "dateTime":
    // case "time":
    //   rules.push({
    //     type: "date",
    //     message: `请输入有效的${columnProperties.label}`,
    //   });
    //   break;

    // case "dateRange":
    // case "dateTimeRange":
    // case "timeRange":
    //   rules.push({
    //     type: "array",
    //     message: `请选择有效的${columnProperties.label}`,
    //   });
    //   break;

    case "select":
      // case "cascader":
      // case "treeSelect":
      // 这些类型通常由组件本身处理验证，但我们可以添加自定义验证如果需要
      break;

    case "checkbox":
    case "radio":
    case "switch":
      // 这些类型通常不需要额外的验证规则
      break;

    // case "rate":
    //   rules.push({
    //     type: "number",
    //     min: 0,
    //     max: 5, // 假设最大值为5，可以根据实际情况调整
    //     message: `请选择有效的评分`,
    //   });
    //   break;

    // case "slider":
    //   rules.push({
    //     type: "number",
    //     min: validation?.min,
    //     max: validation?.max,
    //     message: `${columnProperties.label}必须在${validation?.min || 0}到${
    //       validation?.max || 100
    //     }之间`,
    //   });
    //   break;

    case "image":
      // 可以添加文件类型验证如果需要
      break;

    case "color":
      rules.push({
        pattern: /^#([0-9A-F]{3}){1,2}$/i,
        message: `请输入有效的颜色值`,
      });
      break;

    // case "code":
    // case "jsonCode":
    //   // 这些类型可能需要特定的验证逻辑，这里只提供基本的必填控制
    //   break;

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
  const {
    columnType,
    computedValue = [],
    labelKey,
    options,
    valueKey,
  } = columnProperties || {};

  if (
    [
      ColumnTypes.NUMBER,
      ColumnTypes.TEXT,
      ColumnTypes.TEXTAREA,
      ColumnTypes.MONEY,
      ColumnTypes.PASSWORD,
      ColumnTypes.IMAGE,
    ].includes(columnType)
  ) {
    return undefined;
  }
  let _options = options || [];
  // 如果不需要显示筛选或没有选项，则返回 undefined
  if (!options || options.length === 0) {
    _options = (computedValue || [])?.map((c) => ({
      label: String(c),
      value: c,
    }));
  }

  const valueEnum: Record<string, any> = {};
  _options.forEach((option: any) => {
    const value = option[valueKey || "value"] || option.value;
    const label = option[labelKey || "label"] || option.label;
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
const { getTableButtonRender } = useButtonRender();
const getActionColumn = (props: AntdTableProps): ProColumns => {
  console.group("表格 getActionColumn");
  console.log("props", props);
  console.groupEnd();

  return {
    title: "操作",
    valueType: "option",
    key: "operation",
    fixed: "right",
    width: props.actionWidth || 120,
    render: (text, record, recordIndex, tableAction, ...rest) => {
      // console.log("antd 表格 operation", {
      //   text,
      //   record,
      //   recordIndex,
      //   tableAction,
      //   rest,
      // });

      return getTableButtonRender(props.columnActions, (menuItem) =>
        handleButtonClick(menuItem, props, record, recordIndex, tableAction),
      );
    },
  };
};

const handleButtonClick = (
  button: ButtonAction,
  props: AntdTableProps,
  record: any,
  recordIndex: number,
  action?: any,
) => {
  const { editableColumn, tableInlineEditType } = props;

  console.log("handleButtonClick", {
    button,
    props,
    record,
    recordIndex,
    action,
    tableInlineEditType,
    editableColumn,
  });

  const isInlineEditing =
    tableInlineEditType === TableInlineEditTypes.ROW_LEVEL;

  if (button.id === "edit" && isInlineEditing && editableColumn?.length) {
    action?.startEditable?.(record.id);
  } else {
    props.handleRowBtnClick(button.onBtnClick, record);
  }
};
const getDisplayText = (index: number, displayText?: string | string[]) => {
  if (Array.isArray(displayText)) {
    return displayText?.[index];
  }
  return displayText;
};

const CellWrapper = styled.div`
  display: flex;
  align-items: center;
  .ant-image {
    width: 100%;
    height: auto;
  }
`;
const getColumnRender = (
  column: TableColumnProps,
  props: AntdTableProps,
): ProColumns["render"] => {
  return (dom, record, index, action, schema) => {
    // console.log("antd table column render", {
    //   dom,
    //   record,
    //   index,
    //   action,
    //   schema,
    // });
    const valueType = schema.valueType;
    const value = record[column.id];

    const onUrlOrImgClick = () => {
      props?.handleUrlOrImgClick(column, record);
    };

    const handleCellDomClick = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log("handleCellDomClick", {
        dom,
        record,
        index,
        action,
        schema,
      });
      if (props.handleRowClick) {
        props.handleRowClick(record, index);
      }
    };
    switch (valueType as ProFieldValueType & ColumnTypes) {
      case ColumnTypes.SWITCH:
        return (
          <Switch
            checked={record[column.id]}
            onChange={(checked) => {
              props.handleSwitchValueChange(
                column,
                record,
                checked,
                column.alias,
                index,
              );
            }}
          />
        );
      case ColumnTypes.URL:
        return (
          <a
            href={value}
            onClick={onUrlOrImgClick}
            rel="noreferrer"
            target="_blank"
          >
            {getDisplayText(index, column.columnProperties.displayText) ||
              value}
          </a>
        );
      default:
        return (
          <CellWrapper
            className="protable-cell-wrapper"
            onClick={handleCellDomClick}
          >
            {dom}
          </CellWrapper>
        );
    }
  };
};

const getFieldProps = (column: TableColumnProps, props: AntdTableProps) => {
  const fieldProps: ProColumns<Record<string, any>>["fieldProps"] = {
    ...column.columnProperties,
    fieldNames: {
      label: column.columnProperties.labelKey || "label",
      value: column.columnProperties.valueKey || "value",
      children: column.columnProperties.childrenKey || "children",
      key: column.columnProperties.valueKey || "key",
      title: column.columnProperties.labelKey || "label",
    },
    onChange: (e, ...rest: any[]) => {
      const val = e?.target?.value || e;
      props?.handleCellTextChange(val, column.alias, column);
    },
    options: column.columnProperties.options?.map((option: any) => {
      return {
        label: option[column.columnProperties.labelKey || ""] || option.label,
        value: option[column.columnProperties.valueKey || ""] || option.value,
        ...option,
      };
    }),
  };

  switch (column.columnProperties.columnType) {
    case ColumnTypes.TEXTAREA:
      delete fieldProps.options;
      break;
    case ColumnTypes.DATE:
      fieldProps.format = column.columnProperties.outputFormat;
      break;
    case ColumnTypes.IMAGE:
      fieldProps.width = "auto";
      fieldProps.height = column.columnProperties.imageHeight;
      fieldProps.onClick = () => props?.handleUrlOrImgClick(column);
      break;
    default:
      break;
  }
  if (column.columnProperties.columnType === ColumnTypes.DATE) {
    fieldProps.format = column.columnProperties.outputFormat;
  }

  delete fieldProps.insideSidebar;

  return fieldProps;
};

export const useColumnState = (
  props: AntdTableProps,
  setter: {
    setInitialQueryData: (data: Record<string, any>) => void;
  },
) => {
  const { setInitialQueryData } = setter;
  const initialQueryData: Record<string, any> = {};
  const actionColumn = useMemo(
    () => getActionColumn(props),
    [
      props.columnActions,
      props.actionWidth,
      props.primaryColumns,
      props.columns,
      props.tableInlineEditType,
    ],
  );
  const tableColumns = useMemo(() => {
    const renderColumns = props.columns.filter((column) => {
      return column.alias !== "actions" && column.alias !== "children";
    });
    const transColumns =
      renderColumns?.map((column: TableColumnProps, i: number) => {
        initialQueryData[column.id] = "";
        const columnType = column.columnProperties
          .columnType as ProFieldValueType;
        const proColumn: ProColumns<Record<string, any>> & TableColumnProps = {
          ...column,
          id: column.id!,
          width: column.columnProperties.columnWidth || 120,
          editable: () => column.columnProperties.isCellEditable,
          fixed: column.sticky || false,
          hideInTable: column.isHidden,
          render: getColumnRender(column, props),
          title: column.Header,
          dataIndex: column.id,
          ellipsis:
            !props.isVirtual && !column.columnProperties.allowCellWrapping,
          valueType: columnType,
          formItemProps: {
            rules: getRules(column),
          },
          valueEnum: getValueEnum(column),
          fieldProps: getFieldProps(column, props),
          copyable: column.columnProperties.isCellCopyable,
          filters: column.columnProperties.isVisibleCellFilters,
          onFilter: true,
          hideInSearch: !(
            props.isVisibleSearch && column.columnProperties.isVisibleCellSearch
          ),
        };
        delete proColumn.sticky;

        return proColumn;
      }) || [];
    setInitialQueryData(initialQueryData);
    props?.onQueryDataChange(initialQueryData, true);

    return [...transColumns, actionColumn];
  }, [props.columns, props.isVirtual, props.handleRowClick, actionColumn]);

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
        console.log("表格columnsState change: ", value);
      },
    };
  }, [props.widgetId]);

  return {
    columnsState,
    actionColumn,
    tableColumns,
    initialQueryData,
  };
};
