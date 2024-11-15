import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { RenderMode } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "./widget";
import type { DebouncedExecuteActionPayload } from "widgets/MetaHOC";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";
import { get, isEqual, set } from "lodash";
import type { FieldError } from "rc-field-form/lib/interface";
import { debounce } from "lodash";

type FormContextProps<TValues = any> = React.PropsWithChildren<{
  formMode?: "edit" | "add" | "view";
  initialValues: TValues;
  updateDefaultFormData?: (values: any) => void;
  formColorPrimary?: string;
  formControlSize: ProFormProps["size"];
  formIsDisabled?: boolean;
  formLayout?: "horizontal" | "vertical" | "inline";
  formLabelAlign?: "left" | "right";
  formIsRequird?: boolean;
  executeAction: (action: Action) => void;
  formRef: React.RefObject<ProFormInstance<any>> | null;
  renderMode: RenderMode;
  setMetaInternalFieldState: (
    updateCallback: (prevState: JSONFormWidgetState) => JSONFormWidgetState,
    afterUpdateAction?: DebouncedExecuteActionPayload,
  ) => void;
  updateWidgetMetaProperty: (propertyName: string, propertyValue: any) => void;
  updateWidgetProperty: (propertyName: string, propertyValues: any) => void;
  updateWidgetFormData: (
    values: TValues,
    cb?: (values: TValues) => void,
  ) => void;
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldError[]>>;
}>;

type FormContextValueProps = Omit<FormContextProps, "children">;

type FormContextReturnProps = FormContextValueProps & {
  updateFormData: (values: any, cb?: (values: any) => void) => void;
};

const FormContext = createContext<FormContextReturnProps>(
  {} as FormContextReturnProps,
);

export function FormContextProvider({
  children,
  executeAction,
  formColorPrimary,
  formControlSize,
  formIsDisabled,
  formIsRequird,
  formLabelAlign,
  formLayout,
  formMode,
  formRef,
  initialValues,
  renderMode,
  setFieldErrors,
  setMetaInternalFieldState,
  updateDefaultFormData,
  updateWidgetFormData,
  updateWidgetMetaProperty,
  updateWidgetProperty,
}: FormContextProps) {
  const formDataRef = useRef(initialValues);

  // 将 debounced 函数移到组件外部或使用 useCallback 来缓存
  const debouncedUpdate = useCallback(
    debounce(async (values: any, cb?: (values: any) => void) => {
      const isAdd = formMode === "add";
      const newFormData = isAdd
        ? {}
        : { ...formRef?.current?.getFieldsValue(), ...values };

      let hasChanges = isAdd ? true : false;
      if (!hasChanges) {
        for (const key of Object.keys(values)) {
          const oldValue = get(formDataRef.current, key);
          const newValue = values[key];

          if (!isEqual(oldValue, newValue)) {
            hasChanges = true;
            set(newFormData, key, newValue);
            formRef?.current?.setFieldValue(key.split("."), newValue);
          }
        }
      }

      console.log("updateFormData result", {
        values,
        formDataRef: formDataRef.current,
        newFormData,
        initialValues,
        hasChanges,
      });

      formDataRef.current = newFormData;

      hasChanges && updateWidgetFormData(newFormData);
      hasChanges &&
        formRef?.current
          ?.validateFields(Object.keys(values))
          .then(() => {
            setFieldErrors([]);
          })
          .catch((error: any) => {
            console.log("updateFormData validateFields error:", error);
            setFieldErrors(error?.errorFields as FieldError[]);
          });

      cb?.(newFormData);
    }, 100),
    [formRef, initialValues, updateWidgetFormData, setFieldErrors],
  );

  // 包装更新函数
  const updateFormData = useCallback(
    (values: any, cb?: (values: any) => void) => {
      debouncedUpdate(values, cb);
    },
    [debouncedUpdate],
  );
  const value = useMemo(
    () => ({
      formMode,
      initialValues,
      setFieldErrors,
      updateDefaultFormData,
      updateWidgetFormData,
      formColorPrimary,
      formLayout,
      formLabelAlign,
      formControlSize,
      formIsRequird,
      formIsDisabled,
      executeAction,
      formRef,
      renderMode,
      setMetaInternalFieldState,
      updateFormData,
      updateWidgetMetaProperty,
      updateWidgetProperty,
    }),
    [
      formMode,
      initialValues,
      formRef,
      formIsRequird,
      formIsDisabled,
      formControlSize,
      formLayout,
      formLabelAlign,
      updateFormData,
      updateDefaultFormData,
      setFieldErrors,
      executeAction,
      updateWidgetFormData,
      updateWidgetMetaProperty,
      updateWidgetProperty,
      setMetaInternalFieldState,
    ],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormContext;
