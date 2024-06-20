import type { ReactNode } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "rc-tree-select/assets/index.less";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import type { DefaultOptionType } from "rc-tree-select/lib/TreeSelect";
import styled from "styled-components";
import type { RenderMode, TextSize } from "constants/WidgetConstants";
import type { Alignment } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { CascaderProps, TransferProps } from "antd";
import { ConfigProvider, Transfer } from "antd";
import type { InputStatus } from "antd/es/_util/statusUtils";

import { AntdFormItemContainer } from "widgets/Antd/Style";
interface RecordType {
  value: string;
  label: string;
  description: string;
}
export interface TransferComponentProps {
  errorMessage?: string;
  oneWay?: boolean;
  defaultValue?: string[];
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
  dropdownStyle?: React.CSSProperties;
  onChange: (value?: DefaultValueType, labelList?: ReactNode[]) => void;
  // expandAll: boolean;
  labelText: string;
  labelPosition?: LabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  onDropdownClose?: () => void;
  labelStyle?: string;
  labelTooltip?: string;
  compactMode: boolean;
  width: number;
  isValid: boolean;
  isDynamicHeightEnabled: boolean;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  widgetId: string;
  filterText?: string;
  renderMode?: RenderMode;
  required?: boolean;
  isSearchable?: boolean;
  status?: InputStatus;
  selectedOption?: string | CascaderProps["value"];
  isMultiple?: boolean;
  sourceData: RecordType[];
  leftTile?: string;
  rightTitle?: string;
  onSelectChange?: (payload: {
    targetSelectedKeys: string[];
    sourceSelectedKeys: string[];
  }) => void;
  listHeight?: number;
  widgetName: string;
  validation: boolean;
}

function TransferComponent(props: TransferComponentProps): JSX.Element {
  console.log("穿梭框 TransferComponent props", props);

  const {
    accentColor,
    borderRadius,
    boxShadow,
    compactMode,
    defaultValue,
    disabled,
    // expandAll,
    errorMessage,
    filterText,
    isDynamicHeightEnabled,
    isSearchable,
    isValid,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    leftTile,
    listHeight,
    loading,
    oneWay,
    placeholder,
    renderMode,
    required,
    rightTitle,
    selectedOption,
    sourceData,
    status,
    validation,
    widgetId,
    widgetName,
  } = props;
  console.log(" 穿梭框 props", props);
  const sourceDataMemo = useMemo(() => {
    console.log(" sourceData", sourceData);
    return (
      sourceData?.map((item) => {
        return {
          ...item,
          key: item.value,
          label: item.label,
          description: item.description,
        };
      }) || []
    );
  }, [sourceData]);
  const [targetKeys, setTargetKeys] =
    useState<TransferProps<any>["targetKeys"]>(defaultValue);

  useEffect(() => {
    setTargetKeys(defaultValue);
  }, [defaultValue]);
  const [selectedKeys, setSelectedKeys] = useState<
    TransferProps<any>["targetKeys"]
  >([]);

  const titlesMemo = useMemo(() => {
    return [leftTile, rightTitle];
  }, [leftTile, rightTitle]);

  const validateProps = useMemo<ProFormItemProps>(() => {
    const data: ProFormItemProps = {
      required,
      rules: [
        {
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
          validator: async (_rule, value) => {
            console.log(
              "穿梭框 [validator] value",
              value,
              props,
              required,
              validation,
              required && !validation,
            );

            // if (required && !validation) {
            if (required && !value?.length) {
              return Promise.reject(errorMessage);
            }
            return Promise.resolve();
          },
        },
      ],
    };
    if (required && !validation) {
      console.log("自动完成组件 required but no validation", data);

      data.validateStatus = "error";
      data.help = errorMessage;
    }

    return data;
  }, [required, validation, errorMessage]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === LabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);
  const onValueChange: TransferProps<any>["onChange"] = (
    nextTargetKeys,
    direction,
    moveKeys,
  ) => {
    console.log("穿梭框 [onValueChange] targetKeys:", nextTargetKeys);
    console.log("穿梭框 [onValueChange] direction:", direction);
    console.log("穿梭框 [onValueChange] moveKeys:", moveKeys);
    setTargetKeys(nextTargetKeys);
    props.onChange(nextTargetKeys);
  };

  const onSelectChange: TransferProps<any>["onSelectChange"] = (
    sourceSelectedKeys,
    targetSelectedKeys,
  ) => {
    console.log(
      "穿梭框 [onSelectChange] sourceSelectedKeys:",
      sourceSelectedKeys,
    );
    console.log(
      "穿梭框 [onSelectChange] targetSelectedKeys:",
      targetSelectedKeys,
    );
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    props.onSelectChange?.({ sourceSelectedKeys, targetSelectedKeys });
  };

  const onScroll: TransferProps<any>["onScroll"] = (direction, e) => {
    console.log("穿梭框 [onScroll] direction:", direction);
    console.log("穿梭框 [onScroll]target:", e.target);
  };

  const filterOption = (inputValue: string, option: RecordType) =>
    option.description?.indexOf?.(inputValue) > -1 ||
    option.label?.indexOf?.(inputValue) > -1;

  console.group("穿梭框 TransferComponent");
  console.log("穿梭框 TransferComponent props", props);
  console.log(" validateProps", validateProps);
  console.groupEnd();
  return (
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-transfer-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              // labelFontSize: parseInt(labelTextSize || "0"),
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            Transfer: {
              borderRadiusLG: (borderRadius as unknown as number) || 0,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={labelTooltip}
          {...colLayoutMemo}
          {...validateProps}
        >
          <Transfer
            dataSource={sourceDataMemo}
            disabled={disabled}
            filterOption={filterOption}
            listStyle={{
              width: "50%",
              height: listHeight,
            }}
            onChange={onValueChange}
            onScroll={onScroll}
            onSelectChange={onSelectChange}
            oneWay={oneWay}
            render={(item) => item.label}
            selectedKeys={selectedKeys}
            showSearch={isSearchable}
            status={status}
            targetKeys={targetKeys}
            titles={titlesMemo}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export default TransferComponent;
