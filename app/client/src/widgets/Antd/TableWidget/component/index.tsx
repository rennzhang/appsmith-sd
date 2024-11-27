import {
  useCallback,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";
import AntdProTable from "./Table";
import equal from "fast-deep-equal/es6";
import type { AntdTableProps, JSONFormProps } from "../constants";
import DragSortTable from "./demo/DragSortTable";
import EditTableDemo from "./demo/EditTableDemo";
import WidgetFactory from "utils/WidgetFactory";
import { RenderModes } from "constants/WidgetConstants";
import { CONFIG } from "widgets/Antd/JSONFormWidget";
import { ConfigProvider, Drawer, Modal } from "antd";
import { omit, pick, difference } from "lodash";
import React from "react";
import TableContext, { TableContextProvider } from "../widget/TableContext";
import { ConnectDataOverlay } from "./ConnectDataOverlay";
import { simpleDiff } from "widgets/Antd/tools/tool";

interface ReactTableComponentProps extends AntdTableProps, JSONFormProps {
  allowRowSelection: boolean;
}
const compareProps = (
  prevProps: ReactTableComponentProps,
  nextProps: ReactTableComponentProps,
  keyProps: (keyof ReactTableComponentProps)[],
  source: "table" | "jsonform" | "tableWidget",
) => {
  for (const _key of keyProps) {
    if (typeof prevProps[_key] === "object") {
      if (!equal(prevProps[_key], nextProps[_key])) {
        console.log(
          "AntdTableWidget compareProps diff",
          source,
          _key,
          source == "jsonform" && simpleDiff(prevProps[_key], nextProps[_key]),
        );
        return false;
      }
    } else {
      if (prevProps[_key] !== nextProps[_key]) {
        console.log("AntdTableWidget compareProps diff", source, _key);
        return false;
      }
    }
  }

  return true;
};
// 使用React.lazy动态导入JSONFormComponent
const JSONFormComponent = React.lazy(
  () => import("widgets/Antd/JSONFormWidget/component/index"),
);

const JSONFormRender = React.memo(
  function JSONFormRender(props: AntdTableProps & JSONFormProps) {
    const {
      autoFormConfig,
      isEditingMode,
      jsonFormRef,
      onJsonFormSubmit,
      widgetId,
      widgetName,
      ...restProps
    } = props;
    const { formModalTitle, handleFormClose, jsonFormState, setJsonFormState } =
      useContext(TableContext);

    // 1. 优化 processedFormProps 的计算和缓存
    const processedFormProps = useMemo(() => {
      return omit(autoFormConfig.config, ["editTitle", "title"]);
    }, [autoFormConfig]);

    // 3. 优化 modalContainer 的依赖和更新逻辑
    const modalContainer = useRef<any>(null);
    useEffect(() => {
      const container = isEditingMode
        ? processedFormProps.jsonFormPopType === "drawer"
          ? document.querySelector("#widgets-editor")
          : document.querySelector(".appsmith_widget_0")
        : document.body;

      modalContainer.current = container || document.body;
    }, [isEditingMode, processedFormProps.jsonFormPopType]);

    const onSubmit = useCallback(
      (values) => {
        setJsonFormState({
          isSubmitting: true,
          jsonFormData: values,
        });

        const targetActionName =
          jsonFormState.jsonFormType === "edit"
            ? "onSubmitWithEdit"
            : "onSubmit";
        props.onJsonFormSubmit(values, targetActionName, () => {
          setJsonFormState({
            isSubmitting: false,
            isJsonFormVisible: autoFormConfig.config.closeModalOnSubmit
              ? false
              : jsonFormState.isJsonFormVisible,
          });
        });
      },
      [
        props.onJsonFormSubmit,
        jsonFormState.jsonFormType,
        autoFormConfig.config,
      ],
    );
    // 6. 优化 renderJSONForm 的依赖
    const renderJSONForm = useMemo(() => {
      console.log("renderJSONForm", {
        processedFormProps,
        jsonFormState,
      });

      return (
        <JSONFormComponent
          {...processedFormProps}
          className={`proTable-auto-jsonform ${
            processedFormProps.jsonFormPopType === "drawer"
              ? "pop-drawer"
              : "pop-modal"
          }
          ${jsonFormState.jsonFormType === "view" ? "view-mode" : ""}
        `}
          disabled={jsonFormState.jsonFormType === "view"}
          formMode={jsonFormState.jsonFormType}
          hideSubmit={jsonFormState.jsonFormType === "view"}
          initialValues={jsonFormState.jsonFormData}
          isSubmitting={!!jsonFormState.isSubmitting}
          maxHeight={processedFormProps.modalHeight}
          onCancel={handleFormClose}
          onSubmit={onSubmit}
          ref={props.jsonFormRef}
          renderMode={props.renderMode}
          setMetaInternalFieldState={props.setMetaInternalFieldState}
          title={undefined}
          updateWidgetFormData={props.updateWidgetFormData}
          updateWidgetMetaProperty={props.updateWidgetMetaProperty}
          updateWidgetProperty={props.updateWidgetProperty}
          widgetId={props.widgetId + "-jsonform"}
          widgetName={props.widgetName + "_JSONFORM"}
        />
      );
    }, [
      jsonFormState,
      jsonFormRef,
      processedFormProps,
      jsonFormState.jsonFormType,
      jsonFormState.isSubmitting,
      onJsonFormSubmit,
      widgetId,
      widgetName,
      restProps,
    ]);

    // 7. 优化 ConfigProvider 的主题配置
    const themeConfig = useMemo(
      () => ({
        components: {
          Modal: {
            borderRadius:
              (processedFormProps.borderRadius as unknown as number) || 0,
            contentBg: processedFormProps.backgroundColor,
            headerBg: processedFormProps.backgroundColor,
            boxShadow: processedFormProps.boxShadow,
            titleColor: processedFormProps.titleColor,
          },
          Drawer: {
            colorBgElevated: processedFormProps.backgroundColor,
          },
        },
      }),
      [processedFormProps],
    );

    return (
      <ConfigProvider theme={themeConfig}>
        {processedFormProps.jsonFormPopType === "modal" ? (
          <Modal
            closable
            footer={null}
            getContainer={() => modalContainer.current}
            onCancel={handleFormClose}
            open={jsonFormState.isJsonFormVisible}
            title={formModalTitle}
            width={processedFormProps.modalWidth}
          >
            <React.Suspense fallback={<LoadingFallback />}>
              {renderJSONForm}
            </React.Suspense>
          </Modal>
        ) : (
          <Drawer
            getContainer={() => modalContainer.current}
            onClose={handleFormClose}
            open={jsonFormState.isJsonFormVisible}
            placement="right"
            rootStyle={{
              position: "absolute",
            }}
            styles={{
              body: {
                paddingBottom: 0,
                paddingTop: 0,
              },
            }}
            title={formModalTitle}
            width={processedFormProps.modalWidth}
          >
            <React.Suspense fallback={<LoadingFallback />}>
              {renderJSONForm}
            </React.Suspense>
          </Drawer>
        )}
      </ConfigProvider>
    );
  },
  (prevProps, nextProps) => {
    const keysToCompare = [
      "jsonFormRef",
      "autoFormConfig",
      "isJsonFormVisible",
    ] as any[];
    return compareProps(prevProps, nextProps, keysToCompare, "jsonform");
  },
);

const AntdProTableRender = React.memo(AntdProTable, (prevProps, nextProps) => {
  const keysToCompare = difference(Object.keys(prevProps), [
    "autoFormConfig",
    "formData",
    "jsonFormRef",
    "autoFormConfig",
    "isJsonFormVisible",
  ]) as (keyof AntdTableProps & keyof JSONFormProps)[];
  console.log(keysToCompare, "keysToCompare");

  // 开发环境打印diff
  // if (process.env.NODE_ENV === "development") {
  //   const diffProps = diff(
  //     pick(prevProps, keysToCompare),
  //     pick(nextProps, keysToCompare),
  //   );
  //   if (diffProps) {
  //     console.log("AntdTableWidget AntdProTableRender memo diff", {
  //       p: prevProps,
  //       n: nextProps,
  //       diff: diffProps,
  //     });
  //   }
  // }
  return compareProps(prevProps, nextProps, keysToCompare, "table");
});

// 8. 抽离 loading fallback 组件
const LoadingFallback = () => <div>加载中...</div>;

function ReactTableComponent(props: ReactTableComponentProps) {
  return (
    <>
      {props.showConnectDataOverlay && (
        <ConnectDataOverlay onConnectData={props.onConnectData} />
      )}
      <TableContextProvider
        autoFormConfig={props.autoFormConfig}
        batchUpdateWidgetProperty={props.batchUpdateWidgetProperty}
        defaultFormData={props.defaultFormData}
        executeAction={props.executeAction}
        jsonFormRef={props.jsonFormRef}
        onJsonFormOpen={props.onJsonFormOpen}
        primaryColumnId={props.primaryColumnId}
        updateWidgetMetaProperty={props.updateWidgetMetaProperty}
      >
        <AntdProTableRender {...props} isTableLoading={props.isLoading} />
        <JSONFormRender {...props} />
      </TableContextProvider>
    </>
  );
}

function arePropsEqual(
  prevProps: ReactTableComponentProps,
  nextProps: ReactTableComponentProps,
) {
  // 比较关键属性
  const keyProps: (keyof ReactTableComponentProps)[] = [
    "jsonFormRef",
    "isEditingMode",
    "autoGenerateTableForm",
    "autoFormConfig",
    "tableInlineEditType",
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
    "batchUpdateWidgetProperty",
  ];
  return compareProps(prevProps, nextProps, keyProps, "tableWidget");
}

export default memo(ReactTableComponent, arePropsEqual);

// export default DragSortTable;
// export default EditTableDemo;
