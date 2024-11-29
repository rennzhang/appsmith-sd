import * as React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Alignment, Button, Classes, MenuItem } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import { IconNames } from "@blueprintjs/icons";
import type { ItemListRenderer, ItemRenderer } from "@blueprintjs/select";
import { Select } from "@blueprintjs/select";
import type { GridListProps, VirtuosoGridHandle } from "react-virtuoso";
import { VirtuosoGrid } from "react-virtuoso";
import { useState, useEffect } from "react";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import { replayHighlightClass } from "globalStyles/portals";
import _ from "lodash";
import { generateReactKey } from "utils/generators";
import { emitInteractionAnalyticsEvent } from "utils/AppsmithUtils";
import { Tooltip } from "design-system";

// 接口定义
export interface IconSelectControlProps extends ControlProps {
  propertyValue?: IconName;
  defaultIconName?: IconName;
  showAntdIcon?: boolean;
  disableAntdTwoToneIcon?: boolean;
}

export interface IconSelectControlState {
  activeIcon: IconType;
  isOpen: boolean;
  loadedIcons: string[];
}

// 样式定义
const IconSelectContainerStyles = createGlobalStyle<{
  targetWidth: number | undefined;
  id: string;
}>`
  ${({ id, targetWidth }) => `
    .icon-select-popover-${id} {
      width: ${targetWidth}px;
      background: white;
      .bp3-input-group {
        margin: 5px !important;
      }
    }
    .bp3-button-text {
      color: var(--ads-v2-color-fg) !important;
    }
    .bp3-icon {
      color: var(--ads-v2-color-fg) !important;
    }
  `}
`;

const StyledButton = styled(Button)`
  box-shadow: none !important;
  border: 1px solid var(--ads-v2-color-border);
  border-radius: var(--ads-v2-border-radius);
  height: 36px;
  background-color: #ffffff !important;
  > span.bp3-icon-caret-down {
    color: rgb(169, 167, 167);
  }
  &:hover {
    border: 1px solid var(--ads-v2-color-border-emphasis);
  }
  &:focus {
    outline: var(--ads-v2-border-width-outline) solid
      var(--ads-v2-color-outline);
    border: 1px solid var(--ads-v2-color-border-emphasis);
  }
`;

