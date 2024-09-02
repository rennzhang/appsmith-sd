import type { WidgetProps } from "widgets/BaseWidget";
import type { Alignment } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import { IconNames } from "@blueprintjs/icons";
import type {
  ButtonBorderRadius,
  ButtonVariant,
  ButtonPlacement,
} from "components/constants";
import type { RenderMode } from "constants/WidgetConstants";
import type { DropdownProps, ButtonProps } from "antd";

export enum MenuItemsSource {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
}

export interface MenuItem {
  widgetId?: string;
  index?: number;
  id: string;
  label?: string;
  isVisible?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  onClick?: string;
  backgroundColor?: string;
  iconName?: IconName;
  iconColor?: string;
  iconAlign?: Alignment;
  textColor?: string;
  danger?: boolean;
  // children?: { key: string; label: string; disabled?: boolean }[];
}

export interface ConfigureMenuItems {
  label: string;
  id: string;
  config: MenuItem;
}

export type MenuItems = Record<string, MenuItem>;

export interface MenuButtonWidgetProps extends WidgetProps {
  label?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  isCompact?: boolean;
  menuItems: MenuItems;
  getVisibleItems: () => Array<MenuItem>;
  buttonVariant?: ButtonVariant;
  buttonColor?: string;
  borderRadius: ButtonBorderRadius;
  boxShadow?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  placement?: ButtonPlacement;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: ConfigureMenuItems;
  sourceData?: Array<Record<string, unknown>>;
}

export interface MenuButtonComponentProps {
  iconColor?: string;
  textColor?: string;
  label?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  isCompact?: boolean;
  menuItems: MenuItems;
  getVisibleItems: () => Array<MenuItem>;
  buttonVariant?: ButtonVariant;
  buttonColor?: string;
  borderRadius: string;
  boxShadow?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  onItemClicked: (onClick: string | undefined, index: number) => void;
  backgroundColor?: string;
  placement?: ButtonPlacement;
  width: number;
  widgetId: string;
  renderMode?: RenderMode;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: ConfigureMenuItems;
  sourceData?: Array<Record<string, unknown>>;
  maxWidth?: number;
  minWidth?: number;
  minHeight?: number;
  menuPosition?: DropdownProps["placement"];
  menuTrigger?: "click" | "hover" | "contextMenu";
  buttonSize?: ButtonProps["size"];
}

export interface PopoverContentProps {
  menuItems: MenuItems;
  getVisibleItems: () => Array<MenuItem>;
  onItemClicked: (onClick: string | undefined, index: number) => void;
  isCompact?: boolean;
  borderRadius?: string;
  backgroundColor?: string;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: ConfigureMenuItems;
  sourceData?: Array<Record<string, unknown>>;
}

export const ICON_NAMES = Object.keys(IconNames).map(
  (name: string) => IconNames[name as keyof typeof IconNames],
);
