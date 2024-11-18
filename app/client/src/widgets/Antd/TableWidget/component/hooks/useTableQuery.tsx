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
    column: undefined as any,
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
  const [pageNo, setPageNo] = useState(props.pageNo);
  const [pageSize, setPageSize] = useState(props.pageSize);

  // useEffect(() => {
  //   setPageNo(props.pageNo);
  //   setPageSize(props.pageSize);
  // }, [props.pageNo, props.pageSize]);

  const { tableData, totalRecordsCount } = props;

  const handlePageChange = (page: number, pageSize: number) => {
    console.log("page: ", page, pageNo, props.serverSidePaginationEnabled);
    setPageNo(page);
    setPageSize(pageSize);
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
    const resetQueryData = {
      pageNo: props.pageNo,
      pageSize: props.pageSize,
    };

    setQueryData(resetQueryData);
    props?.handleQueryDataChange(resetQueryData);
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
    props.handleQueryDataChange(params, true);
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
    if (extra.action === "sort") {
      // if (!props.isRemoteSort) {
      //   setDataSource(extra.currentDataSource);
      // }

      if (sorter && !Array.isArray(sorter)) {
        const _sortInfo = {
          sortField: sorter.field as Key,
          sortOrder: sorter.order,
          column: sorter.column,
        };

        setSortInfo(_sortInfo);
        props.handleColumnSorting(_sortInfo);
      }
    }

    console.log("antd 表格 onChange 排序 dragSortProps ", {
      pagination,
      filters,
      sorter,
      extra,
      sortInfo,
    });
  };

  const form = useMemo<ProTableProps<any, any>["form"]>(() => {
    return {
      // onFieldsChange: (changedFields, allFields) => {
      //   console.log("Antd 表格 form onFieldsChange", {
      //     changedFields,
      //     allFields,
      //   });
      // },
      // 表格表单数据变化
      onValuesChange: (changedValues, allValues) => {
        console.log("Antd 表格 form onValuesChange", {
          changedValues,
          allValues,
        });
      },
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
          pageSize: pageSize || props.defaultPageSize || 10,
          showSizeChanger: props.showSizeChanger,

          current: pageNo,
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
    props.defaultPageSize,
    props.showSizeChanger,
    props.paginationDisabled,
    props.showQuickJumper,
    props.simplePagination,
    props.paginationSize,
    pageNo,
    pageSize,
  ]);

  return {
    pageNo,
    pageSize,
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
