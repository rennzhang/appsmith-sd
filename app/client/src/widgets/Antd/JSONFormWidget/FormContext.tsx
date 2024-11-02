import React, { createContext, useMemo, useRef } from "react";

import type { RenderMode } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "./widget";
import type { DebouncedExecuteActionPayload } from "widgets/MetaHOC";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";
import { set } from "lodash";

type FormContextProps<TValues = any> = React.PropsWithChildren<{
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
  setFormData: (values: TValues) => void;
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
  formRef,
  renderMode,
  setFormData,
  setMetaInternalFieldState,
  updateDefaultFormData,
  updateWidgetFormData,
  updateWidgetMetaProperty,
  updateWidgetProperty,
}: FormContextProps) {
  const value = useMemo(
    () => ({
      updateDefaultFormData,
      updateWidgetFormData,
      setFormData,
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

        // await formRef?.current?.setFieldsValue(newFormData);
        const formData = await formRef?.current?.getFieldsValue();

        await updateWidgetFormData(formData);
        setFormData(newFormData);
        console.log("updateFormData result", {
          values,
          formData,
          newFormData,
        });
        cb?.(newFormData);
      },
      updateWidgetMetaProperty,
      updateWidgetProperty,
    }),
    [
      formRef,
      formIsRequird,
      formIsDisabled,
      formControlSize,
      formLayout,
      formLabelAlign,
      setFormData,
      updateDefaultFormData,
    ],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormContext;
