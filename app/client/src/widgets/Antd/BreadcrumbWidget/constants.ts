import type { Alignment } from "@blueprintjs/core";
import type { IconName } from "design-system-old";
import type { ReactNode } from "react";

export type ButtonStyle =
  | "PRIMARY_BUTTON"
  | "SECONDARY_BUTTON"
  | "SUCCESS_BUTTON"
  | "DANGER_BUTTON";

export enum MenuItemsSource {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
}
export interface MenuItem {
  widgetId?: string;
  index?: number;
  id: string;
  isVisible?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconName?: IconName;
  iconColor?: string;
  iconAlign?: Alignment;
  label: string;
  title: string | ReactNode;
}
