import { useCallback, memo } from "react";
import AntdProTable from "./Table";
import equal from "fast-deep-equal/es6";
import type { AntdTableProps } from "../constants";
import DragSortTable from "./DragSortTable";
import EditTableDemo from "./EditTableDemo";

interface ReactTableComponentProps extends AntdTableProps {
  allowRowSelection: boolean;
}

function ReactTableComponent(props: ReactTableComponentProps) {
  return <AntdProTable {...props} />;
}

function arePropsEqual(
  prevProps: ReactTableComponentProps,
  nextProps: ReactTableComponentProps,
) {
  // 比较关键属性
  const keyProps: (keyof ReactTableComponentProps)[] = [
    "addNewRowText",
    "defaultNewRow",
    "addNewRowPosition",
    "defaultExpandAllRows",
    "defaultExpandedRowKeys",
    "editableKeys",
    "editableIndices",
    "expandedKeys",
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
    "inlineEditingSaveOption",
    "handleAddNewRow",
    "handleEditableValuesChange",
    "handleEditableRowChange",
    "onCellTextChange",
    "onExpandedRowsChange",
    "onExpand",
    "onRowClick",
    "onCheckChange",
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

// export default DragSortTable;
// export default EditTableDemo;
