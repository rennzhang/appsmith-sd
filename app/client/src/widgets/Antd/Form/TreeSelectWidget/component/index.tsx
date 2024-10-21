import type { ReactNode } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "rc-tree-select/assets/index.less";
import type {
  ChangeEventExtra,
  DefaultValueType,
} from "rc-tree-select/lib/interface";
import type { DefaultOptionType } from "rc-tree-select/lib/TreeSelect";
import styled from "styled-components";
import type { RenderMode, TextSize } from "constants/WidgetConstants";
import type { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { CascaderProps, TreeProps, TreeSelectProps } from "antd";
import { ConfigProvider, Cascader, Tree, TreeSelect } from "antd";
import type { InputStatus } from "antd/es/_util/statusUtils";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import {
  DownOutlined,
  FrownFilled,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import type { IconName } from "@blueprintjs/icons";
import { Icon } from "@blueprintjs/core";
import { cloneDeep } from "lodash";
import IconRenderer from "widgets/Antd/Components/IconRenderer";

export interface TreeSelectComponentProps {
  valueKey?: string;
  labelKey?: string;
  childrenKey?: string;
  widgetName?: string;
  disabled?: boolean;
  loading?: boolean;
  placeholderText?: string;
  onTreeSelectValueChange?: string;
  onChange?: (value: any, label: any) => void;
  updateSelectInfo?: (selectInfo: any) => void;
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  labelTooltip?: string;
  compactMode?: boolean;
  width?: number;
  isValid?: boolean;
  isDynamicHeightEnabled?: boolean;
  borderRadius?: string;
  boxShadow?: string;
  colorPrimary?: string;
  widgetId?: string;
  filterText?: string;
  renderMode?: RenderMode;
  options?: TreeSelectProps["treeData"];
  required?: boolean;
  isMultiple?: boolean;
  errorMessage: string;
  defaultExpandAll?: boolean;
  iconName?: IconName;
  checkable?: boolean;
  controlSize?: SizeType;
  allowClear?: boolean;
  defaultValue?: DefaultValueType;
  maxTagCount?: number;
  maxTagTextLength?: number;
  showSearch?: boolean;
  treeCheckStrictly?: boolean;
  treeDefaultExpandAll?: boolean;
  treeExpandAction?: TreeSelectProps["treeExpandAction"];
  treeLine?: boolean;
  selectedValue?: DefaultValueType;
  accessor?: string;
  onSearch?: (value: string) => void;
  onTreeSelectSearch?: string;
}

function TreeSelectComponent(props: TreeSelectComponentProps): JSX.Element {
  const {
    accessor,
    allowClear,
    borderRadius,
    boxShadow,
    checkable,
    // expandAll,
    colorPrimary,
    compactMode,
    controlSize,
    defaultExpandAll,
    defaultValue,
    disabled,
    errorMessage,
    filterText,
    iconName,
    isDynamicHeightEnabled,
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
    maxTagCount,
    maxTagTextLength,
    options,
    placeholderText,
    renderMode,
    required,
    selectedValue,
    showSearch,
    treeCheckStrictly,
    treeDefaultExpandAll,
    treeExpandAction,
    treeLine,
    updateSelectInfo,
    widgetId,
    widgetName,
    // height
  } = props;

  const [value, setValue] = useState(props.selectedValue);
  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const validateProps = useMemo<ProFormItemProps>(() => {
    const data: ProFormItemProps = {
      required,
      rules: [
        {
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
          validator: async (_rule, value) => {
            if (required) {
              if (Array.isArray(value) && value.length === 0) {
                return Promise.reject(errorMessage);
              }
              if (!Array.isArray(value) && !value) {
                return Promise.reject(errorMessage);
              }
            }
            return Promise.resolve();
          },
        },
      ],
    };

    return data;
  }, [required, errorMessage]);

  console.log(" validateProps", validateProps);

  const fieldNamesValue = useMemo(() => {
    const defaultFieldNames = {
      value: props.valueKey || "value",
      label: props.labelKey || "label",
      children: props.childrenKey || "children",
      key: props.valueKey || "value",
      title: props.labelKey || "label",
    };
    return defaultFieldNames;
  }, [props.valueKey, props.labelKey, props.childrenKey]);

  const handleFilter: TreeSelectProps["filterTreeNode"] = (
    inputValue,
    node,
  ) => {
    const labelName = fieldNamesValue.label as string;
    const valueName = fieldNamesValue.value as string;
    if (
      node[labelName].includes(inputValue) ||
      String(node[valueName]).includes(String(inputValue))
    ) {
      return true;
    }

    return false;
  };

  const onExpand: TreeSelectProps["onTreeExpand"] = (expandedKeysValue) => {
    console.group("Antd 树选择组件 onExpand");
    console.log("onExpand", expandedKeysValue);
    console.groupEnd();
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
  };

  let changeExtraInfo = {} as any;

  const onSelect: TreeSelectProps["onSelect"] = (
    selectedKeysValue,
    triggerNode,
  ) => {
    console.group("Antd 树选择组件 onSelect");
    console.log("onSelect", selectedKeysValue);
    console.log("triggerNode", triggerNode);
    console.groupEnd();

    changeExtraInfo = {
      ...changeExtraInfo,
      triggerNode,
    };
    updateSelectInfo?.(changeExtraInfo);
  };

  const onChange: TreeSelectProps["onChange"] = async (
    selectedKeysValue,
    labelList,
    ChangeEventExtra,
  ) => {
    const { isMultiple } = props;
    const value = isMultiple
      ? selectedKeysValue.map(({ value }: any) => value)
      : selectedKeysValue?.value;

    const label = isMultiple
      ? selectedKeysValue.map(({ label }: any) => label)
      : selectedKeysValue?.label;

    console.group("Antd 树选择组件 onChange");
    console.log("onChange", selectedKeysValue);
    console.log(" value", value);
    console.log(" label", label);
    console.log(" ChangeEventExtra", ChangeEventExtra);
    console.groupEnd();
    setValue(value);

    changeExtraInfo = {
      ...changeExtraInfo,
      ...ChangeEventExtra,
    };
    if (!ChangeEventExtra.selected) {
      onSelect(null, null as any);
    }

    props.onChange?.(value, label);
  };

  const onSearch: TreeSelectProps["onSearch"] = (value) => {
    console.log("onSearch", value);
    props.onSearch?.(value);
  };

  console.group("Antd 树选择组件");
  console.log(" fieldNamesValue", fieldNamesValue);
  console.log("Antd 树选择组件 props", props);
  console.groupEnd();
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
              colorPrimary: colorPrimary,
              labelColor: labelTextColor,
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            Input: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
            Select: {
              colorPrimary: colorPrimary,
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
            TreeSelect: {
              colorPrimary: colorPrimary,
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
          tooltip={labelTooltip}
          {...validateProps}
          {...colLayoutMemo}
        >
          <TreeSelect
            allowClear={allowClear}
            defaultValue={defaultValue}
            disabled={disabled}
            fieldNames={fieldNamesValue}
            filterTreeNode={handleFilter}
            maxTagCount={maxTagCount}
            maxTagTextLength={maxTagTextLength}
            multiple={props.isMultiple}
            onChange={onChange}
            onSearch={onSearch}
            onSelect={onSelect}
            onTreeExpand={onExpand}
            placeholder={placeholderText}
            showSearch={showSearch}
            size={controlSize}
            switcherIcon={
              iconName ? <IconRenderer icon={iconName} size={14} /> : undefined
            }
            treeCheckStrictly={treeCheckStrictly}
            treeCheckable={checkable}
            treeData={options}
            treeLine={treeLine}
            value={value || undefined}
            labelInValue
            // listHeight={height}
            treeDefaultExpandAll={treeDefaultExpandAll}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export default TreeSelectComponent;
