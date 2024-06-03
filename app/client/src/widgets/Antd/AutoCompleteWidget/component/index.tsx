// import { AutoComplete } from "antd";
// import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";
import { ProFormItem } from "@ant-design/pro-components";
import { Input } from "antd";

export interface InputComponentProps extends BaseInputComponentProps {
  inputType: InputTypes;
  maxChars?: number;
  spellCheck?: boolean;
  maxNum?: number;
  minNum?: number;
  borderRadius?: string;
  boxShadow?: string;
  accentColor?: string;
  required?: boolean;
  emailOptions?: string[];
  options?: string;
}

// export default InputComponent;
import React, { useEffect, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import styled from "styled-components";
export const AutoCompleteContainer = styled.div<{
  labelStyle?: string;
  alignment?: string;
  boxShadow?: string;
}>`
  width: 100%;
  .ant-form-item-label {
    font-weight: ${({ labelStyle }) => labelStyle?.includes("BOLD") && "bold"};
    font-style: ${({ labelStyle }) =>
      labelStyle?.includes("ITALIC") && "italic"};
  }
  .ant-form-item-control .ant-form-item-control-input .ant-select-selector {
    box-shadow: ${({ boxShadow }) => boxShadow};
  }
`;
const mockVal = (str: InputDataType, repeat = 1) => ({
  value: String(str).repeat(repeat),
});

type InputDataType = string | undefined;
const AntdAutoComplete = (props: InputComponentProps) => {
  const {
    autoFocus,
    borderRadius,
    boxShadow,
    defaultValue,
    disabled,
    emailOptions,
    inputType,
    label,
    labelStyle,
    labelTextColor,
    labelTextSize,
    maxChars,
    onFocusChange,
    onValueChange,
    options: propsOptions,
    placeholder,
    required,
    tooltip,
  } = props;

  const [value, setValue] = useState<InputDataType>();
  const [options, setOptions] = useState<{ value: string }[]>([]);

  useEffect(() => {
    setValue(String(defaultValue));
    // setOptions(getPanelValue(String(defaultValue)));
  }, [defaultValue]);

  useEffect(() => {
    if (inputType === "EMAIL") {
      setOptions(setEmailOptions);
    } else {
      setOptions(getPanelValue());
    }
  }, [inputType, propsOptions, emailOptions, value]);

  const setEmailOptions = () => {
    if (!value) {
      return [];
    }
    const mainText = value.includes("@") ? value.split("@")[0] : value;
    return Object.values(emailOptions || {}).map((v: any) => ({
      value: mainText + v.label,
      label: mainText + v.label,
    }));
  };
  const getPanelValue = () => {
    if (!propsOptions?.length) return [];
    return (JSON.parse(propsOptions) || [])?.map((v: string) => ({
      label: v,
      value: v,
    }));
  };

  const onSelect = (data: InputDataType) => {
    console.log("onSelect", data);
  };

  const onChange = (data: string) => {
    setValue(data);
    onValueChange(data);
  };
  const handleSearch = (data: string) => {
    if (inputType === "EMAIL") {
      setOptions(setEmailOptions);
    } else setOptions(getPanelValue());
  };

  return (
    <AutoCompleteContainer
      boxShadow={boxShadow}
      className="antd-radio-container"
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
            Select: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
          },
        }}
      >
        <ProFormItem label={label} required={required} tooltip={tooltip}>
          <AutoComplete
            autoFocus={autoFocus}
            disabled={disabled}
            maxLength={maxChars}
            onBlur={() => onFocusChange(false)}
            onChange={onChange}
            onFocus={() => onFocusChange(true)}
            onSearch={handleSearch}
            onSelect={onSelect}
            options={options}
            placeholder={
              inputType === "MULTI_LINE_TEXT"
                ? null
                : placeholder || "请输入内容"
            }
            style={{ width: "100%" }}
            value={value}
          >
            {inputType === "MULTI_LINE_TEXT" && (
              <Input.TextArea
                autoFocus={autoFocus}
                className="custom"
                placeholder={placeholder || "请输入内容"}
                prefix={"<UserOutlined />"}
                style={{ height: 50 }}
                // onKeyPress={handleKeyPress}
              />
            )}
          </AutoComplete>
        </ProFormItem>
      </ConfigProvider>
    </AutoCompleteContainer>
  );
};

export default AntdAutoComplete;