const StyledMenu = styled.ul<GridListProps>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(50px, auto);
  gap: 8px;
  max-height: 170px !important;
  padding-left: 5px !important;
  padding-right: 5px !important;
  & li {
    list-style: none;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  flex-direction: column;
  align-items: center;
  padding: 13px 5px;
  &:active,
  &.bp3-active {
    background-color: var(--ads-v2-color-bg-muted) !important;
    border-radius: var(--ads-v2-border-radius) !important;
  }
  &:hover {
    background-color: var(--ads-v2-color-bg-subtle) !important;
    border-radius: var(--ads-v2-border-radius) !important;
  }
  > span.bp3-icon,
  > .anticon {
    margin-right: 0;
    color: var(--ads-v2-color-fg) !important;
  }
  > div {
    width: 100%;
    text-align: center;
    color: var(--ads-v2-color-fg) !important;
  }
`;

// 常量和类型定义
const NONE = "(none)";
const ANT_PREFIX = "ant-design:";
type IconType = IconName | typeof NONE | string;

// 缓存
const iconCache = new Map<string, React.ComponentType>();
const antIconListCache = new Map<string, string[]>();

const TypedSelect = Select.ofType<IconType>();

class IconSelectControl extends BaseControl<
  IconSelectControlProps,
  IconSelectControlState
> {
  private iconSelectTargetRef: React.RefObject<HTMLButtonElement>;
  private virtuosoRef: React.RefObject<VirtuosoGridHandle>;
  private initialItemIndex: number;
  private filteredItems: Array<IconType>;
  private searchInput: React.RefObject<HTMLInputElement>;
  private searchIndex: Map<string, IconType[]>;
  id: string = generateReactKey();

  constructor(props: IconSelectControlProps) {
    super(props);
    this.iconSelectTargetRef = React.createRef();
    this.virtuosoRef = React.createRef();
    this.searchInput = React.createRef();
    this.initialItemIndex = 0;
    this.filteredItems = [];
    this.searchIndex = new Map();
    this.state = {
      activeIcon: props.propertyValue ?? NONE,
      isOpen: false,
      loadedIcons: [],
    };
  }

  private debouncedSetState = _.debounce(
    (obj: Partial<IconSelectControlState>, callback?: () => void) => {
      this.setState(
        (prevState) => ({
          ...prevState,
          ...obj,
        }),
        callback,
      );
    },
    300,
    {
      leading: true,
      trailing: false,
    },
  );

  componentDidMount() {
    document.body.addEventListener("keydown", this.handleKeydown);
    if (this.props.showAntdIcon || this.isAntdComponent()) {
      this.preloadIconList();
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this.handleKeydown);
  }

  isAntdComponent = () => {
    return this.props.widgetProperties.type.toLowerCase().includes("antd");
  };

  private handleQueryChange = _.debounce(() => {
    if (this.filteredItems.length === 2)
      this.setState({ activeIcon: this.filteredItems[1] });
  }, 50);

  private async preloadIconList() {
    if (antIconListCache.has("list")) {
      this.setState({ loadedIcons: antIconListCache.get("list") || [] });
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
        .filter((key) => typeof module[key] === "object")
        .filter((key) => {
          if (this.props.disableAntdTwoToneIcon) {
            return !key.endsWith("TwoTone");
          }
          return true;
        })
        .map((key) => `${ANT_PREFIX}${key}`);

      antIconListCache.set("list", iconList);
      this.setState({ loadedIcons: iconList });
    } catch (error) {
      console.error("Failed to load icon list:", error);
      this.setState({ loadedIcons: [] });
    }
  }

  // 修改 preloadIcon 方法
  private preloadIcon(iconName: IconType) {
    if (iconName === NONE || !iconName.startsWith(ANT_PREFIX)) return;

    const name = iconName.slice(ANT_PREFIX.length);
    if (iconCache.has(name)) return;

    // 修改动态导入方式
    import(
      /* webpackMode: "lazy" */
      /* webpackChunkName: "antd-icons" */
      "@ant-design/icons"
    )
      .then((module) => {
        if (module && module[name]) {
          iconCache.set(name, module[name]);
        }
      })
      .catch((error) => {
        console.error(`Failed to preload icon: ${name}`, error);
      });
  }

  private setActiveIcon(iconIndex: number) {
    this.setState(
      {
        activeIcon: this.filteredItems[iconIndex],
      },
      () => {
        if (this.virtuosoRef.current) {
          this.virtuosoRef.current.scrollToIndex(iconIndex);
        }
      },
    );
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (this.state.isOpen) {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          this.setState({
            isOpen: false,
            activeIcon: this.props.propertyValue ?? NONE,
          });
          break;
        case "ArrowDown":
        case "Down": {
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          if (document.activeElement === this.searchInput.current) {
            (document.activeElement as HTMLElement).blur();
            if (this.initialItemIndex < 0) this.initialItemIndex = -4;
            else break;
          }
          const nextIndex = this.initialItemIndex + 4;
          if (nextIndex < this.filteredItems.length)
            this.setActiveIcon(nextIndex);
          e.preventDefault();
          break;
        }
        case "ArrowUp":
        case "Up": {
          if (document.activeElement === this.searchInput.current) {
            break;
          } else if (
            (e.shiftKey ||
              (this.initialItemIndex >= 0 && this.initialItemIndex < 4)) &&
            this.searchInput.current
          ) {
            emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
              key: e.key,
            });
            this.searchInput.current.focus();
            break;
          }
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          const nextIndex = this.initialItemIndex - 4;
          if (nextIndex >= 0) this.setActiveIcon(nextIndex);
          e.preventDefault();
          break;
        }
        case "ArrowRight":
        case "Right": {
          if (document.activeElement === this.searchInput.current) {
            break;
          }
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          const nextIndex = this.initialItemIndex + 1;
          if (nextIndex < this.filteredItems.length)
            this.setActiveIcon(nextIndex);
          e.preventDefault();
          break;
        }
        case "ArrowLeft":
        case "Left": {
          if (document.activeElement === this.searchInput.current) {
            break;
          }
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          const nextIndex = this.initialItemIndex - 1;
          if (nextIndex >= 0) this.setActiveIcon(nextIndex);
          e.preventDefault();
          break;
        }
        case " ":
        case "Enter": {
          if (
            this.searchInput.current === document.activeElement &&
            this.filteredItems.length !== 2
          )
            break;
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          this.handleIconChange(
            this.filteredItems[this.initialItemIndex],
            true,
          );
          this.debouncedSetState({ isOpen: false });
          e.preventDefault();
          e.stopPropagation();
          break;
        }
        case "Escape": {
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: e.key,
          });
          this.setState({
            isOpen: false,
            activeIcon: this.props.propertyValue ?? NONE,
          });
          e.stopPropagation();
        }
      }
    } else if (this.iconSelectTargetRef.current === document.activeElement) {
      switch (e.key) {
        case "ArrowUp":
        case "Up":
        case "ArrowDown":
        case "Down":
          this.debouncedSetState({ isOpen: true }, this.handleButtonClick);
          break;
        case "Tab":
          emitInteractionAnalyticsEvent(this.iconSelectTargetRef.current, {
            key: `${e.shiftKey ? "Shift+" : ""}${e.key}`,
          });
          break;
      }
    }
  };

  private handleButtonClick = () => {
    setTimeout(() => {
      if (this.virtuosoRef.current) {
        this.virtuosoRef.current.scrollToIndex(this.initialItemIndex);
      }
    }, 0);
  };

  private renderMenu: ItemListRenderer<IconType> = ({
    activeItem,
    filteredItems,
    renderItem,
  }) => {
    this.filteredItems = filteredItems;
    this.initialItemIndex = filteredItems.findIndex((x) => x === activeItem);

    return (
      <VirtuosoGrid
        components={{ List: StyledMenu }}
        computeItemKey={(index) => filteredItems[index]}
        initialItemCount={16}
        itemContent={(index) => {
          const icon = filteredItems[index];
          if (
            index < this.initialItemIndex + 20 &&
            index > this.initialItemIndex - 20
          ) {
            this.preloadIcon(icon);
          }
          return renderItem(icon, index);
        }}
        overscan={20}
        ref={this.virtuosoRef}
        style={{ height: "165px" }}
        tabIndex={-1}
        totalCount={filteredItems.length}
      />
    );
  };

  private getIconNames(): IconType[] {
    const { loadedIcons } = this.state;
    const blueprintIcons = Object.keys(IconNames).map<IconType>(
      (name: string) => IconNames[name as keyof typeof IconNames],
    );

    if (this.props.showAntdIcon || this.isAntdComponent()) {
      return [NONE, ...loadedIcons, ...blueprintIcons];
    }

    return [NONE, ...blueprintIcons];
  }

  private filterIconName = (query: string, iconName: IconType) => {
    if (iconName === NONE || query === "") return true;

    const terms = query.toLowerCase().split(/\s+/);
    return terms.every((term) => iconName.toLowerCase().includes(term));
  };

  private renderIcon = (icon: IconType) => {
    if (icon === NONE) return undefined;
    if (
      (this.props.showAntdIcon || this.isAntdComponent()) &&
      icon.startsWith(ANT_PREFIX)
    ) {
      return <AntIconWrapper iconName={icon.slice(ANT_PREFIX.length)} />;
    }
    return icon as IconName;
  };

  private renderIconItem: ItemRenderer<IconType> = (
    icon,
    { handleClick, modifiers },
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    return (
      <Tooltip content={icon} mouseEnterDelay={0}>
        <StyledMenuItem
          active={modifiers.active}
          icon={this.renderIcon(icon)}
          key={icon}
          onClick={handleClick}
          text={icon === NONE ? NONE : undefined}
          textClassName={icon === NONE ? "bp3-icon-(none)" : ""}
        />
      </Tooltip>
    );
  };

  private handleIconChange = (icon: IconType, isUpdatedViaKeyboard = false) => {
    this.setState({ activeIcon: icon });
    this.updateProperty(
      this.props.propertyName,
      icon === NONE ? undefined : icon,
      isUpdatedViaKeyboard,
    );
  };

  private handleItemSelect = (icon: IconType) => {
    this.handleIconChange(icon, false);
  };

  public render() {
    const { defaultIconName, propertyValue: iconName } = this.props;
    const { activeIcon, isOpen } = this.state;
    const containerWidth =
      this.iconSelectTargetRef.current?.getBoundingClientRect?.()?.width || 0;

    return (
      <>
        <IconSelectContainerStyles id={this.id} targetWidth={containerWidth} />
        <TypedSelect
          activeItem={activeIcon || defaultIconName || NONE}
          className="icon-select-container"
          inputProps={{ inputRef: this.searchInput }}
          itemListRenderer={isOpen ? this.renderMenu : undefined}
          itemPredicate={this.filterIconName}
          itemRenderer={this.renderIconItem}
          items={this.getIconNames()}
          onItemSelect={this.handleItemSelect}
          onQueryChange={this.handleQueryChange}
          popoverProps={{
            enforceFocus: false,
            minimal: true,
            isOpen: isOpen,
            popoverClassName: `icon-select-popover icon-select-popover-${this.id}`,
            onInteraction: (state) => {
              if (isOpen !== state) {
                this.debouncedSetState({ isOpen: state });
              }
            },
          }}
        >
          <StyledButton
            alignText={Alignment.LEFT}
            className={
              Classes.TEXT_OVERFLOW_ELLIPSIS + " " + replayHighlightClass
            }
            elementRef={this.iconSelectTargetRef}
            fill
            icon={this.renderIcon(activeIcon)}
            onClick={this.handleButtonClick}
            rightIcon="caret-down"
            tabIndex={0}
            text={iconName || defaultIconName || NONE}
          />
        </TypedSelect>
      </>
    );
  }

  static getControlType() {
    return "ICON_SELECT";
  }

  static canDisplayValueInUI(
    config: IconSelectControlProps,
    value: any,
  ): boolean {
    if (value === NONE || !value) return true;
    if (value.startsWith(ANT_PREFIX)) return true;
    return Object.values(IconNames).includes(value as IconName);
  }
}

const AntIconWrapper: React.FC<{ iconName: string }> = ({ iconName }) => {
  const [Icon, setIcon] = useState<React.ComponentType | null>(
    () => iconCache.get(iconName) || null,
  );

  useEffect(() => {
    if (Icon) return;

    const loadIcon = async () => {
      try {
        if (iconCache.has(iconName)) {
          setIcon(() => iconCache.get(iconName)!);
          return;
        }

        const IconComponent = await import(
          /* webpackChunkName: "antd-icon-[request]" */
          `@ant-design/icons/es/icons/${iconName}`
        ).then((module) => module.default);

        iconCache.set(iconName, IconComponent);
        setIcon(() => IconComponent);
      } catch (error) {
        console.error(`Failed to load icon: ${iconName}`, error);
      }
    };

    loadIcon();
  }, [iconName, Icon]);

  if (!Icon) return null;
  return <Icon />;
};

export default IconSelectControl;
