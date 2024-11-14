import { useCallback, memo, useEffect, useMemo, useRef, useState } from "react";
import AntdProTable from "./Table";
import equal from "fast-deep-equal/es6";
import type { AntdTableProps, JSONFormProps } from "../constants";
import DragSortTable from "./demo/DragSortTable";
import EditTableDemo from "./demo/EditTableDemo";
import WidgetFactory from "utils/WidgetFactory";
import { RenderModes } from "constants/WidgetConstants";
import { CONFIG } from "widgets/Antd/JSONFormWidget";
import { ConfigProvider, Drawer, Modal } from "antd";
import { omit } from "lodash";
import React from "react";

interface ReactTableComponentProps extends AntdTableProps, JSONFormProps {
  allowRowSelection: boolean;
}
// 使用React.lazy动态导入JSONFormComponent
const JSONFormComponent = React.lazy(
  () => import("widgets/Antd/JSONFormWidget/component/index"),
);

const JSONFormRender = React.memo(
  function JSONFormRender(props: AntdTableProps & JSONFormProps) {
    const {
      autoFormConfig,
      formData,
      isEditingMode,
      isJsonFormVisible,
      jsonFormRef,
      jsonFormState,
      onJsonFormSubmit,
      setIsJsonFormVisible,
      setJsonFormState,
      widgetId,
      widgetName,
      ...restProps
    } = props;

    // 1. 优化 processedFormProps 的计算和缓存
    const processedFormProps = useMemo(() => {
      return omit(autoFormConfig.config, ["editTitle", "title"]);
    }, [autoFormConfig]);

    // 2. 优化 modalTitle 的依赖
    const modalTitle = useMemo(() => {
      if (jsonFormState.jsonFormType === "view") {
        return "查看详情";
      }
      return jsonFormState.jsonFormType === "edit"
        ? autoFormConfig.config.editTitle
        : autoFormConfig.config.title;
    }, [jsonFormState.jsonFormType, autoFormConfig.config]);

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

    // 4. 优化 handleCancel 函数,使用 useCallback 避免重复创建
    const handleCancel = useCallback(() => {
      setIsJsonFormVisible(false);
      setJsonFormState({ isJsonFormVisible: false });
    }, [setIsJsonFormVisible, setJsonFormState]);

    // 5. 优化 Modal/Drawer 的关闭处理函数
    const handleClose = useCallback(() => {
      setIsJsonFormVisible(false);
      setJsonFormState({
        isJsonFormVisible: false,
        isSubmitting: false,
      });
    }, [setIsJsonFormVisible, setJsonFormState]);

    // 6. 优化 renderJSONForm 的依赖
    const renderJSONForm = useMemo(
      () => (
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
          hideSubmit={jsonFormState.jsonFormType === "view"}
          initialValues={formData}
          isSubmitting={!!jsonFormState.isSubmitting}
          maxHeight={processedFormProps.modalHeight}
          onCancel={handleCancel}
          onSubmit={(values) => {
            props.onJsonFormSubmit(values);
          }}
          ref={props.jsonFormRef}
          renderMode={props.renderMode}
          setMetaInternalFieldState={props.setMetaInternalFieldState}
          title={undefined}
          updateDefaultFormData={props.updateDefaultFormData}
          updateWidgetFormData={props.updateWidgetFormData}
          updateWidgetMetaProperty={props.updateWidgetMetaProperty}
          updateWidgetProperty={props.updateWidgetProperty}
          widgetId={props.widgetId + "-jsonform"}
          widgetName={props.widgetName + "_JSONFORM"}
        />
      ),
      [
        jsonFormRef,
        processedFormProps,
        jsonFormState.jsonFormType,
        jsonFormState.isSubmitting,
        formData,
        handleCancel,
        onJsonFormSubmit,
        widgetId,
        widgetName,
        restProps,
      ],
    );

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
            onCancel={handleClose}
            open={isJsonFormVisible}
            title={modalTitle}
            width={processedFormProps.modalWidth}
          >
            <React.Suspense fallback={<LoadingFallback />}>
              {renderJSONForm}
            </React.Suspense>
          </Modal>
        ) : (
          <Drawer
            getContainer={() => modalContainer.current}
            onClose={handleClose}
            open={isJsonFormVisible}
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
            title={modalTitle}
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
      "jsonFormState",
      "formData",
      "autoFormConfig",
      "isJsonFormVisible",
    ] as const;

    return keysToCompare.every((key) => equal(prevProps[key], nextProps[key]));
  },
);

// 8. 抽离 loading fallback 组件
const LoadingFallback = () => <div>加载中...</div>;

function ReactTableComponent(props: ReactTableComponentProps) {
  const [isJsonFormVisible, setIsJsonFormVisible] = useState(
    props.jsonFormState.isJsonFormVisible,
  );

  return (
    <>
      <JSONFormRender
        {...props}
        isJsonFormVisible={isJsonFormVisible}
        setIsJsonFormVisible={setIsJsonFormVisible}
      />
      <AntdProTable
        {...props}
        isJsonFormVisible={isJsonFormVisible}
        setIsJsonFormVisible={setIsJsonFormVisible}
      />
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
