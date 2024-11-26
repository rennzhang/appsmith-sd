import React, { createContext, useCallback, useMemo, useState } from "react";
import type {
  AntdTableProps,
  JSONFormProps,
  JSONFormState,
} from "../constants";
import { message } from "antd";
import type { ProFormInstance } from "@ant-design/pro-components";
import { resetToDefaultValues } from "./propertyUtils";
import { isEmpty } from "lodash";

// 定义 TableContext 的 Props 类型
type TableContextProps = React.PropsWithChildren<{
  jsonFormRef: React.RefObject<ProFormInstance>;
  primaryColumnId: AntdTableProps["primaryColumnId"];
  // 从 JSONFormProps 继承的属性
  autoFormConfig: AntdTableProps["autoFormConfig"];
  updateWidgetMetaProperty: AntdTableProps["updateWidgetMetaProperty"];
  batchUpdateWidgetProperty: AntdTableProps["batchUpdateWidgetProperty"];
  executeAction: AntdTableProps["executeAction"];
  onJsonFormOpen: AntdTableProps["onJsonFormOpen"];
  defaultFormData: Record<string, unknown>;
}>;

type TableContextValueProps = Omit<
  TableContextProps,
  | "children"
  | "autoFormConfig"
  | "editableColumn"
  | "primaryColumnId"
  | "onJsonFormOpen"
  | "defaultFormData"
>;

type TableContextValueReturnProps = TableContextValueProps & {
  handleFormClose: () => void;
  jsonFormState: {
    jsonFormData?: Record<string, unknown>;
    isJsonFormVisible?: boolean;
    jsonFormType?: "add" | "edit" | "view";
    isSubmitting?: boolean;
  };
  setJsonFormState: (state: {
    jsonFormData?: Record<string, unknown>;
    isJsonFormVisible?: boolean;
    jsonFormType?: "add" | "edit" | "view";
    isSubmitting?: boolean;
  }) => void;
  formModalTitle?: string;
};

const cleanObject = (obj?: Record<string, unknown>) => {
  // 如果不是对象或者是null,直接返回
  if (typeof obj !== "object" || !obj) {
    return obj;
  }

  // 创建新对象
  const cleanedObj: Record<string, unknown> = {};

  // 遍历原对象的所有键
  for (const key in obj) {
    const value = obj[key];

    // 跳过包含双下划线的键名
    if (key.includes("__")) {
      continue;
    }

    // 跳过数组类型的值
    if (Array.isArray(value)) {
      continue;
    }

    // 如果值是对象,递归处理
    if (typeof value === "object" && value !== null) {
      cleanedObj[key] = cleanObject(value as Record<string, unknown>);
    } else {
      // 保留其他正常的键值对
      cleanedObj[key] = value;
    }
  }

  return cleanedObj;
};

// 创建 Context
const TableContext = createContext<TableContextValueReturnProps>(
  {} as TableContextValueReturnProps,
);

// Context Provider 组件
export function TableContextProvider({
  autoFormConfig,
  batchUpdateWidgetProperty,
  children,
  defaultFormData,
  executeAction,
  jsonFormRef,
  onJsonFormOpen,
  primaryColumnId,
  updateWidgetMetaProperty,
}: TableContextProps) {
  const [jsonFormState, setFormState] = useState<JSONFormState>({});
  // 2. 优化 modalTitle 的依赖
  const formModalTitle = useMemo(() => {
    if (jsonFormState.jsonFormType === "view") {
      return "查看详情";
    }
    return jsonFormState.jsonFormType === "edit"
      ? autoFormConfig.config.editTitle
      : autoFormConfig.config.title;
  }, [jsonFormState.jsonFormType, autoFormConfig.config]);

  const updateWidgetProperty = (
    state: Partial<typeof jsonFormState>,
    sourceData?: Record<string, unknown>,
  ) => {
    batchUpdateWidgetProperty(
      {
        modify: {
          sourceData,
          formData: sourceData,
          "autoFormConfig.config.sourceData": sourceData,
          schemaFormType: state.jsonFormType,
          schemaFormState: {
            type: state.jsonFormType,
            value: sourceData,
            isCreateForm: state.jsonFormType === "add",
            isEditForm: state.jsonFormType === "edit",
            isViewForm: state.jsonFormType === "view",
            submitting: state.isSubmitting,
            isFormVisible: state.isJsonFormVisible,
          },
        },
      },
      false,
    );
  };

  const setJsonFormState = async (
    state: Partial<typeof jsonFormState>,
    isSubmit?: boolean,
  ) => {
    // 有可能没有传入 isJsonFormVisible 和 isSubmitting
    const inComingVisible =
      state.isJsonFormVisible ?? jsonFormState.isJsonFormVisible;
    const inComingSubmitting = state.isSubmitting ?? jsonFormState.isSubmitting;
    const isOpen = inComingVisible && !jsonFormState.isJsonFormVisible;
    const isClose = !inComingVisible && jsonFormState.isJsonFormVisible;
    const isSubmitFinish = !inComingSubmitting && jsonFormState.isSubmitting;

    let sourceData = state.jsonFormData;

    if (isClose || isSubmitFinish) {
      sourceData = defaultFormData;
    }

    if (isOpen) {
      onJsonFormOpen();
      if (state.jsonFormType === "add") {
        sourceData = defaultFormData;
        // jsonFormRef.current?.setFieldsValue(sourceData);
      } else {
        sourceData = cleanObject(state.jsonFormData);
      }
    }

    setFormState((prevState) => ({
      ...prevState,
      ...state,
      jsonFormData: sourceData,
    }));

    console.log("Antd ProTable provider setJsonFormState", {
      isOpen,
      isClose,
      isSubmitFinish,
      state,
      primaryColumnId,
      resetValue: jsonFormRef.current?.getFieldsValue(),
      sourceData,
      jsonFormState,
      autoFormConfig,
    });

    if (isSubmit) {
      updateWidgetProperty(state, sourceData);
    } else {
      setTimeout(() => {
        updateWidgetProperty(state, sourceData);
      }, 200);
    }
  };
  // 处理表单关闭
  const handleFormClose = useCallback(() => {
    setJsonFormState({
      isSubmitting: false,
      jsonFormData: undefined,
      isJsonFormVisible: false,
    });
  }, [setJsonFormState]);

  // 使用 useMemo 缓存 context 值
  const value = useMemo(
    () => ({
      updateWidgetMetaProperty,
      batchUpdateWidgetProperty,
      jsonFormState,
      setJsonFormState,
      jsonFormRef,
      autoFormConfig,
      handleFormClose,
      formModalTitle,
      executeAction,
    }),
    [
      updateWidgetMetaProperty,
      batchUpdateWidgetProperty,
      jsonFormState,
      setJsonFormState,
      jsonFormRef,
      autoFormConfig,
      handleFormClose,
      formModalTitle,
      executeAction,
    ],
  );

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
}

export default TableContext;
