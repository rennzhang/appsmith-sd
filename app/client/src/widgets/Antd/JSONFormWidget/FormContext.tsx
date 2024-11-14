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
  updateFormData: (values: any, cb?: (values: any) => void) => void;
}>;

type FormContextValueProps = Omit<FormContextProps, "children">;

type FormContextReturnProps = FormContextValueProps;

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
  initialValues,
  renderMode,
  setFieldErrors,
  setMetaInternalFieldState,
  updateDefaultFormData,
  updateFormData,
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
