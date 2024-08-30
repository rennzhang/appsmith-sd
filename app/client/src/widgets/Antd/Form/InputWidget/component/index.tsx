import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ConfigProvider, Input, InputNumber } from "antd";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import { AntdLabelPosition } from "components/constants";
import type { AntdInputWidgetProps } from "../types";
import { omit, toNumber } from "lodash";
import { Icon, IconName } from "@blueprintjs/core";

const { TextArea, Search } = Input;

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
  prefixType?: 'none' | 'icon' | 'text';
  suffixType?: 'none' | 'icon' | 'text';
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  prefixText?: string;
  suffixText?: string;
  prefixColor?: string;
  suffixColor?: string;
  addonBeforeType?: 'none' | 'icon' | 'text';
  addonAfterType?: 'none' | 'icon' | 'text';
  addonBeforeIcon?: IconName;
  addonAfterIcon?: IconName;
  addonBeforeText?: string;
  addonAfterText?: string;
  addonBeforeColor?: string;
  addonAfterColor?: string;
  searchLoading?: boolean;
}

type InputDataType = number | string | undefined;

const AntdInput: React.FC<InputComponentProps> = React.memo((props) => {
  const {
    allowClear, autoFocus, borderRadius, boxShadow, controls, controlSize,
    defaultValue, disabled, errorMessage, inputType, keyboard, labelAlignment,
    labelPosition, labelStyle, labelText, labelTextColor, labelTextSize,
    labelWidth, maxChars, maxNum, minNum, onFocusChange, onValueChange,
    placeholder, regex, required, showCount, textareaMaxRows: maxRows,
    textareaMinRows: minRows, textareaRows, textareaRowsControlType, tooltip,
    validation, widgetName, decimalSeparator, stringMode, step, precision,
    prefixType, suffixType, prefixIcon, suffixIcon, prefixText, suffixText,
    prefixColor, suffixColor, addonBeforeType, addonAfterType,
    addonBeforeIcon, addonAfterIcon, addonBeforeText, addonAfterText,
    addonBeforeColor, addonAfterColor,
  } = props;

  const [value, setValue] = useState<InputDataType>(defaultValue);

  useEffect(() => {
    setValue(inputType === "NUMBER" && defaultValue !== undefined ? toNumber(defaultValue) : defaultValue);
  }, [defaultValue, inputType]);

  const ruleRegexMemo = useMemo(() => (regex ? new RegExp(regex) : undefined), [regex]);

  const validateProps = useMemo<ProFormItemProps>(() => ({
    required,
    rules: [{
      required,
      message: errorMessage,
      max: maxChars,
      pattern: ruleRegexMemo,
      validateTrigger: ["onChange", "onBlur"],
      type: inputType === "NUMBER" ? "number" : "string",
    }],
    ...(required && validation === false && { validateStatus: "error", help: errorMessage }),
  }), [required, validation, errorMessage, maxChars, ruleRegexMemo, inputType]);

  const colLayoutMemo = useMemo(() =>
    labelPosition === AntdLabelPosition.Left
      ? { labelCol: { sm: { span: labelWidth } }, wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } } }
      : {}
    , [labelPosition, labelWidth]);

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

  const getAddonContent = useCallback(() => {
    const getContent = (type: 'none' | 'icon' | 'text', icon?: IconName, text?: string, color?: string) => {
      if (type === 'icon' && icon) {
        return <Icon icon={icon} color={color} />;
      } else if (type === 'text' && text) {
        return <span style={{ color }}>{text}</span>;
      }
      return null;
    };

    return {
      addonBefore: getContent(addonBeforeType || 'none', addonBeforeIcon, addonBeforeText, addonBeforeColor),
      addonAfter: getContent(addonAfterType || 'none', addonAfterIcon, addonAfterText, addonAfterColor),
    };
  }, [addonBeforeType, addonAfterType, addonBeforeIcon, addonAfterIcon, addonBeforeText, addonAfterText, addonBeforeColor, addonAfterColor]);

  const getPrefixSuffixContent = useCallback(() => {
    const getContent = (type: 'none' | 'icon' | 'text', icon?: IconName, text?: string, color?: string) => {
      if (type === 'icon' && icon) {
        return <Icon icon={icon} color={color} />;
      } else if (type === 'text' && text) {
        return <span style={{ color }}>{text}</span>;
      }
      return null;
    };

    return {
      prefix: getContent(prefixType || 'none', prefixIcon, prefixText, prefixColor),
      suffix: getContent(suffixType || 'none', suffixIcon, suffixText, suffixColor),
    };
  }, [prefixType, suffixType, prefixIcon, suffixIcon, prefixText, suffixText, prefixColor, suffixColor]);

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
    ...getAddonContent(),
    ...getPrefixSuffixContent(),
  };

  const getInputComponent = useCallback(() => {
    switch (inputType) {
      case "MULTI_LINE_TEXT":
        const textAreaProps = omit(commonProps, ['prefix', 'suffix', 'addonBefore', 'addonAfter']);
        return (
          <TextArea
            {...textAreaProps}
            autoSize={textareaRowsControlType === "自适应" ? { minRows, maxRows } : undefined}
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
            step={step || 1}
            stringMode={stringMode}
            decimalSeparator={decimalSeparator}
            precision={precision}
          />
        );
      case "SEARCH":
        return (
          <Search
            {...commonProps}
            onSearch={(value) => {
              // 在这里处理搜索事件
              console.log("Search:", value);
              props.onSearch?.(value);
            }}
            loading={props.searchLoading}
          />
        );
      default:
        return <Input {...commonProps} />;
    }
  }, [inputType, commonProps, textareaRowsControlType, minRows, maxRows, textareaRows, controls, keyboard, maxNum, minNum, onNumberChange]);

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
