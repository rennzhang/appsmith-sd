import type { ProFormItemProps } from "@ant-design/pro-components";
import type { AntdLabelPosition } from "components/constants";
import type { WidgetProps } from "widgets/BaseWidget";

export interface AntdTextDisplayWidgetProps extends WidgetProps {
  defaultValue?: string;
  tooltip?: string;
  isDisabled?: boolean;
  label: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: ProFormItemProps["labelAlign"];
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: string;
  labelStyle?: string;
}
