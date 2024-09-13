import { useCallback, memo } from "react";
import AntdProTable from "./Table";
import equal from "fast-deep-equal/es6";
import type { AntdTableProps } from "../constants";

interface ReactTableComponentProps extends AntdTableProps {
  allowRowSelection: boolean;
  onRowClick: (rowData: Record<string, unknown>, rowIndex: number) => void;
}

function ReactTableComponent(props: ReactTableComponentProps) {
  const { allowRowSelection, onRowClick } = props;

  const selectTableRow = useCallback(
    (row: { original: Record<string, unknown>; index: number }) => {
      if (allowRowSelection) {
        onRowClick(row.original, row.index);
      }
    },
    [allowRowSelection, onRowClick],
  );

  return <AntdProTable {...props} selectTableRow={selectTableRow} />;
}

function arePropsEqual(
  prevProps: ReactTableComponentProps,
  nextProps: ReactTableComponentProps,
) {
  // 比较关键属性
  const keyProps: (keyof ReactTableComponentProps)[] = [
    "onCheckChange",
    "isVisibleCellSetting",
    "isVisibleRefresh",
    "isVisibleFullScreen",
    "isVisibleSearch",
    "isVirtual",
    "multiRowSelection",
    "hideOnSinglePage",
    "paginationSize",
    "showSizeChanger",
    "showQuickJumper",
    "simplePagination",
    "paginationDisabled",
    "showSizeChanger",
    "defaultPageSize",
    "headerBorderRadius",
    "tableBackground",
    "cardBorderedSearch",
    "cardBorderedTable",
    "textSize",
    "enableSearchFormValidation",
    "expandRowByClick",
    "childrenColumnName",
    "actionWidth",
    "compactMode",
    "delimiter",
    "editMode",
    "isSortable",
    "height",
    "isLoading",
    "pageNo",
    "pageSize",
    "serverSidePaginationEnabled",
    "totalRecordsCount",
    "triggerRowSelection",
    "width",
    "borderRadius",
    "boxShadow",
    "borderWidth",
    "borderColor",
    "accentColor",
    "variant",
    "primaryColumnId",
    "isAddRowInProgress",
    "allowAddNewRow",
    "allowRowSelection",
    "disabledAddNewRowSave",
    "canFreezeColumn",
    "showConnectDataOverlay",
    "editingActions",
    "columns",
    "queryData",
    "columnActions",
    "filters",
    "columnWidthMap",
    "tableData",
    "editableCell",
    "isEditableCellsValid",
    // "primaryColumns",
  ];

  for (const prop of keyProps) {
    if (typeof prevProps[prop] === "object") {
      if (!equal(prevProps[prop], nextProps[prop])) return false;
    } else {
      if (prevProps[prop] !== nextProps[prop]) return false;
    }
  }

  return true;
}

export default memo(ReactTableComponent, arePropsEqual);
