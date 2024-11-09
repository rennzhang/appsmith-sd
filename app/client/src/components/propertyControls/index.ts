import type { InputControlProps } from "components/propertyControls/InputTextControl";
import InputTextControl from "components/propertyControls/InputTextControl";
import type { DropDownControlProps } from "components/propertyControls/DropDownControl";
import DropDownControl from "components/propertyControls/DropDownControl";
import FieldNameDropDownControl from "components/propertyControls/FieldNameDropDownControl";

import type { SwitchControlProps } from "components/propertyControls/SwitchControl";
import SwitchControl from "components/propertyControls/SwitchControl";
import OptionControl from "components/propertyControls/OptionControl";
import type { ControlProps } from "components/propertyControls/BaseControl";
import type BaseControl from "components/propertyControls/BaseControl";
import CodeEditorControl from "components/propertyControls/CodeEditorControl";
import type { DatePickerControlProps } from "components/propertyControls/DatePickerControl";
import DatePickerControl from "components/propertyControls/DatePickerControl";
import ChartDataControl from "components/propertyControls/ChartDataControl";
import EchartDataControl from "components/propertyControls/EchartDataControl";
import LocationSearchControl from "components/propertyControls/LocationSearchControl";
import type { StepControlProps } from "components/propertyControls/StepControl";
import StepControl from "components/propertyControls/StepControl";
import TabControl from "components/propertyControls/TabControl";
import ActionSelectorControl from "components/propertyControls/ActionSelectorControl";
import ColumnActionSelectorControl from "components/propertyControls/ColumnActionSelectorControl";
import PrimaryColumnsControl from "components/propertyControls/PrimaryColumnsControl";
import type { PrimaryColumnDropdownControlProps } from "components/propertyControls/PrimaryColumnDropdownControl";
import PrimaryColumnDropdownControl from "components/propertyControls/PrimaryColumnDropdownControl";
import type { PrimaryColumnExpandKeysDropdownControlProps } from "components/propertyControls/PrimaryColumnKeysDropdownControl";
import PrimaryColumnKeysDropdownControl from "components/propertyControls/PrimaryColumnKeysDropdownControl";
import TableIndexDropdownControl from "components/propertyControls/TableIndexDropdownControl";
import type { ColorPickerControlProps } from "components/propertyControls/ColorPickerControl";
import ColorPickerControl from "components/propertyControls/ColorPickerControl";
import type { PrimaryColumnColorPickerControlProps } from "components/propertyControls/PrimaryColumnColorPickerControl";
import PrimaryColumnColorPickerControl from "components/propertyControls/PrimaryColumnColorPickerControl";
import type { ComputeTablePropertyControlProps } from "components/propertyControls/ComputeTablePropertyControl";
import type { ComputeValuePropertyControlProps } from "components/propertyControls/ComputeValuePropertyControl";
import ComputeTablePropertyControl from "components/propertyControls/ComputeTablePropertyControl";
import ComputeValuePropertyControl from "components/propertyControls/ComputeValuePropertyControl";
import type { IconTabControlProps } from "components/propertyControls/IconTabControl";
import IconTabsControl from "components/propertyControls/IconTabControl";
import type { ButtonTabControlProps } from "components/propertyControls/ButtonTabControl";
import ButtonTabControl from "components/propertyControls/ButtonTabControl";
import type { MultiSwitchControlProps } from "components/propertyControls/MultiSwitchControl";
import MultiSwitchControl from "components/propertyControls/MultiSwitchControl";
import MenuItemsControl from "./MenuItemsControl";
import OpenConfigPanelControl from "./OpenConfigPanelControl";
import ButtonListControl from "./ButtonListControl";
import IconSelectControl from "./IconSelectControl";
import FormilyControl from "./FormilyControl";
import CellControl from "./taro/CellControl";
import RadioControl from "./RadioControl";
import VantIconSelectControl from "./taro/IconSelectControl";
import ActionControl from "./taro/ActionControl";
import FieldControl from "./taro/FieldControl";
import BoxShadowOptionsControl from "./BoxShadowOptionsControl";
import BorderRadiusOptionsControl from "./BorderRadiusOptionsControl";
import ButtonBorderRadiusOptionsControl from "./ButtonBorderRadiusControl";
import FieldConfigurationControl from "components/propertyControls/FieldConfigurationControl";
import AntdFieldConfigurationControl from "components/propertyControls/AntdFieldConfigurationControl";
import JSONFormComputeControl from "./JSONFormComputeControl";
import AntdJSONFormComputeControl from "./AntdJSONFormComputeControl";
import ButtonControl from "./ButtonControl";
import LabelAlignmentOptionsControl from "./LabelAlignmentOptionsControl";
import type { NumericInputControlProps } from "./NumericInputControl";
import NumericInputControl from "./NumericInputControl";
import PrimaryColumnsControlV2 from "components/propertyControls/PrimaryColumnsControlV2";
import PrimaryColumnsControlAntd from "components/propertyControls/PrimaryColumnsControlAntd";
import type { SelectDefaultValueControlProps } from "./SelectDefaultValueControl";
import SelectDefaultValueControl from "./SelectDefaultValueControl";
import type { ComputeTablePropertyControlPropsV2 } from "components/propertyControls/TableComputeValue";
import ComputeTablePropertyControlV2 from "components/propertyControls/TableComputeValue";
import type { PrimaryColumnColorPickerControlPropsV2 } from "components/propertyControls/PrimaryColumnColorPickerControlV2";
import PrimaryColumnColorPickerControlV2 from "components/propertyControls/PrimaryColumnColorPickerControlV2";
import type { TableInlineEditValidationControlProps } from "./TableInlineEditValidationControl";
import TableInlineEditValidationControl from "./TableInlineEditValidationControl";
import TableInlineEditValidPropertyControl from "./TableInlineEditValidPropertyControl";
import type { MenuButtonDynamicItemsControlProps } from "components/propertyControls/MenuButtonDynamicItemsControl";
import MenuButtonDynamicItemsControl from "components/propertyControls/MenuButtonDynamicItemsControl";
import type { ListComputeControlProps } from "./ListComputeControl";
import ListComputeControl from "./ListComputeControl";
import type { OneClickBindingControlProps } from "./OneClickBindingControl";
import OneClickBindingControl from "./OneClickBindingControl";
import type { WrappedCodeEditorControlProps } from "./WrappedCodeEditorControl";
import WrappedCodeEditorControl from "./WrappedCodeEditorControl";
import type { JsDataControllProps } from "components/propertyControls/JSControl";
import JsDataControl from "components/propertyControls/JSControl";

