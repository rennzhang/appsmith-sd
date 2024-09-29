import type { ProColumns } from "@ant-design/pro-components";
import { DragSortTable } from "@ant-design/pro-components";
import { message } from "antd";
import { useState } from "react";
import { data as _data, columns as _columns } from "./mock";

const columns: any[] = [
  {
    title: "排序",
    dataIndex: "sort",
    width: 90,
    className: "drag-visible",
  },
  ..._columns,
];

export default () => {
  const [dataSource, setDataSource] = useState(_data);

  const handleDragSortEnd = (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: any,
  ) => {
    console.log("排序后的数据", newDataSource);
    setDataSource(newDataSource);
    message.success("修改列表排序成功");
  };

  return (
    <DragSortTable
      columns={columns}
      dragSortKey="sort"
      headerTitle="拖拽排序(默认把手)"
      onDragSortEnd={handleDragSortEnd}
      request={async () => ({
        data: dataSource,
        total: dataSource.length,
        success: true,
      })}
      rowKey="id"
    />
  );
};
