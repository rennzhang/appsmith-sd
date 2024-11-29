import React from "react";
import styled from "styled-components";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdLabelPosition } from "components/constants";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import {
  Input,
  Dropdown,
  Pagination,
  Tooltip,
  ConfigProvider,
  Space,
} from "antd";
import * as Icons from "@ant-design/icons";
import { IconNames } from "@blueprintjs/icons";
import type { IconName } from "@blueprintjs/icons";
import { useState, useEffect, useMemo, useRef } from "react";
import IconRenderer from "widgets/Antd/Components/IconRenderer";

// 常量和类型定义
const NONE = "(none)";
const ANT_PREFIX = "ant-design:";
type IconType = IconName | typeof NONE | string;
// 缓存
const iconCache = new Map<string, React.ComponentType>();
const antIconListCache = new Map<string, string[]>();
export interface IconSelectComponentProps {
  borderRadius?: string;
  boxShadow?: string;
  isDisabled?: boolean;
  accessor?: string | string[];
  controlSize?: "small" | "middle" | "large";
  defaultValue?: string;
  labelAlignment?: "left" | "right";
  labelPosition?: AntdLabelPosition;
  labelStyle?: string;
  labelText?: string;
  labelTextColor?: string;
  labelTextSize?: number | string;
  labelWidth?: number | string;
  widgetName: string;
  labelTooltip?: string;
  disabled?: boolean;
  required?: boolean;
  textSize?: string;
  textColor?: string;
  textStyle?: string;
  value?: string;
  onChange?: (value?: string) => void;
}

const IconSelectPanel = styled.div`
  width: 380px;
  max-height: 320px;
  min-height: 220px;
  padding: 10px !important;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: var(--ads-v2-shadow-raised);

  .search-container {
    flex: 0 0 auto;
  }

  .icon-container {
    flex: 1;
    overflow-y: auto;
  }

  .icon-item {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ads-v2-color-border);
    border-radius: var(--ads-v2-border-radius);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--ads-v2-color-bg-subtle);
      .anticon {
        color: var(--ads-v2-color-primary);
        transform: scale(1.1);
      }
    }

    .anticon {
      font-size: 16px;
      color: var(--ads-v2-color-fg);
      transition: all 0.3s;
    }
  }

  .pagination-container {
    flex: 0 0 auto;
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
`;

const SearchInput = styled(Input.Search)`
  margin-bottom: 12px;
`;

const renderIcon = (icon: IconType) => {
  return IconRenderer({
    icon: icon === NONE ? "无" : icon,
    text: icon === NONE ? "无" : undefined,
    type: icon === NONE ? "text" : "icon",
  });
};

const AntdIconSelect = (props: IconSelectComponentProps) => {
  const {
    accessor,
    borderRadius,
    boxShadow,
    controlSize,
    defaultValue,
    disabled,
    isDisabled,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    onChange,
    required,
    value,
    widgetName,
  } = props;

  const [selectedIcon, setSelectedIcon] = useState(value);
  const [iconList, setIconList] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(72);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIcon(defaultValue);
  }, [defaultValue]);
  useEffect(() => {
    setSelectedIcon(value);
  }, [value]);
  const preloadIconList = async () => {
    if (antIconListCache.has("list")) {
      setLoadedIcons(antIconListCache.get("list") || []);
      return;
    }

    try {
      // 修改导入方式
      const module = await import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: "antd-icons-" */
        "@ant-design/icons"
      );

      const iconList = Object.keys(module)
        .filter(
          (key) =>
            typeof module[key] === "object" && !key.includes("IconProvider"),
        )
        .map((key) => `${ANT_PREFIX}${key}`);

      antIconListCache.set("list", iconList);
      setLoadedIcons(iconList);
    } catch (error) {
      console.error("Failed to load icon list:", error);
      setLoadedIcons([]);
    }
  };
  useEffect(() => {
    preloadIconList();
  }, []);

  const getIconNames = (): IconType[] => {
    const blueprintIcons = Object.keys(IconNames).map<IconType>(
      (name: string) => IconNames[name as keyof typeof IconNames],
    );

    return [NONE, ...loadedIcons, ...blueprintIcons];
  };

  useEffect(() => {
    const iconNames = getIconNames();
    console.log("iconNames", iconNames);

    setIconList(iconNames);
  }, [loadedIcons]);

  const colLayoutMemo = React.useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const filteredIcons = useMemo(() => {
    return iconList.filter((name) =>
      name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [iconList, searchValue]);

  const paginatedIcons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredIcons.slice(startIndex, startIndex + pageSize);
  }, [filteredIcons, currentPage, pageSize]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    size && setPageSize(size);
  };

  const getIconPrefix = (iconName: string) => {
    if (Object.keys(Icons).includes(iconName)) {
      return "Antd: ";
    }
    if (Object.keys(IconNames).includes(iconName)) {
      return "Blueprint: ";
    }
    return "";
  };

  const dropdownContent = (
    <IconSelectPanel className="ant-dropdown-menu">
      <div className="search-container">
        <SearchInput
          allowClear
          onChange={(e) => {
            setSearchValue(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="搜索图标"
          value={searchValue}
        />
      </div>
      <div className="icon-container">
        <Space align="center" size={[6, 16]} wrap>
          {paginatedIcons.map((iconName) => (
            <Tooltip
              key={iconName}
              placement="bottom"
              title={`${getIconPrefix(iconName)}${iconName}`}
            >
              <div
                className="icon-item"
                onClick={() => {
                  const selectedIcon = iconName === NONE ? undefined : iconName;
                  setSelectedIcon(selectedIcon);
                  onChange?.(selectedIcon);
                  setDropdownOpen(false);
                }}
              >
                {renderIcon(iconName)}
              </div>
            </Tooltip>
          ))}
        </Space>
      </div>
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          defaultPageSize={72}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          pageSize={pageSize}
          pageSizeOptions={[10, 36, 54, 72, filteredIcons.length]}
          showLessItems
          showQuickJumper={false}
          showSizeChanger
          size="small"
          total={filteredIcons.length}
        />
      </div>
    </IconSelectPanel>
  );

  const DropdownInput = useMemo(() => {
    const IconComponent = selectedIcon && renderIcon(selectedIcon);

    return (
      <Input
        addonBefore={IconComponent}
        disabled={isDisabled}
        placeholder="点击选择图标"
        readOnly
        size={controlSize}
        value={selectedIcon}
      />
    );
  }, [selectedIcon, controlSize, isDisabled]);

  return (
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-icon-select-container antd-input-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
      ref={containerRef}
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
          label={labelText}
          labelAlign={labelAlignment}
          name={accessor || widgetName}
          required={required}
          tooltip={labelTooltip}
          {...colLayoutMemo}
        >
          <Dropdown
            dropdownRender={() => dropdownContent}
            onOpenChange={setDropdownOpen}
            open={dropdownOpen}
            trigger={["click"]}
          >
            {DropdownInput}
          </Dropdown>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};

export default AntdIconSelect;
