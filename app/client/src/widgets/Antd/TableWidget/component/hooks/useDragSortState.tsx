import type { DragTableProps } from "@ant-design/pro-components";
import { useCallback, useMemo, useState } from "react";
import type { AntdTableProps } from "../../constants";
import { message } from "antd";

export const useDragSortState = (
  props: AntdTableProps,
  dataSource: any,
  setDataSource: any,
) => {
  const isDragSortType = props.tableType === "dragSort";

  const onDragSortEnd = useCallback(
    (beforeIndex: number, afterIndex: number, newDataSource: any) => {
      console.log("antd 表格 排序 排序后的数据", {
        newDataSource,
        dataSource,
        beforeIndex,
        afterIndex,
      });
      setDataSource(newDataSource);
      props.handleDragSortEnd?.(beforeIndex, afterIndex, newDataSource);
      message.success("修改列表排序成功");
    },
    [setDataSource],
  );

  const dragSortProps = useMemo<DragTableProps<any, any>>(
    () =>
      isDragSortType
        ? {
            rowKey: props.primaryColumnId,
            dragSortKey: "sort",
            onDragSortEnd: onDragSortEnd,
            onChange: (pagination, filters, sorter, extra) => {
              console.log(
                "antd 表格 排序 dragSortProps onChange",
                pagination,
                filters,
                sorter,
                extra,
              );
            },
          }
        : {},
    [isDragSortType, props.primaryColumnId, onDragSortEnd],
  );
  return {
    isDragSortType,
    dragSortProps,
  };
};
