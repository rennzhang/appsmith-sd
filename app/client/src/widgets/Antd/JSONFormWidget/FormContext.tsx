import React, { createContext, useMemo } from "react";

import type { RenderMode } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "./widget";
import type { DebouncedExecuteActionPayload } from "widgets/MetaHOC";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";

type FormContextProps<TValues = any> = React.PropsWithChildren<{
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
  updateFormData: (values: TValues) => void;
}>;

type FormContextValueProps = Omit<FormContextProps, "children">;

const FormContext = createContext<FormContextValueProps>(
  {} as FormContextValueProps,
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
  setMetaInternalFieldState,
  updateFormData,
  updateWidgetMetaProperty,
  updateWidgetProperty,
}: FormContextProps) {
  const value = useMemo(
    () => ({
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
      updateFormData: async (values: any) => {
        Object.keys(values).forEach(async (key) => {
          await formRef?.current?.setFieldValue(key.split("."), values[key]);
        });
        // await formRef?.current?.setFieldsValue(values);

        const formData = await formRef?.current?.getFieldsValue();
        await updateFormData(formData);
        console.log("updateFormData result", values, formData);
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
    ],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormContext;
