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
import { ProFormItem } from "@ant-design/pro-components";
import type { CascaderProps } from "antd";
import { ConfigProvider, Cascader } from "antd";
import type { InputStatus } from "antd/es/_util/statusUtils";
import { AntdFormItemContainer } from "widgets/Antd/Style";

export interface CascaderComponentProps {
  widgetName: string;
  defaultValue?: string;
  allowClear?: boolean;
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
  onDropdownOpen?: () => void;
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
  isFilterable: boolean;
  renderMode?: RenderMode;
  options?: DefaultOptionType[];
  required?: boolean;
  isHoverExpand?: boolean;
  isSearchable?: boolean;
  status?: InputStatus;
  fieldNames?: CascaderProps["fieldNames"];
  selectedOption?: CascaderProps["value"];
  isMultiple?: boolean;
}

function CascaderComponent(props: CascaderComponentProps): JSX.Element {
  console.log("级联选择 props", props);

  const {
    accentColor,
    allowClear,
    borderRadius,
    boxShadow,
    compactMode,
    defaultValue,
    disabled,
    fieldNames,
    // expandAll,
    filterText,
    isDynamicHeightEnabled,
    isFilterable,
    isHoverExpand,
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
    loading,
    onChange,
    onDropdownClose,
    onDropdownOpen,
    options,
    placeholder,
    renderMode,
    required,
    selectedOption,
    status,
    widgetId,
    widgetName,
  } = props;

  const [selectedValue, setSelectedValue] = useState<typeof selectedOption>([]);

  useEffect(() => {
    setSelectedValue(selectedOption || []);
  }, [selectedOption]);

  const onSelectionChange = useCallback((value?: any[], labelList?: any[]) => {
    console.log("级联选择 onSelectionChange value", value);
    onChange?.(value, labelList || []);
  }, []);

  const fieldNamesValue = useMemo(() => {
    const defaultFieldNames = {
      label: "label",
      value: "value",
      children: "children",
    };
    if (fieldNames?.children && fieldNames?.label && fieldNames?.value) {
      return fieldNames;
    }
    return defaultFieldNames;
  }, [fieldNames]);
  const handleFilter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1,
    );
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
              // labelFontSize: parseInt(labelTextSize || "0"),
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
          labelCol={
            labelPosition == LabelPosition.Left
              ? { span: labelWidth }
              : undefined
          }
          name={widgetName}
          required={required}
          tooltip={labelTooltip}
        >
          <Cascader
            allowClear={allowClear}
            changeOnSelect
            disabled={disabled}
            expandTrigger={isHoverExpand ? "hover" : "click"}
            fieldNames={fieldNamesValue}
            multiple={props.isMultiple}
            onChange={onSelectionChange}
            onDropdownVisibleChange={(open) =>
              open ? onDropdownOpen?.() : onDropdownClose?.()
            }
            onSearch={(value) => console.log(value)}
            options={options}
            placeholder={(placeholder as any) || "请选择"}
            showSearch={isSearchable ? { filter: handleFilter } : false}
            status={status}
            style={{
              marginBottom: 0,
            }}
            value={selectedValue}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export default CascaderComponent;
