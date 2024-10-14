import React, { createContext, useMemo } from "react";

import type { RenderMode } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "./widget";
import type { DebouncedExecuteActionPayload } from "widgets/MetaHOC";
import type { ProFormInstance } from "@ant-design/pro-components";

type FormContextProps<TValues = any> = React.PropsWithChildren<{
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
  formIsRequird,
  formRef,
  renderMode,
  setMetaInternalFieldState,
  updateFormData,
  updateWidgetMetaProperty,
  updateWidgetProperty,
}: FormContextProps) {
  const value = useMemo(
    () => ({
      formIsRequird,
      executeAction,
      formRef,
      renderMode,
      setMetaInternalFieldState,
      updateFormData,
      updateWidgetMetaProperty,
      updateWidgetProperty,
    }),
    [formRef, formIsRequird],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormContext;
