// import { AutoComplete } from "antd";
// import React from "react";
import type { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { Input } from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";

export interface InputComponentProps extends AntdInputWidgetProps {
  inputType: InputTypes;
  maxChars?: number;
  spellCheck?: boolean;
  maxNum?: number;
  minNum?: number;
  borderRadius?: string;
  boxShadow?: string;
  colorPrimary?: string;
  required?: boolean;
  emailOptions?: string[];
  options?: string | string[];
  regex?: string;
  validation: boolean;
}

// export default InputComponent;
import React, { useEffect, useMemo, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import { AntdLabelPosition } from "components/constants";
import type { AntdInputWidgetProps } from "../../InputWidget/types";
import { isNumber } from "lodash";

const mockVal = (str: InputDataType, repeat = 1) => ({
  value: String(str).repeat(repeat),
});

type InputDataType = string | undefined;
const AntdAutoComplete = (props: InputComponentProps) => {
  const {
    accessor,
    autoFocus,
    borderRadius,
    boxShadow,
    controlSize,
    defaultValue,
    disabled,
    emailOptions,
    errorMessage,
    inputType,
    isInForm,
    isRequired,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelWidth,
    maxChars,
    maxLength,
    onFocusChange,
    onKeyDown,
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
      required: isRequired,
      rules: [
        {
          required: isRequired,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
          type: inputType === "NUMBER" ? "number" : "string",
        },
      ],
      ...(isRequired &&
        validation === false && {
          validateStatus: "error",
          help: errorMessage,
        }),
    };

    ruleRegexMemo &&
      validateData.rules?.push({
        required: true,
        pattern: ruleRegexMemo,
        message: "无效输入",
        validateTrigger: ["onChange", "onBlur"],
        type: "string",
      });
    maxChars &&
      validateData.rules?.push({
        max: maxChars,
        message: `最多输入${maxChars}个字符`,
      });

    if (!isInForm) {
      if (
        isNumber(maxChars) &&
        (value?.toString()?.length || 0) > (maxChars || 0)
      ) {
        validateData.validateStatus = "error";
        validateData.help = `最多输入${maxChars}个字符`;
      }
      // ruleRegexMemo && (ruleRegexMemo.lastIndex = 0);

      if (isRequired && !value?.toString()?.trim()?.length) {
        validateData.validateStatus = "error";
        validateData.help = errorMessage;
      }

      // // ruleRegexMemo 正则校验，直接校验如果失败，则显示错误信息
      if (value && ruleRegexMemo && !ruleRegexMemo.test(value.toString())) {
        validateData.validateStatus = "error";
        validateData.help = "无效输入";
      }
    }
    return validateData;
  }, [
    isInForm,
    isRequired,
    validation,
    errorMessage,
    maxChars,
    ruleRegexMemo,
    inputType,
    value,
  ]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
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
        console.log(" getPanelValue error", error, propsOptions);
        return [];
      }
    } else {
      opt = propsOptions;
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

  console.log("AntdAutoComplete组件", {
    options,
    props,
  });

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
              labelFontSize: (labelTextSize as unknown as number) || 0,
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
          label={labelText}
          labelAlign={labelAlignment}
          name={accessor || widgetName}
          tooltip={tooltip}
          {...colLayoutMemo}
          {...validateProps}
        >
          <AutoComplete
            autoFocus={autoFocus}
            disabled={disabled}
            maxLength={maxLength}
            onBlur={() => onFocusChange(false)}
            onChange={onChange}
            onFocus={() => onFocusChange(true)}
            onKeyDown={onKeyDown}
            onSearch={handleSearch}
            onSelect={onSelect}
            options={options}
            placeholder={
              inputType === "MULTI_LINE_TEXT"
                ? null
                : placeholder || "请输入内容"
            }
            size={controlSize}
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
