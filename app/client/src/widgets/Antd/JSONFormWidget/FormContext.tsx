import React, { createContext, useMemo, useRef, useState } from "react";

import type { RenderMode } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "./widget";
import type { DebouncedExecuteActionPayload } from "widgets/MetaHOC";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";
import { get, set } from "lodash";
import type { FieldError } from "rc-field-form/lib/interface";

type FormContextProps<TValues = any> = React.PropsWithChildren<{
  initialValues: TValues;
  updateDefaultFormData?: (values: any) => void;
  formColorPrimary?: string;
  formControlSize: ProFormProps["size"];
  formData: TValues;
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
  setFormData: (values: TValues) => void;
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
  formData,
  formIsDisabled,
  formIsRequird,
  formLabelAlign,
  formLayout,
  formRef,
  initialValues,
  renderMode,
  setFieldErrors,
  setFormData,
  setMetaInternalFieldState,
  updateDefaultFormData,
  updateWidgetFormData,
  updateWidgetMetaProperty,
  updateWidgetProperty,
}: FormContextProps) {
  const value = useMemo(
    () => ({
      initialValues,
      setFieldErrors,
      updateDefaultFormData,
      updateWidgetFormData,
      setFormData,
      formData,
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
      updateFormData: async (values: any, cb?: (values: any) => void) => {
        const newFormData = { ...formRef?.current?.getFieldsValue() };
        for (const key of Object.keys(values)) {
          set(newFormData, key, values[key]);
          await formRef?.current?.setFieldValue(key.split("."), values[key]);
        }

        const isUpdateChange = Object.keys(values).some(
          (key) => values[key] !== get(formData, key),
        );
        console.log("updateFormData result", {
          values,
          formData,
          newFormData,
          initialValues,
          isUpdateChange,
        });
        if (!isUpdateChange) return;

        await updateWidgetFormData(newFormData);
        setFormData(newFormData);
        const isChangeWithValidate = Object.keys(values).some(
          (value) => values[value] !== initialValues[value],
        );

        cb?.(newFormData);

        try {
          if (!isChangeWithValidate) return;
          await formRef?.current?.validateFields(Object.keys(values));
          setFieldErrors([]);
        } catch (error: any) {
          console.log("updateFormData validateFields", {
            values,
            formData,
            newFormData,
            isChangeWithValidate,
            initialValues,
            error,
          });

          setFieldErrors(error?.errorFields as FieldError[]);
        }
      },
      updateWidgetMetaProperty,
      updateWidgetProperty,
    }),
    [
      initialValues,
      formRef,
      formIsRequird,
      formIsDisabled,
      formControlSize,
      formLayout,
      formLabelAlign,
      setFormData,
      formData,
      updateDefaultFormData,
      setFieldErrors,
    ],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormContext;