export const PropertyControls = {
  JsDataControl,
  InputTextControl,
  DropDownControl,
  FieldNameDropDownControl,
  SwitchControl,
  OptionControl,
  CodeEditorControl,
  DatePickerControl,
  ActionSelectorControl,
  ColumnActionSelectorControl,
  MultiSwitchControl,
  ChartDataControl,
  EchartDataControl,
  LocationSearchControl,
  StepControl,
  TabControl,
  ColorPickerControl,
  PrimaryColumnsControl,
  PrimaryColumnsControlV2,
  PrimaryColumnsControlAntd,
  PrimaryColumnDropdownControl,
  PrimaryColumnKeysDropdownControl,
  TableIndexDropdownControl,
  IconTabsControl,
  ButtonTabControl,
  ComputeTablePropertyControl,
  ComputeValuePropertyControl,
  ComputeTablePropertyControlV2,
  MenuItemsControl,
  MenuButtonDynamicItemsControl,
  OpenConfigPanelControl,
  ButtonListControl,
  IconSelectControl,
  FormilyControl,
  CellControl,
  RadioControl,
  VantIconSelectControl,
  ActionControl,
  FieldControl,
  BoxShadowOptionsControl,
  BorderRadiusOptionsControl,
  ButtonBorderRadiusOptionsControl,
  FieldConfigurationControl,
  AntdFieldConfigurationControl,
  JSONFormComputeControl,
  AntdJSONFormComputeControl,
  ButtonControl,
  LabelAlignmentOptionsControl,
  NumericInputControl,
  PrimaryColumnColorPickerControl,
  PrimaryColumnColorPickerControlV2,
  SelectDefaultValueControl,
  TableInlineEditValidationControl,
  TableInlineEditValidPropertyControl,
  ListComputeControl,
  OneClickBindingControl,
  WrappedCodeEditorControl,
};

type KebabCase<S extends string> = S extends `${infer L}${infer R}`
  ? `${Uppercase<L>}${R extends Uncapitalize<R> ? "" : "_"}${KebabCase<R>}`
  : S;

// 去除 _CONTROL
type RemoveControl<S extends string> = S extends `${infer L}_CONTROL` ? L : S;

// 重写一个类型，合并KebabCase RemoveControl功能
export type KebabCaseRemoveControl<S extends string> = RemoveControl<
  KebabCase<S>
>;
export type PropertyControlType = KebabCaseRemoveControl<
  keyof typeof PropertyControls
>;

export type PropertyControlPropsType =
  | JsDataControllProps
  | ControlProps
  | InputControlProps
  | DropDownControlProps
  | SwitchControlProps
  | DatePickerControlProps
  | MultiSwitchControlProps
  | IconTabControlProps
  | ButtonTabControlProps
  | StepControlProps
  | ColorPickerControlProps
  | ComputeTablePropertyControlProps
  | ComputeValuePropertyControlProps
  | PrimaryColumnDropdownControlProps
  | NumericInputControlProps
  | PrimaryColumnColorPickerControlProps
  | ComputeTablePropertyControlPropsV2
  | MenuButtonDynamicItemsControlProps
  | PrimaryColumnDropdownControlProps
  | PrimaryColumnColorPickerControlPropsV2
  | SelectDefaultValueControlProps
  | TableInlineEditValidationControlProps
  | ListComputeControlProps
  | OneClickBindingControlProps
  | WrappedCodeEditorControlProps;

export const getPropertyControlTypes = (): {
  [key: string]: string;
} => {
  const _types: { [key: string]: string } = {};
  Object.values(PropertyControls).forEach(
    (Control: typeof BaseControl & { getControlType: () => string }) => {
      const controlType = Control.getControlType();
      _types[controlType] = controlType;
    },
  );
  return _types;
};
