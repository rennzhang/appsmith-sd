import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { AntdTableProps } from "../../constants";
import type { TableProps } from "antd";
import type { ProTableProps } from "@ant-design/pro-components";
import type { SorterResult, SortOrder, Key } from "antd/es/table/interface";

export const useTableQuery = (props: AntdTableProps) => {
  // sortState
  const [sortInfo, setSortInfo] = useState({
    sortField: undefined as Key | undefined,
    sortOrder: undefined as SortOrder | undefined,
  });
  const [dataSource, setDataSource] = useState(props.tableData);
  useEffect(() => {
    setDataSource(props.tableData);
  }, [props.tableData]);

  const [queryData, setQueryData] = useState({ ...props.queryData });
  // initialQueryData
  const [initialQueryData, setInitialQueryData] = useState({
    ...props.queryData,
  });
  const { pageNo, pageSize, tableData, totalRecordsCount } = props;

  const handlePageChange = (page: number, pageSize: number) => {
    console.log("page: ", page, pageNo, props.serverSidePaginationEnabled);

    if (page < pageNo) {
      console.log("page: 向前", page, pageNo);
      props.updatePageNo(page, EventType.ON_PREV_PAGE);
    } else if (page > pageNo) {
      console.log("page: 向后", page, pageNo);
      props.updatePageNo(page, EventType.ON_NEXT_PAGE);
    }

    props.updatePageSize(pageSize);
  };

  const habdleReset: ProTableProps<any, any>["onReset"] = () => {
    console.log("Antd 表格 habdleReset", {
      initialQueryData,
      props,
    });

    setQueryData(initialQueryData);
    props?.onQueryDataChange(initialQueryData);
  };

  const handleRequest = async (params: any, sort: any, filter: any) => {
    console.log("Antd 表格 handleRequest", {
      params,
      initialQueryData,
      props,
      sort,
      filter,
      dataSource,
    });

    setQueryData(params);
    console.log("antd 表格 dataSource request", dataSource);

    return {
      data: dataSource || [],
      success: true,
      total: props.totalRecordsCount || 0,
    };
  };

  const onChange: ProTableProps<any, any>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    if (extra.action === "sort" && !props.isRemoteSort) {
      setDataSource(extra.currentDataSource);
    }

    if (sorter && !Array.isArray(sorter)) {
      setSortInfo({
        sortField: sorter.field as Key,
        sortOrder: sorter.order,
      });
    }

    console.log("antd 表格 onChange 排序 dragSortProps ", {
      pagination,
      filters,
      sorter,
      extra,
    });
  };

  const form = useMemo<ProTableProps<any, any>["form"]>(() => {
    return {
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
    };
  }, [props.enableSearchFormValidation]);

  const pagination = useMemo<TableProps<any>["pagination"]>(() => {
    return props.isVisiblePagination
      ? {
          defaultPageSize: props.defaultPageSize,
          total: props.totalRecordsCount,
          pageSize: props.pageSize || props.defaultPageSize || 10,
          showSizeChanger: props.showSizeChanger,

          current: props.pageNo,
          onChange: handlePageChange,
          disabled: props.paginationDisabled,
          // showQuickJumper: true,
          showQuickJumper: props.showQuickJumper,
          simple: props.simplePagination,
          size: props.paginationSize,
          hideOnSinglePage: props.hideOnSinglePage,
        }
      : false;
  }, [
    dataSource,
    props.isVisiblePagination,
    props.totalRecordsCount,
    props.pageSize,
    props.pageNo,
    props.defaultPageSize,
    props.showSizeChanger,
    props.paginationDisabled,
    props.showQuickJumper,
    props.simplePagination,
    props.paginationSize,
  ]);

  return {
    sortInfo,
    onChange,
    dataSource,
    setDataSource,
    form,
    pagination,
    queryData,
    habdleReset,
    setQueryData,
    handlePageChange,
    handleRequest,
    setInitialQueryData,
  };
};
