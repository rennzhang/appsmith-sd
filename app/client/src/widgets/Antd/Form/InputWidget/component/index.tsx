// import { AutoComplete } from "antd";
// import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { Input } from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";

export interface InputComponentProps extends BaseInputComponentProps {
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
}

// export default InputComponent;
import React, { useEffect, useMemo, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import styled from "styled-components";
import { LabelPosition } from "design-system-old";
import type { InputProps } from "antd/lib";

type InputDataType = string | undefined;
const AntdAutoComplete = (props: InputComponentProps) => {
  const {
    autoFocus,
    borderRadius,
    boxShadow,
    defaultValue,
    disabled,
    errorMessage,
    inputType,
    label,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelTextColor,
    labelTextSize,
    labelWidth,
    maxChars,
    onFocusChange,
    onValueChange,
    placeholder,
    regex,
    required,
    tooltip,
    validation,
    widgetId,
    widgetName,
  } = props;

  const [value, setValue] = useState<InputDataType>();

  useEffect(() => {
    setValue(String(defaultValue));
    // setOptions(getPanelValue(String(defaultValue)));
  }, [defaultValue]);

  const ruleRegexMemo = useMemo(() => {
    if (regex) {
      return new RegExp(regex);
    }
    return undefined;
  }, [regex]);
  const validateProps = useMemo<ProFormItemProps>(() => {
    const props: ProFormItemProps = {
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
    if (required && !validation) {
      console.log("输入框 required but no validation", props);

      props.validateStatus = "error";
      props.help = errorMessage;
    }

    return props;
  }, [required, validation, errorMessage, maxChars, ruleRegexMemo]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === LabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);
  const onChange: InputProps["onChange"] = (e) => {
    setValue(e.target.value);
    onValueChange(e.target.value);
  };

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
              labelFontSize: parseInt(labelTextSize || "0"),
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
          label={label}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={tooltip}
          {...colLayoutMemo}
          {...validateProps}
        >
          <Input
            autoFocus={autoFocus}
            className="custom"
            disabled={disabled}
            maxLength={maxChars}
            onBlur={() => onFocusChange(false)}
            onChange={onChange}
            onFocus={() => onFocusChange(true)}
            // onSearch={handleSearch}
            placeholder={placeholder || "请输入内容"}
            // prefix={"<UserOutlined />"}
            style={{ width: "100%" }}
            value={value}
            // onKeyPress={handleKeyPress}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};

export default AntdAutoComplete;
