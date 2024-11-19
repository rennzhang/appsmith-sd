import React, { createContext, useCallback, useMemo, useState } from "react";
import type {
  AntdTableProps,
  JSONFormProps,
  JSONFormState,
} from "../constants";
import { message } from "antd";
import type { ProFormInstance } from "@ant-design/pro-components";
import { resetToDefaultValues } from "./propertyUtils";

// 定义 TableContext 的 Props 类型
type TableContextProps = React.PropsWithChildren<{
  jsonFormRef: React.RefObject<ProFormInstance>;
  primaryColumnId: AntdTableProps["primaryColumnId"];
  // 从 JSONFormProps 继承的属性
  autoFormConfig: AntdTableProps["autoFormConfig"];
  updateWidgetMetaProperty: AntdTableProps["updateWidgetMetaProperty"];
  batchUpdateWidgetProperty: AntdTableProps["batchUpdateWidgetProperty"];
}>;

type TableContextValueProps = Omit<
  TableContextProps,
  "children" | "autoFormConfig" | "editableColumn" | "primaryColumnId"
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
  jsonFormRef,
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

  const setJsonFormState = (state: Partial<typeof jsonFormState>) => {
    jsonFormRef.current?.resetFields();
    console.log("Antd ProTable provider setJsonFormState", {
      state,
      primaryColumnId,
      resetValue: jsonFormRef.current?.getFieldsValue(),
    });
    const jsonFormData =
      cleanObject(state.jsonFormData) || jsonFormState.jsonFormData;
    const sourceData =
      state.jsonFormType === "add"
        ? resetToDefaultValues(jsonFormData || {})
        : jsonFormData;
    setFormState((prevState) => ({
      ...prevState,
      ...state,
      jsonFormData: sourceData,
    }));
    setTimeout(() => {
      if (state.isJsonFormVisible) {
        batchUpdateWidgetProperty(
          {
            modify: {
              "autoFormConfig.config.sourceData": sourceData,
            },
          },
          false,
        );
      }
    }, 200);
  };
  // 处理表单关闭
  const handleFormClose = useCallback(() => {
    setFormState({
      isSubmitting: false,
      jsonFormData: undefined,
      isJsonFormVisible: false,
    });
  }, [setFormState]);

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
    ],
  );

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
}

export default TableContext;
