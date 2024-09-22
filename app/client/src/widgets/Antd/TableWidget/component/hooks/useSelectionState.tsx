import { useState, useEffect, useMemo } from "react";
import type { TableRowSelection } from "antd/es/table/interface";
import type { AntdTableProps, TableWidgetProps } from "../../constants";
import { Table } from "antd";

export function useSelectionState(props: AntdTableProps) {
  const {
    allowRowSelection,
    handleRowSelect,
    handleRowSelectionChange,
    hideSelectAll,
    preserveSelectedRowKeys,
    primaryColumnId,
    rowSelectionFixed,
    rowSelectionType,
    selectionColumnWidth,
    tableData,
  } = props;
  console.group("Antd 表格 useSelectionState ");
  console.log("props", props);
  console.groupEnd();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (props.selectedRowKeys && Array.isArray(props.selectedRowKeys)) {
      setSelectedRowKeys(props.selectedRowKeys);
    }
  }, [props.selectedRowKeys, tableData]);

  const rowSelection = useMemo<TableRowSelection<any> | undefined>(() => {
    if (!allowRowSelection) return undefined;

    return {
      type: rowSelectionType,
      selectedRowKeys,
      preserveSelectedRowKeys,
      hideSelectAll,
      fixed: rowSelectionFixed,
      // checkStrictly: true,
      selections: [
        Table.SELECTION_ALL,
        Table.SELECTION_INVERT,
        Table.SELECTION_NONE,
        Table.SELECTION_COLUMN,
      ],
      columnWidth: selectionColumnWidth || 60,
      onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        console.log(`Antd 表格 useSelectionState onChange`, {
          selectedRowKeys,
          selectedRows,
          props,
        });
        setSelectedRowKeys(selectedRowKeys);
        handleRowSelectionChange?.(selectedRowKeys, selectedRows);
      },
      onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
        console.log(`Antd 表格 useSelectionState handleRowSelect`, {
          record,
          selected,
          selectedRows,
          props,
        });
        handleRowSelect?.(record, selected, selectedRows);
      },
      getCheckboxProps: (record: any) => ({
        disabled: record.disabled,
      }),
    };
  }, [
    allowRowSelection,
    rowSelectionType,
    selectedRowKeys,
    preserveSelectedRowKeys,
    hideSelectAll,
    rowSelectionFixed,
    handleRowSelectionChange,
    handleRowSelect,
    selectionColumnWidth,
  ]);

  return {
    rowSelection,
    selectedRowKeys,
  };
}
