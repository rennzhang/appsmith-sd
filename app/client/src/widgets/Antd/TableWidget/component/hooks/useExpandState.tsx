import type { Key } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { AntdTableProps } from "../../constants";
import type { ExpandableConfig } from "antd/es/table/interface";

export function useExpandState(props: AntdTableProps) {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    () => props.defaultExpandedRowKeys || [],
  );

  useEffect(() => {
    if (props.expandedKeys) {
      setExpandedKeys(props.expandedKeys);
    }
  }, [props.expandedKeys]);

  const onExpand = useCallback(
    (expanded: boolean, record: any) => {
      props.onExpand?.(expanded, record);
    },
    [props.onExpand],
  );

  const onExpandedRowsChange: ExpandableConfig<any>["onExpandedRowsChange"] =
    useCallback(
      (expandedRows) => {
        setExpandedKeys(expandedRows);
        props.onExpandedRowsChange?.(expandedRows);
      },
      [props.onExpandedRowsChange],
    );

  const expandable = useMemo(
    (): ExpandableConfig<any> => ({
      defaultExpandAllRows: props.defaultExpandAllRows,
      expandedRowKeys: props.defaultExpandAllRows ? undefined : expandedKeys,
      childrenColumnName: props.childrenColumnName,
      onExpand,
      expandRowByClick: props.expandRowByClick,
      onExpandedRowsChange,
    }),
    [
      props.defaultExpandAllRows,
      props.defaultExpandedRowKeys,
      expandedKeys,
      props.childrenColumnName,
      onExpand,
      props.expandRowByClick,
      onExpandedRowsChange,
    ],
  );

  return { expandable };
}
