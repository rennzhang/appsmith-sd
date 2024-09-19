import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ActionType } from "@ant-design/pro-components";
import type { AntdTableProps } from "../../constants";

export const useNewRowState = (
  props: AntdTableProps,
  actionRef: React.RefObject<ActionType>,
) => {
  const addNewRowBtn = props.allowAddNewRow ? (
    <Button
      icon={<PlusOutlined />}
      key="button"
      onClick={() => {
        const newId = Date.now();
        props.handleAddNewRow(newId);
        actionRef.current?.addEditRecord(
          {
            id: newId,
            ...props.defaultNewRow,
            // 其他默认字段
          },
          {
            newRecordType: "cache",
            position: props.addNewRowPosition,
          },
        );
      }}
      type="primary"
    >
      {props.addNewRowText || "新增"}
    </Button>
  ) : null;

  return {
    addNewRowBtn,
  };
};
