import type { ProTableProps } from "@ant-design/pro-components";
import { Space } from "antd";
import React from "react";
import { useState, useCallback } from "react";
import useButtonRender from "./useTableButtonRender";
import type { AntdTableProps } from "../../constants";
const { getTableButtonRender } = useButtonRender();

export function useTableAlertState(props: AntdTableProps) {
  const tableAlertRender: ProTableProps<any, any>["tableAlertRender"] = ({
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
  };

  // useMemo props.configProviderTheme

  const tableAlertOptionRender: ProTableProps<
    any,
    any
  >["tableAlertOptionRender"] = () => {
    return (
      <Space size={12}>
        {getTableButtonRender(props.rowSelectionActions, (action) => {
          props?.handleAlertBtnClick(action.onBtnClick);
        })}
      </Space>
    );
  };

  return {
    tableAlertRender,
    tableAlertOptionRender,
  };
}
