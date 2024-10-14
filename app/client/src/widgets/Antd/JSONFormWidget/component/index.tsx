import type { PropsWithChildren } from "react";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import { Text } from "@blueprintjs/core";

import Form from "./Form";
import type { BoxShadow } from "components/designSystems/appsmith/WidgetStyleContainer";
import WidgetStyleContainer from "components/designSystems/appsmith/WidgetStyleContainer";
import type { Color } from "constants/Colors";
import type { Schema } from "../constants";
import { FIELD_MAP, MAX_ALLOWED_FIELDS, ROOT_SCHEMA_KEY } from "../constants";
import { FormContextProvider } from "../FormContext";
import { isEmpty, pick } from "lodash";
import type { RenderMode } from "constants/WidgetConstants";
import { RenderModes, TEXT_SIZES } from "constants/WidgetConstants";
import type { Action, JSONFormWidgetState } from "../widget";
import type { ButtonStyleProps } from "widgets/ButtonWidget/component";
import AntProFormComponent from "./AntdForm";
import type { ProFormInstance } from "@ant-design/pro-components";

type StyledContainerProps = {
  backgroundColor?: string;
};

export type JSONFormComponentProps<TValues = any> = {
  disabled?: boolean;
  validateOnly?: boolean;
  isKeyPressSubmit?: boolean;
  isRequired?: boolean;
  backgroundColor?: string;
  borderColor?: Color;
  borderRadius?: number;
  borderWidth?: number;
  boxShadow?: BoxShadow;
  boxShadowColor?: string;
  disabledWhenInvalid?: boolean;
  executeAction: (action: Action) => void;
  fieldLimitExceeded: boolean;
  fixedFooter: boolean;
  getFormData: () => TValues;
  fixMessageHeight: boolean;
  isWidgetMounting: boolean;
  isSubmitting: boolean;
  onFormValidityUpdate: (isValid: boolean) => void;
  onSubmit: (values: TValues) => void;
  registerResetObserver: (callback: () => void) => void;
  renderMode: RenderMode;
  resetButtonLabel: string;
  resetButtonStyles: ButtonStyleProps;
  schema: Schema;
  scrollContents: boolean;
  submitButtonLabel: string;
  unregisterResetObserver: () => void;
  setMetaInternalFieldState: (
    cb: (prevState: JSONFormWidgetState) => JSONFormWidgetState,
  ) => void;
  showReset: boolean;
  submitButtonStyles: ButtonStyleProps;
  title: string;
  updateFormData: (values: TValues) => void;
  updateWidgetMetaProperty: (propertyName: string, propertyValue: any) => void;
  updateWidgetProperty: (propertyName: string, propertyValue: any) => void;
  widgetId: string;
  widgetName: string;
  validateMessage?: string;
  initialValues?: Record<string, any>;
};

const StyledContainer = styled(WidgetStyleContainer)<StyledContainerProps>`
  background: ${({ backgroundColor }) => backgroundColor || "#fff"};
  overflow-y: auto;
`;

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
  ref: React.RefObject<ProFormInstance<any>> | null,
) {
  const {
    backgroundColor,
    executeAction,
    fieldLimitExceeded,
    fixMessageHeight,
    formData,
    getFormData,
    initialValues,
    isKeyPressSubmit,
    isSubmitting,
    isWidgetMounting,
    onFormValidityUpdate,
    onSubmit,
    registerResetObserver,
    renderMode,
    resetButtonLabel,
    schema,
    setMetaInternalFieldState,
    submitButtonLabel,
    unregisterResetObserver,
    updateFormData,
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
  ]);

  const renderRootField = useCallback(() => {
    const rootSchemaItem = schema[ROOT_SCHEMA_KEY];
    const RootField = FIELD_MAP[rootSchemaItem.fieldType] || Fragment;
    const propertyPath = `schema.${ROOT_SCHEMA_KEY}`;

    console.log("renderRootField", {
      ref,
    });

    return (
      <RootField
        fieldClassName="root"
        isRootField
        name=""
        propertyPath={propertyPath}
        schemaItem={rootSchemaItem}
      />
    );
  }, [ref, schema]);

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

  // formRef console.log();

  useEffect(() => {
    console.log("JSONFormWidget formRef", ref);
  }, [ref]);

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
  });

  return (
    <FormContextProvider
      executeAction={executeAction}
      formIsRequird={rest.isRequired}
      formRef={ref}
      renderMode={renderMode}
      setMetaInternalFieldState={setMetaInternalFieldState}
      updateFormData={updateFormData}
      updateWidgetMetaProperty={updateWidgetMetaProperty}
      updateWidgetProperty={updateWidgetProperty}
    >
      <AntProFormComponent
        backgroundColor={backgroundColor}
        disabled={rest.disabled}
        formItems={formItems}
        formRef={ref}
        getFormData={getFormData}
        hideFooter={hideFooter}
        initialValues={initialValues}
        isKeyPressSubmit={isKeyPressSubmit}
        onSubmit={onSubmit}
        submitButtonLabel={submitButtonLabel}
        title={rest.title}
        updateWidgetProps={updateWidgetProperty}
        validateMessage={rest.validateMessage}
        validateOnly={rest.validateOnly}
        widgetId={rest.widgetId}
        widgetName={rest.widgetName}
        isSubmitting={isSubmitting}
        // onSubmit={rest.onSubmit}
        resetButtonLabel={resetButtonLabel}
        disabledWhenInvalid={rest.disabledWhenInvalid}

        // submitButtonStyles={rest.submitButtonStyles}
        showReset={rest.showReset}
        // resetButtonStyles={rest.resetButtonStyles}
        updateFormData={updateFormData}
      >
        {renderComponent}
      </AntProFormComponent>
      {/* <StyledContainer backgroundColor={backgroundColor} {...styleProps}>
        <Form
          disabledWhenInvalid={rest.disabledWhenInvalid}
          fixedFooter={rest.fixedFooter}
          isWidgetMounting={isWidgetMounting}
          onFormValidityUpdate={onFormValidityUpdate}
          registerResetObserver={registerResetObserver}
          schema={schema}
          scrollContents={rest.scrollContents}
          stretchBodyVertically={isSchemaEmpty}
          unregisterResetObserver={unregisterResetObserver}
        >
          {renderComponent}
        </Form>
      </StyledContainer> */}
    </FormContextProvider>
  );
}

export default React.memo(React.forwardRef(JSONFormComponent));
