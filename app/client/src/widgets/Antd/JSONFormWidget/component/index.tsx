import type { PropsWithChildren } from "react";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { Text } from "@blueprintjs/core";

import type { Schema } from "../constants";
import { FIELD_MAP, MAX_ALLOWED_FIELDS, ROOT_SCHEMA_KEY } from "../constants";
import { FormContextProvider } from "../FormContext";
import { debounce, get, isEmpty, isEqual, pick, set } from "lodash";
import type { RenderMode } from "constants/WidgetConstants";
import { RenderModes, TEXT_SIZES } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "../widget";
import type { ButtonStyleProps } from "widgets/ButtonWidget/component";
import AntProFormComponent from "./AntdForm";
import {
  useDeepCompareEffect,
  type ProFormInstance,
  type ProFormProps,
} from "@ant-design/pro-components";
import type { CheckboxGroupAlignment } from "components/constants";
import type { ProformContainerComponentProps } from "./AntdForm";
import type { FieldError } from "rc-field-form/lib/interface";

export interface JSONFormComponentProps<TValues = any>
  extends Omit<
    ProformContainerComponentProps,
    "formItems" | "formRef" | "updateWidgetProps" | "children"
  > {
  onFormOpen?: string;
  closeModalOnSubmit?: boolean;
  isCreateMode?: boolean;
  jsonFormPopType?: "modal" | "drawer";
  formMode?: "view" | "edit" | "add";
  modalWidth?: number;
  modalHeight?: number;
  maxHeight?: number;
  editTitle?: string;
  sourceData?: TValues;
  className?: string;

  isDisabled?: boolean;
  isRequired?: boolean;
  labelAlignment?: "left" | "right";
  executeAction: (action: Action) => void;
  fieldLimitExceeded: boolean;
  getFormData: () => TValues;
  fixMessageHeight: boolean;
  isWidgetMounting: boolean;
  onFormValidityUpdate: (isValid: boolean) => void;
  onSubmit: (values: TValues) => void;

  registerResetObserver: (callback: () => void) => void;
  renderMode: RenderMode;
  schema: Schema;
  unregisterResetObserver: () => void;
  setMetaInternalFieldState: (
    cb: (prevState: JSONFormWidgetState) => JSONFormWidgetState,
  ) => void;
  updateWidgetFormData: (values: TValues) => void;
  updateWidgetMetaProperty: (propertyName: string, propertyValue: any) => void;
  updateWidgetProperty: (propertyName: string, propertyValue: any) => void;
  controlSize: ProFormProps["size"];
  widgetId: string;
}

const MessageStateWrapper = styled.div<{ $fixHeight: boolean }>`
  align-items: center;
  display: flex;
  ${(props) => (props.$fixHeight ? "height: 303px" : "height: 100%")};
  justify-content: center;
`;

type MessageProps = PropsWithChildren<{
  $fixHeight: boolean;
}>;

const Message = styled(Text)<MessageProps>`
  font-size: ${TEXT_SIZES.HEADING3};
  text-align: center;
  width: 100%;
  left: 50%;
  ${(props) =>
    !props.$fixHeight
      ? `position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  `
      : ""}
`;

function InfoMessage({
  children,
  fixHeight,
}: {
  children: React.ReactNode;
  fixHeight: boolean;
}) {
  return (
    <MessageStateWrapper $fixHeight={fixHeight}>
      <Message $fixHeight={fixHeight}>{children}</Message>
    </MessageStateWrapper>
  );
}

function JSONFormComponent<TValues>(
  props: JSONFormComponentProps<TValues>,
  formRef: React.RefObject<ProFormInstance<any>>,
) {
  const {
    backgroundColor,
    className,
    controlSize,
    executeAction,
    fieldLimitExceeded,
    fixMessageHeight,
    formMode,
    getFormData,
    initialValues,
    isKeyPressSubmit,
    isSubmitting,
    isWidgetMounting,
    onCancel,
    onFormValidityUpdate,
    onSubmit,
    registerResetObserver,
    renderMode,
    resetButtonLabel,
    schema,
    setMetaInternalFieldState,
    showCancel,
    submitButtonLabel,
    unregisterResetObserver,
    updateWidgetFormData,
    updateWidgetMetaProperty,
    updateWidgetProperty,

    ...rest
  } = props;
  const isSchemaEmpty = isEmpty(schema);
  const styleProps = pick(rest, [
    "borderColor",
    "borderWidth",
    "borderRadius",
    "boxShadow",
    "boxShadowColor",
    "widgetId",
    "titleColor",
  ]);

  const renderRootField = useCallback(() => {
    const rootSchemaItem = schema[ROOT_SCHEMA_KEY];
    const RootField = FIELD_MAP[rootSchemaItem.fieldType] || Fragment;
    const propertyPath = `schema.${ROOT_SCHEMA_KEY}`;
    return (
      <RootField
        fieldClassName="root"
        isRootField
        name=""
        propertyPath={propertyPath}
        schemaItem={rootSchemaItem}
      />
    );
  }, [schema]);

  const renderComponent = useMemo(() => {
    if (fieldLimitExceeded) {
      return (
        <InfoMessage fixHeight={fixMessageHeight}>
          Source data exceeds {MAX_ALLOWED_FIELDS} fields.&nbsp;
          {renderMode === RenderModes.PAGE
            ? "请联系您的开发人员以获取更多信息"
            : "请更新源数据"}
        </InfoMessage>
      );
    }
    if (isSchemaEmpty) {
      return (
        <InfoMessage fixHeight={fixMessageHeight}>
          Connect data or paste JSON to add items to this form.
        </InfoMessage>
      );
    }

    return renderRootField();
  }, [fieldLimitExceeded, isSchemaEmpty, renderMode, renderRootField]);

  const hideFooter = fieldLimitExceeded || isSchemaEmpty;
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const formItems = useMemo(() => {
    return Object.values(schema[ROOT_SCHEMA_KEY]?.children || {}).map(
      (item) => ({
        ...item,
        name: item.accessor,
        label: item.labelText,
      }),
    );
  }, [schema]);

  console.log("JSONFormWidget ", schema[ROOT_SCHEMA_KEY], {
    schema,
    formItems,
    props,
    formRef,
  });

  return (
    <FormContextProvider
      executeAction={executeAction}
      formColorPrimary={rest.colorPrimary}
      formControlSize={controlSize}
      formIsDisabled={rest.isDisabled}
      formIsRequird={rest.isRequired}
      formLabelAlign={rest.labelAlignment}
      formLayout={rest.formLayout}
      formMode={formMode}
      formRef={formRef}
      initialValues={initialValues}
      renderMode={renderMode}
      setFieldErrors={setFieldErrors}
      setMetaInternalFieldState={setMetaInternalFieldState}
      updateWidgetFormData={updateWidgetFormData}
      updateWidgetMetaProperty={updateWidgetMetaProperty}
      updateWidgetProperty={updateWidgetProperty}
    >
      <AntProFormComponent
        {...styleProps}
        {...props}
        fieldErrors={fieldErrors}
        formItems={formItems}
        formRef={formRef}
        hideFooter={hideFooter}
        initialValues={initialValues}
        isFixedFooter={rest.isFixedFooter}
        maxHeight={props.maxHeight}
        onCancel={onCancel}
        onSubmit={onSubmit}
        showCancel={showCancel}
        size={controlSize}
        updateWidgetProps={updateWidgetProperty}
      >
        {renderComponent}
      </AntProFormComponent>
    </FormContextProvider>
  );
}

export default React.memo(React.forwardRef(JSONFormComponent));
