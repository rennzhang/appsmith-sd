import React, { useMemo, useCallback } from "react";
import styled from "styled-components";
import type { ControllerRenderProps } from "react-hook-form";
import { sortBy } from "lodash";

import Accordion from "../component/Accordion";
import FieldLabel, { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import FieldRenderer from "./FieldRenderer";
import NestedFormWrapper from "../component/NestedFormWrapper";
import useUpdateAccessor from "./useObserveAccessor";
import { FIELD_MARGIN_BOTTOM } from "../component/styleConstants";
import { ObjectFieldConfig } from "../constants";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
} from "../constants";

type ObjectComponentProps = FieldComponentBaseProps & {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: string;
  boxShadow?: string;
  cellBackgroundColor?: string;
  cellBorderColor?: string;
  cellBorderWidth?: number;
  cellBorderRadius?: string;
  cellBoxShadow?: string;
};

// Note: Do not use ControllerRenderProps["name"] here for name, as it causes TS stack overflow
type ObjectFieldProps = Omit<
  BaseFieldComponentProps<ObjectComponentProps>,
  "name"
> & {
  hideAccordion?: boolean;
  name: string;
};

const COMPONENT_DEFAULT_VALUES: ObjectComponentProps = {
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelTextSize: BASE_LABEL_TEXT_SIZE,
  labelText: "",
  type: ObjectFieldConfig.type,
};

const StyledFieldsWrapper = styled.div`
  padding-top: 0;
  width: 100%;
`;

const getObjectDefaultValue = (
  passedDefaultValue: unknown,
  schemaDefaultValue: unknown,
) => {
  let defaultValue: Record<string, unknown> = {};
  if (passedDefaultValue && typeof passedDefaultValue === "object") {
    defaultValue = passedDefaultValue as Record<string, unknown>;
  }
  if (schemaDefaultValue && typeof schemaDefaultValue === "object") {
    defaultValue = schemaDefaultValue as Record<string, unknown>;
  }
  return defaultValue;
};

function ObjectField({
  fieldClassName,
  hideAccordion = false,
  hideLabel,
  inArray,
  isLastField = false,
  isRootField = false,
  name,
  passedDefaultValue,
  propertyPath,
  schemaItem,
}: ObjectFieldProps) {
  const {
    accessor,
    backgroundColor,
    isVisible = true,
    label,
    tooltip,
  } = schemaItem || {};

  useUpdateAccessor({ accessor });

  const objectPassedDefaultValue = useMemo(
    () => getObjectDefaultValue(passedDefaultValue, schemaItem.defaultValue),
    [passedDefaultValue, schemaItem.defaultValue],
  );

  const fields = useMemo(() => {
    const children = Object.values(schemaItem.children);
    const sortedChildren = sortBy(children, ({ position }) => position);

    return sortedChildren.map((schemaItem, index) => {
      const fieldName = name
        ? `${name}.${schemaItem.identifier}`
        : schemaItem.identifier;
      const fieldPropertyPath = `${propertyPath}.children.${schemaItem.identifier}`;
      const isLastField =
        index === sortedChildren.length - 1 && name.includes(".");
      return (
        <FieldRenderer
          fieldName={fieldName as ControllerRenderProps["name"]}
          isLastField={isLastField}
          key={schemaItem.identifier}
          passedDefaultValue={objectPassedDefaultValue[schemaItem.accessor]}
          propertyPath={fieldPropertyPath}
          schemaItem={schemaItem}
        />
      );
    });
  }, [schemaItem, name, propertyPath, objectPassedDefaultValue]);

  if (!isVisible) {
    return null;
  }

  const accordionClassName = `antd-jsonform-accordion-object${
    isRootField ? "" : " antd-jsonform-object-container"
  }`;

  return (
    <NestedFormWrapper
      backgroundColor={isRootField ? "transparent" : backgroundColor}
      borderColor={schemaItem.borderColor}
      borderRadius={schemaItem.borderRadius}
      borderWidth={schemaItem.borderWidth}
      boxShadow={schemaItem.boxShadow}
      className={`t--jsonformfield-${fieldClassName} NestedFormWrapper ${
        inArray ? "in-array" : ""
      } ${isLastField ? "is-last-field" : ""}`}
      isLastField={isLastField}
      labelStyle={schemaItem.labelStyle}
      labelTextColor={schemaItem.labelTextColor}
      labelTextSize={schemaItem.labelTextSize}
      withoutPadding={isRootField}
    >
      {(isRootField || hideAccordion ? (
        <StyledFieldsWrapper>{fields}</StyledFieldsWrapper>
      ) : (
        <FieldLabel
          hideLabel={hideLabel}
          isLastField={isLastField}
          {...schemaItem}
          isRootField={isRootField}
          tooltip={tooltip}
        >
          <Accordion
            backgroundColor={schemaItem.cellBackgroundColor}
            borderColor={schemaItem.cellBorderColor}
            borderRadius={schemaItem.cellBorderRadius}
            borderWidth={schemaItem.cellBorderWidth}
            boxShadow={schemaItem.cellBoxShadow}
            className={accordionClassName}
            isCollapsible={false}
          >
            <StyledFieldsWrapper>{fields}</StyledFieldsWrapper>
          </Accordion>
        </FieldLabel>
      )) || null}
    </NestedFormWrapper>
  );
}

const MemoedObjectField: FieldComponent = React.memo(ObjectField);
MemoedObjectField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoedObjectField;
