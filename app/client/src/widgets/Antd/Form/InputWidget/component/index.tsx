import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ConfigProvider, Input, InputNumber } from "antd";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { InputProps } from "antd/lib";
import type { TextAreaProps } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { AntdInputWidgetProps } from "../types";
import { omit, toNumber } from "lodash";

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
  formatterValue?: string;
}

type InputDataType = number | string | undefined;

const AntdInput: React.FC<InputComponentProps> = React.memo((props) => {
  const {
    allowClear,
    autoFocus,
    borderRadius,
    boxShadow,
    controls,
    controlSize,
    defaultValue,
    disabled,
    errorMessage,
    inputType,
    keyboard,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelWidth,
    maxChars,
    maxNum,
    minNum,
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
    widgetName,
    decimalSeparator,
    stringMode,
    step,
    formatterValue,
    precision

  } = props;

  const [value, setValue] = useState<InputDataType>(defaultValue);

  useEffect(() => {
    if (inputType === "NUMBER") {
      setValue(defaultValue !== undefined ? toNumber(defaultValue) : undefined);
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, inputType]);

  const ruleRegexMemo = useMemo(() => (regex ? new RegExp(regex) : undefined), [regex]);

  const validateProps = useMemo<ProFormItemProps>(() => {
    const validateData: ProFormItemProps = {
      required,
      rules: [
        {
          required,
          message: errorMessage,
          max: maxChars,
          pattern: ruleRegexMemo,
          validateTrigger: ["onChange", "onBlur"],
          type: inputType === "NUMBER" ? "number" : "string",
        },
      ],
    };
    if (required && validation === false) {
      validateData.validateStatus = "error";
      validateData.help = errorMessage;
    }
    return validateData;
  }, [required, validation, errorMessage, maxChars, ruleRegexMemo, inputType]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue);
  }, [onValueChange]);

  const onNumberChange = useCallback((val: number | null) => {
    const newValue = val ?? undefined;
    setValue(newValue);
    onValueChange(newValue);
  }, [onValueChange]);

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

  const getInputComponent = useCallback(() => {
    switch (inputType) {
      case "MULTI_LINE_TEXT":
        return (
          <TextArea
            {...commonProps}
            autoSize={textareaRowsControlType === "自适应" ? { minRows, maxRows } : undefined}
            onChange={(e) => onChange(e as any)}
            rows={textareaRows || 4}
          />
        );
      case "PASSWORD":
        return <Input.Password {...commonProps} />;
      case "NUMBER":
        return (
          <InputNumber
            {...omit(commonProps, "onChange")}
            controls={controls}
            keyboard={keyboard}
            max={maxNum}
            min={minNum}
            onChange={onNumberChange}
            value={value as number}
            step={step||1}
            stringMode={stringMode}
            decimalSeparator={decimalSeparator}
            precision={precision}
            // formatter={(value) => (formatterValue || value?.toString() || "").toString()}

            // parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
            // formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            // parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
          />
        );
      default:
        return <Input {...commonProps} />;
    }
  }, [inputType, commonProps, textareaRowsControlType, minRows, maxRows, textareaRows, controls, keyboard, maxNum, minNum, onNumberChange]);

  console.group("AntdInput 输入框组件");
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
              boxShadow,
            },
            InputNumber: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow,
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
});

AntdInput.displayName = "AntdInput";

export default AntdInput;
