// import { AutoComplete } from "antd";
// import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { Input } from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";

const { TextArea } = Input;
export interface InputComponentProps extends AntdInputWidgetProps {
  maxChars?: number;
  spellCheck?: boolean;
  maxNum?: number;
  minNum?: number;
  borderRadius?: string;
  boxShadow?: string;
  accentColor?: string;
  required?: boolean;
  regex?: string;
  validation: boolean;
  textareaRows?: number;
  showCount?: boolean;
  textareaMinRows?: number;
  textareaMaxRows?: number;
  textareaRowsControlType?: "固定值" | "自适应";
  allowClear?: boolean;
}

// export default InputComponent;
import React, { useEffect, useMemo, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import styled from "styled-components";
import type { InputProps } from "antd/lib";
import type { TextAreaProps } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { AntdInputWidgetProps } from "../types";

type InputDataType = string | undefined;
const AntdInput = (props: InputComponentProps) => {
  const {
    allowClear,
    autoFocus,
    borderRadius,
    boxShadow,
    controlSize,
    defaultValue,
    disabled,
    errorMessage,
    inputType,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelWidth,
    maxChars,
    onFocusChange,
    onValueChange,
    placeholder,
    regex,
    required,
    showCount,
    textareaMaxRows: maxRows,
    textareaMinRows: minRows,
    textareaRows,
    textareaRowsControlType,
    tooltip,
    validation,
    widgetId,
    widgetName,
  } = props;

  const [value, setValue] = useState<InputDataType>();

  useEffect(() => {
    defaultValue && setValue(String(defaultValue));
    // setOptions(getPanelValue(String(defaultValue)));
  }, [defaultValue]);

  const ruleRegexMemo = useMemo(() => {
    if (regex) {
      return new RegExp(regex);
    }
    return undefined;
  }, [regex]);
  const validateProps = useMemo<ProFormItemProps>(() => {
    const validateData: ProFormItemProps = {
      required,
      rules: [
        {
          required: required,
          message: errorMessage,
          max: maxChars,
          pattern: ruleRegexMemo,
          validateTrigger: ["onChange", "onBlur"],
        },
      ],
    };
    if (required && validation === false) {
      console.log("输入框 required but no validation", props);

      validateData.validateStatus = "error";
      validateData.help = errorMessage;
    }

    return validateData;
  }, [required, validation, errorMessage, maxChars, ruleRegexMemo]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const onChange: InputProps["onChange"] & TextAreaProps["onChange"] = (e) => {
    setValue(e.target.value);
    onValueChange(e.target.value);
  };

  const commonProps = {
    className: "antd-input",
    disabled,
    maxLength: maxChars,
    onBlur: () => onFocusChange(false),
    onChange,
    onFocus: () => onFocusChange(true),
    placeholder: placeholder || "请输入内容",
    value,
    autoFocus,
    style: { width: "100%" },
    showCount,
    allowClear,
    size: controlSize,
  };
  const getInputComponent = () => {
    switch (inputType) {
      case "MULTI_LINE_TEXT":
        return (
          <TextArea
            {...commonProps}
            autoSize={
              textareaRowsControlType == "自适应" ? { minRows, maxRows } : false
            }
            onChange={(e) => onChange(e as any)}
            rows={textareaRows || 4}
          />
        );
      case "PASSWORD":
        return <Input.Password {...commonProps} />;
      default:
        return <Input {...commonProps} />;
    }
  };
  console.group("AntdInput 输入框");
  console.log("props", props);
  console.groupEnd();

  return (
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-input-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            Input: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
          },
        }}
      >
        <ProFormItem
          disabled={disabled}
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={tooltip}
          {...colLayoutMemo}
          {...validateProps}
        >
          {getInputComponent()}
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};

export default AntdInput;
