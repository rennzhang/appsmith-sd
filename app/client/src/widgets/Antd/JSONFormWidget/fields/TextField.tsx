import React, { useMemo } from "react";
import { omit } from "lodash";

import FormContext from "../FormContext";
import type { TextDisplayComponentProps } from "widgets/Antd/Form/TextWidget/component";
import TextDisplayComponent from "widgets/Antd/Form/TextWidget/component";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
} from "../constants";
import { TextWidgetConfig } from "../constants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

type TextComponentProps = FieldComponentBaseProps & TextDisplayComponentProps;

type TextFieldProps = BaseFieldComponentProps<TextComponentProps>;

const COMPONENT_DEFAULT_VALUES: TextComponentProps = {
  ...omit(TextWidgetConfig.defaults, ["defaultValue"]),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  type: TextWidgetConfig.type,
};

function TextField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: TextFieldProps) {
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const fieldComponent = useMemo(() => {
    return (
      <TextDisplayComponent
        {...schemaItem}
        {...commonProps}
        widgetName={name}
      />
    );
  }, [schemaItem, commonProps, name]);

  return fieldComponent;
}

TextField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default TextField;
