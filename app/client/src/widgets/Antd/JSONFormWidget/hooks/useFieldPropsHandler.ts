import FormContext from "../FormContext";
import { useContext, useEffect, useMemo, useRef } from "react";
import type { SchemaItem } from "../constants";
import { AntdLabelPosition } from "components/constants";

export const useFieldPropsHandler = (schemaItem: SchemaItem) => {
  const formContext = useContext(FormContext);
  const prevSchemaItemRef = useRef(schemaItem);
  const prevFormContextRef = useRef(formContext);

  const fieldProps = useMemo(() => {
    const getUpdatedValue = <T>(
      schemaValue: T,
      prevSchemaValue: T,
      formValue: T,
      prevFormValue: T,
    ) =>
      schemaValue !== prevSchemaValue
        ? schemaValue
        : formValue !== prevFormValue
        ? formValue
        : prevSchemaValue ?? prevFormValue;

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
      formContext.formLayout === "vertical" ? AntdLabelPosition.Top : "auto",
      prevFormContextRef.current.formLayout === "vertical"
        ? AntdLabelPosition.Top
        : "auto",
    );

    return {
      required: isRequired,
      disabled: isDisabled,
      controlSize,
      isDisabled,
      isRequired,
      labelAlignment,
      labelPosition,
      isInForm: true,
    };
  }, [schemaItem, formContext]);

  useEffect(() => {
    prevSchemaItemRef.current = schemaItem;
    prevFormContextRef.current = formContext;
  });

  return fieldProps;
};
