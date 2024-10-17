import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ConfigProvider, Input, InputNumber } from "antd";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import { AntdLabelPosition } from "components/constants";
import type { AntdInputWidgetProps } from "../types";
import { isNumber, omit, toNumber } from "lodash";
import type { IconName } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
import * as AntIcons from "@ant-design/icons";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
import { InputTypes } from "../constants";

const { Search, TextArea } = Input;

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
  prefixType?: "none" | "icon" | "text";
  suffixType?: "none" | "icon" | "text";
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  prefixText?: string;
  suffixText?: string;
  prefixColor?: string;
  suffixColor?: string;
  addonBeforeType?: "none" | "icon" | "text";
  addonAfterType?: "none" | "icon" | "text";
  addonBeforeIcon?: IconName;
  addonAfterIcon?: IconName;
  addonBeforeText?: string;
  addonAfterText?: string;
  addonBeforeColor?: string;
  addonAfterColor?: string;
  searchLoading?: boolean;
  isInForm?: boolean;
  formLayout?: "vertical" | "horizontal" | "inline";
}

type InputDataType = number | string | undefined;

const AntdInput: React.FC<InputComponentProps> = React.memo((props) => {
  const {
    accessor,
    addonAfterColor,
    addonAfterIcon,
    addonAfterText,
    addonAfterType,
    addonBeforeColor,
    addonBeforeIcon,
    addonBeforeText,
    addonBeforeType,
    allowClear,
    autoFocus,
    borderRadius,
    boxShadow,
    controls,
    controlSize,
    decimalSeparator,
    defaultValue,
    errorMessage,
    formLayout,
    inputRef,
    inputType,
    isDisabled,
    isInForm,
    isRequired,
    keyboard,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelWidth,
    maxChars,
    maxLength,
    maxNum,
    minNum,
    onFocusChange,
    onKeyDown,
    onValueChange,
    placeholder,
    precision,
    prefixColor,
    prefixIcon,
    prefixText,
    prefixType,
    regex,
    showCount,
    step,
    stringMode,
    suffixColor,
    suffixIcon,
    suffixText,
    suffixType,
    textareaMaxRows: maxRows,
    textareaMinRows: minRows,
    textareaRows,
    textareaRowsControlType,
    tooltip,
    validation,
    widgetName,
  } = props;

  const [value, setValue] = useState<InputDataType>(defaultValue);

  useEffect(() => {
    setValue(
      inputType === "NUMBER" && defaultValue !== undefined
        ? toNumber(defaultValue)
        : defaultValue,
    );
  }, [defaultValue, inputType]);

  const ruleRegexMemo = useMemo(
    () => (regex ? new RegExp(regex) : undefined),
    [regex],
  );

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
    isRequired,
    validation,
    errorMessage,
    maxChars,
    ruleRegexMemo,
    inputType,
    value,
    isInForm,
  ]);

  const colLayoutMemo = useMemo(() => {
    return labelPosition === AntdLabelPosition.Left
      ? {
          labelCol: { sm: { span: labelWidth } },
          wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
        }
      : {};
  }, [labelPosition, labelWidth]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onValueChange(newValue);
    },
    [onValueChange],
  );

  const onNumberChange = useCallback(
    (val: number | null) => {
      const newValue = val ?? undefined;
      setValue(newValue);
      onValueChange(newValue);
    },
    [onValueChange],
  );

  const commonProps = {
    ref: inputRef,
    className: "antd-input",
    disabled: isDisabled,
    maxLength: maxLength,
    onBlur: () => onFocusChange(false),
    onChange,
    onFocus: () => onFocusChange(true),
    onKeyDown,
    placeholder: placeholder || "请输入内容",
    value,
    autoFocus,
    style: { width: "100%" },
    showCount,
    allowClear,
    size: controlSize,
    addonBefore: IconRenderer({
      type: addonBeforeType,
      icon: addonBeforeIcon,
      text: addonBeforeText,
      color: addonBeforeColor,
    }),
    addonAfter: IconRenderer({
      type: addonAfterType,
      icon: addonAfterIcon,
      text: addonAfterText,
      color: addonAfterColor,
    }),
    prefix: IconRenderer({
      type: prefixType,
      icon: prefixIcon,
      text: prefixText,
      color: prefixColor,
    }),
    suffix: IconRenderer({
      type: suffixType,
      icon: suffixIcon,
      text: suffixText,
      color: suffixColor,
    }),
  };
  console.log(` Antd 输入框组件`, {
    props,
    value,
    ruleRegexMemo,
    validateProps,
    colLayoutMemo,
  });
  const getInputComponent = useCallback(() => {
    switch (inputType) {
      case InputTypes.MULTI_LINE_TEXT:
        const textAreaProps = omit(commonProps, [
          "prefix",
          "suffix",
          "addonBefore",
          "addonAfter",
        ]);
        return (
          <TextArea
            {...textAreaProps}
            autoSize={
              textareaRowsControlType === "自适应"
                ? { minRows, maxRows }
                : undefined
            }
            rows={textareaRows || 4}
          />
        );
      case InputTypes.PASSWORD:
        return <Input.Password {...commonProps} />;
      case InputTypes.NUMBER:
        return (
          <InputNumber
            {...omit(commonProps, "onChange")}
            controls={controls}
            decimalSeparator={decimalSeparator}
            keyboard={keyboard}
            max={maxNum}
            min={minNum}
            onChange={onNumberChange}
            precision={precision}
            step={step || 1}
            stringMode={stringMode}
            value={value as number}
          />
        );
      case InputTypes.SEARCH:
        return (
          <Search
            {...commonProps}
            loading={props.searchLoading}
            onSearch={(value) => {
              // 在这里处理搜索事件
              console.log("Search:", value);
              props.onSearch?.(value);
            }}
          />
        );
      default:
        return <Input {...commonProps} />;
    }
  }, [
    inputType,
    commonProps,
    textareaRowsControlType,
    minRows,
    maxRows,
    textareaRows,
    controls,
    keyboard,
    maxNum,
    minNum,
    onNumberChange,
  ]);

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
          disabled={isDisabled}
          label={labelText}
          labelAlign={labelAlignment}
          name={accessor || widgetName}
          required={isRequired}
          tooltip={tooltip}
          validateTrigger={["onChange", "onBlur"]}
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
