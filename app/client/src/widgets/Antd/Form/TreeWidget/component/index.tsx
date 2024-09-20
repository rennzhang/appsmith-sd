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
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { CascaderProps, TreeProps } from "antd";
import { ConfigProvider, Cascader, Tree } from "antd";
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
import IconRenderer from "widgets/Antd/Components/IconRenderer";

export interface TreeComponentProps extends TreeProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  widgetName: string;
  defaultCheckedKeys?: string[];
  disabled?: boolean;
  loading?: boolean;
  onCheckChange: TreeProps["onCheck"];
  onSelectChange?: TreeProps["onSelect"];
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
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
  options?: TreeProps["treeData"];
  required?: boolean;
  isSearchable?: boolean;
  checkedKeys?: TreeProps["checkedKeys"];
  isMultiple?: boolean;
  errorMessage: string;
  defaultExpandAll?: boolean;
  iconName?: IconName;
}

function TreeComponent(props: TreeComponentProps): JSX.Element {
  const {
    accentColor,
    blockNode,
    borderRadius,
    boxShadow,
    checkable,
    checkedKeys,
    // expandAll,
    compactMode,
    defaultCheckedKeys,
    defaultExpandAll,
    defaultSelectedKeys,
    disabled,
    errorMessage,
    filterText,
    height,
    iconName,
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
    loading,
    onCheckChange,
    onSelectChange,
    options,
    renderMode,
    required,
    selectable,
    selectedKeys,
    showLine,
    widgetId,
    widgetName,
  } = props;

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
    const props: ProFormItemProps = {
      required,
      rules: [
        {
          type: "array",
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
        },
      ],
    };

    return props;
  }, [required, errorMessage]);

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

  const handleFilter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1,
    );

  // 监听 selectable，如果为 false，则 selectedKeys 为空数组
  useEffect(() => {
    if (!selectable) {
      onSelectChange?.([], null as any);
    }
  }, [selectable]);

  const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
    console.group("Antd 树组件");
    console.log("onExpand", expandedKeysValue);
    console.groupEnd();
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
  };

  const onCheck: TreeProps["onCheck"] = (checkedKeysValue, info) => {
    console.group("Antd 树组件");
    console.log("onCheck", checkedKeysValue);
    console.log("info", info);
    console.groupEnd();
    onCheckChange?.(checkedKeysValue, info);
  };

  const onSelect: TreeProps["onSelect"] = (selectedKeysValue, info) => {
    console.group("Antd 树组件");
    console.log("onSelect", selectedKeysValue);
    console.log("info", info);
    console.log(" onSelectChange", onSelectChange);
    console.groupEnd();
    onSelectChange?.(selectedKeysValue, info);
  };

  console.group("Antd 树组件");
  console.log("Antd 树组件 props", props);
  console.groupEnd();
  return (
    <AntdFormItemContainer
      borderRadius={borderRadius}
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

            Tree: {
              borderRadius: (borderRadius as unknown as number) || 0,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={labelTooltip}
          {...validateProps}
          {...colLayoutMemo}
        >
          <Tree
            autoExpandParent
            blockNode={blockNode}
            checkable={checkable}
            checkedKeys={checkedKeys}
            defaultCheckedKeys={defaultCheckedKeys}
            defaultExpandAll={defaultExpandAll}
            defaultExpandParent
            defaultSelectedKeys={defaultSelectedKeys}
            disabled={disabled}
            fieldNames={fieldNamesValue}
            height={height}
            multiple={props.isMultiple}
            onCheck={onCheck}
            onExpand={onExpand}
            onSelect={onSelect}
            selectable={selectable}
            selectedKeys={selectedKeys}
            showIcon
            showLine={showLine}
            switcherIcon={
              iconName ? <IconRenderer icon={iconName} size={14} /> : undefined
            }
            treeData={options}
            // switcherIcon={<SmileOutlined />}

            // showSearch={isSearchable ? { filter: handleFilter } : false}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export default TreeComponent;
