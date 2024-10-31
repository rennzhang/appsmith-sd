import { useCallback, memo } from "react";
import AntdProTable from "./Table";
import equal from "fast-deep-equal/es6";
import type { AntdTableProps, JSONFormProps } from "../constants";
import DragSortTable from "./demo/DragSortTable";
import EditTableDemo from "./demo/EditTableDemo";
import WidgetFactory from "utils/WidgetFactory";
import { RenderModes } from "constants/WidgetConstants";
import { CONFIG } from "widgets/Antd/JSONFormWidget";

interface ReactTableComponentProps extends AntdTableProps, JSONFormProps {
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
    "isEditingMode",
    "jsonFormState",
    "setJsonFormState",
    "autoGenerateTableForm",
    "autoFormConfig",
    "tablePrimaryColor",
    "toolBarActions",
    "isVisibleDensity",
    "creatorButtonText",
    "headerTitle",
    "tableType",
    "editableColumn",
    // 行选择相关
    "rowSelectionActions",
    "selectionColumnWidth",
    "preserveSelectedRowKeys",
    "hideSelectAll",
    "selectedRows",
    "selectedRowKeys",
    "rowSelectionFixed",
    "rowSelectionType",
    "addNewRowText",
    "defaultNewRow",
    "addNewRowPosition",
    "defaultExpandAllRows",
    "defaultExpandedRowKeys",
    "editableKeys",
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
    "isRemoteSort",
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
    "tableInlineEditType",
    "handleAddNewRow",
    "handleEditableValuesChange",
    "handleEditableRowChange",
    "handleCellValueChange",
    "handleExpandedRowsChange",
    "onExpand",
    "handleRowClick",
    "handleDragSortEnd",
    "handleSwitchValueChange",
    "handleUrlOrImgClick",
    "handleAlertBtnClick",
    "handleColumnSorting",
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
