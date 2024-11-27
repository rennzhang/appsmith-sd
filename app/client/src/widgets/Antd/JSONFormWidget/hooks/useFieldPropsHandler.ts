import FormContext from "../FormContext";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FieldType, type SchemaItem } from "../constants";
import { AntdLabelPosition } from "components/constants";
import type { FormInstance } from "redux-form";
import { get, isEqual } from "lodash";

type UseFieldPropsHandlerProps = {
  name: string;
  schemaItem: SchemaItem;
  passedDefaultValue: any;
};
export const useFieldPropsHandler = ({
  name,
  passedDefaultValue,
  schemaItem,
}: UseFieldPropsHandlerProps) => {
  const formContext = useContext(FormContext);

  const {
    executeAction,
    formLayout,
    formMode,
    formRef,
    initialValues,
    updateFormData,
  } = formContext;

  const callbackRef = useRef({
    updateFormData,
    executeAction,
  });

  useEffect(() => {
    callbackRef.current = {
      updateFormData,
      executeAction,
    };
  });
  const prevSchemaItemRef = useRef(schemaItem);
  const prevFormContextRef = useRef(formContext);
  const [defaultValue, setDefaultValue] = useState<any>(
    schemaItem.defaultValue,
  );
  const inputDefaultValue = (() => {
    console.log("useFieldPropsHandler initialValues", {
      formMode,
      initialValues,
      schemaItem,
    });

    // 如果formMode有值，则是在 ProTable 中使用，需要使用 sourceData 作为默认值
    if (formMode) {
      return schemaItem?.defaultValue ?? initialValues?.[name];
    }
    if (passedDefaultValue === undefined) {
      return schemaItem?.defaultValue || initialValues?.[name];
    }

    return passedDefaultValue;
  })();

  useEffect(() => {
    const formValue = formRef?.current?.getFieldsValue();
    const currentValue = get(formValue, name);
    if (isEqual(currentValue, inputDefaultValue)) {
      return;
    }
    updateFormData({
      [name]: inputDefaultValue,
    });
    if (schemaItem.defaultValue !== defaultValue) {

      setDefaultValue(schemaItem.defaultValue);
    }
  }, [schemaItem.defaultValue]);
  const fieldProps = useMemo(() => {
    const getUpdatedValue = <T>(
      schemaValue: T,
      prevSchemaValue: T,
      formValue: T,
      prevFormValue: T,
    ) =>
      (schemaValue !== prevSchemaValue
        ? schemaValue
        : formValue !== prevFormValue
        ? formValue
        : prevSchemaValue ?? prevFormValue) || formValue;

    const controlSize = getUpdatedValue(
      schemaItem.controlSize,
      prevSchemaItemRef.current.controlSize,
      formContext.formControlSize,
      prevFormContextRef.current.formControlSize,
    );

    const isDisabled = getUpdatedValue(
      schemaItem.isDisabled,
      prevSchemaItemRef.current.isDisabled,
      formContext.formIsDisabled,
      prevFormContextRef.current.formIsDisabled,
    );

    const isRequired = getUpdatedValue(
      schemaItem.isRequired,
      prevSchemaItemRef.current.isRequired,
      formContext.formIsRequird,
      prevFormContextRef.current.formIsRequird,
    );

    const labelAlignment = getUpdatedValue(
      schemaItem.labelAlignment,
      prevSchemaItemRef.current.labelAlignment,
      formContext.formLabelAlign,
      prevFormContextRef.current.formLabelAlign,
    );

    const labelPosition = getUpdatedValue(
      schemaItem.labelPosition,
      prevSchemaItemRef.current.labelPosition,
      formContext.formLayout === "vertical"
        ? AntdLabelPosition.Top
        : AntdLabelPosition.Auto,
      prevFormContextRef.current.formLayout === "vertical"
        ? AntdLabelPosition.Top
        : AntdLabelPosition.Auto,
    );

    const colorPrimary = getUpdatedValue(
      schemaItem.colorPrimary,
      prevSchemaItemRef.current.colorPrimary,
      formContext.formColorPrimary,
      prevFormContextRef.current.formColorPrimary,
    );

    return {
      callbackRef,
      colorPrimary,
      required: isRequired,
      disabled: isDisabled,
      controlSize,
      isDisabled,
      isRequired,
      labelAlignment,
      labelPosition,
      isInForm: true,
      formRef,
      defaultValue: inputDefaultValue,
      value: inputDefaultValue,
      accessor: name.split("."),
      formLayout,
    };
  }, [schemaItem, formContext, inputDefaultValue]);

  useEffect(() => {
    prevSchemaItemRef.current = schemaItem;
    prevFormContextRef.current = formContext;
  });

  return fieldProps;
};
