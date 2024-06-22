// import { AutoComplete } from "antd";
// import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { Input } from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";

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
  options?: string | string[];
  regex?: string;
  validation: boolean;
}

// export default InputComponent;
import React, { useEffect, useMemo, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import styled from "styled-components";
import { LabelPosition } from "design-system-old";
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
    options: propsOptions,
    placeholder,
    regex,
    required,
    tooltip,
    validation,
    widgetId,
    widgetName,
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
      console.log("自动完成组件 required but no validation", props);

      validateData.validateStatus = "error";
      validateData.help = errorMessage;
    }

    return validateData;
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
    let opt = [];
    if (typeof propsOptions === "string") {
      try {
        opt = JSON.parse(propsOptions) || [];
      } catch (error) {
        console.log(" error", error, propsOptions);
        return [];
      }
    }
    return opt.map((v: string) => ({
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
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-radio-container"
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
            Select: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
          },
        }}
      >
        <ProFormItem
          label={label}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={tooltip}
          {...colLayoutMemo}
          {...validateProps}
        >
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
    </AntdFormItemContainer>
  );
};

export default AntdAutoComplete;
