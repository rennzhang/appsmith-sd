import type { ControllerRenderProps } from "react-hook-form/dist/types/controller";

import { InputTypes } from "widgets/Antd/Form/InputWidget/constants";
import AntdInputWidget, {
  CONFIG as AntdInputWidgetConfig,
} from "widgets/Antd/Form/InputWidget";
import AutoCompleteWidget, {
  CONFIG as AutoCompleteWidgetConfig,
} from "widgets/Antd/Form/AutoCompleteWidget";
import CascaderWidget, {
  CONFIG as CascaderWidgetConfig,
} from "widgets/Antd/Form/CascaderWidget";
import CheckboxWidget, {
  CONFIG as CheckboxWidgetConfig,
} from "widgets/Antd/Form/CheckboxWidget";
import DatePickerWidget, {
  CONFIG as DatePickerWidgetConfig,
} from "widgets/Antd/Form/DatePickerWidget";
import RadioWidget, {
  CONFIG as RadioWidgetConfig,
} from "widgets/Antd/Form/RadioWidget";
import RateWidget, {
  CONFIG as RateWidgetConfig,
} from "widgets/Antd/Form/RateWidget";
import SelectWidget, {
  CONFIG as SelectWidgetConfig,
} from "widgets/Antd/Form/SelectWidget";
import SliderWidget, {
  CONFIG as SliderWidgetConfig,
} from "widgets/Antd/Form/SliderWidget";
import SwitchWidget, {
  CONFIG as SwitchWidgetConfig,
} from "widgets/Antd/Form/SwitchWidget";
import TextWidget, {
  CONFIG as TextWidgetConfig,
} from "widgets/Antd/Form/TextWidget";
import TimePickerWidget, {
  CONFIG as TimePickerWidgetConfig,
} from "widgets/Antd/Form/TimePickerWidget";
import TransferWidget, {
  CONFIG as TransferWidgetConfig,
} from "widgets/Antd/Form/TransferWidget";
import TreeSelectWidget, {
  CONFIG as TreeSelectWidgetConfig,
} from "widgets/Antd/Form/TreeSelectWidget";
import TreeWidget, {
  CONFIG as TreeWidgetConfig,
} from "widgets/Antd/Form/TreeWidget";
import UploadWidget, {
  CONFIG as UploadWidgetConfig,
} from "widgets/Antd/Form/UploadWidget";
console.log(` AntdInputWidgetConfig.defaults`, AntdInputWidgetConfig.defaults);
export {
  AntdInputWidgetConfig,
  AutoCompleteWidgetConfig,
  CascaderWidgetConfig,
  CheckboxWidgetConfig,
  DatePickerWidgetConfig,
  RadioWidgetConfig,
  RateWidgetConfig,
  SelectWidgetConfig,
  SliderWidgetConfig,
  SwitchWidgetConfig,
  TextWidgetConfig,
  TimePickerWidgetConfig,
  TransferWidgetConfig,
  TreeSelectWidgetConfig,
  TreeWidgetConfig,
  UploadWidgetConfig,
};

export const AllAntdFormItems = [
  AntdInputWidgetConfig,
  AutoCompleteWidgetConfig,
  CascaderWidgetConfig,
  CheckboxWidgetConfig,
  DatePickerWidgetConfig,
  RadioWidgetConfig,
  RateWidgetConfig,
  SelectWidgetConfig,
  SliderWidgetConfig,
  SwitchWidgetConfig,
  TextWidgetConfig,
  TimePickerWidgetConfig,
  TransferWidgetConfig,
  TreeSelectWidgetConfig,
  TreeWidgetConfig,
  UploadWidgetConfig,
];

import {
  ArrayField,
  CheckboxField,
  CurrencyInputField,
  DateField,
  InputField,
  AntdSelectField,
  AntdTreeSelectField,
  ObjectField,
  PhoneInputField,
  RadioGroupField,
  SwitchField,
  TextField,
  CascaderField,
} from "./fields";
import type { InputType } from "zlib";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";
import type { AntdLabelPosition } from "components/constants";
import type { TextSize } from "constants/WidgetConstants";
// export enum FieldTypeNew {
//   INPUT = AntdInputWidget.getWidgetType() as any,
//   AUTOCOMPLETE = AutoCompleteWidget.getWidgetType() as any,
//   CASCADER = CascaderWidget.getWidgetType() as any,
//   CHECKBOX = CheckboxWidget.getWidgetType() as any,
//   DATEPICKER = DatePickerWidget.getWidgetType() as any,
//   RADIO = RadioWidget.getWidgetType() as any,
//   RATE = RateWidget.getWidgetType() as any,
//   SELECT = SelectWidget.getWidgetType() as any,
//   SLIDER = SliderWidget.getWidgetType() as any,
//   SWITCH = SwitchWidget.getWidgetType() as any,
//   TEXT = TextWidget.getWidgetType() as any,
//   TIMEPICKER = TimePickerWidget.getWidgetType() as any,
//   TRANSFER = TransferWidget.getWidgetType() as any,
//   TREESELECT = TreeSelectWidget.getWidgetType() as any,
//   TREE = TreeWidget.getWidgetType() as any,
//   UPLOAD = UploadWidget.getWidgetType() as any,
// }
export const ComponentDefaultMap = {
  ["Currency Input"]: AntdInputWidgetConfig.defaults,
  ["Email Input"]: AntdInputWidgetConfig.defaults,
  ["Multiselect"]: AntdInputWidgetConfig.defaults,
  ["Multiline Text Input"]: AntdInputWidgetConfig.defaults,
  ["Number Input"]: AntdInputWidgetConfig.defaults,
  ["Password Input"]: AntdInputWidgetConfig.defaults,
  ["Phone Number Input"]: AntdInputWidgetConfig.defaults,
  ["Text Input"]: AntdInputWidgetConfig.defaults,
  ["Auto Complete"]: AutoCompleteWidgetConfig.defaults,
  ["Cascader"]: CascaderWidgetConfig.defaults,
  ["Checkbox"]: CheckboxWidgetConfig.defaults,
  ["Datepicker"]: DatePickerWidgetConfig.defaults,
  ["Radio Group"]: RadioWidgetConfig.defaults,
  ["Rate"]: RateWidgetConfig.defaults,
  ["Select"]: SelectWidgetConfig.defaults,
  ["Slider"]: SliderWidgetConfig.defaults,
  ["Switch"]: SwitchWidgetConfig.defaults,
  ["Text"]: TextWidgetConfig.defaults,
  ["Timepicker"]: TimePickerWidgetConfig.defaults,
  ["Transfer"]: TransferWidgetConfig.defaults,
  ["TreeSelect"]: TreeSelectWidgetConfig.defaults,
  ["Tree"]: TreeWidgetConfig.defaults,
  ["Upload"]: UploadWidgetConfig.defaults,
} as const;

// CAUTION! When changing the enum value, make sure any direct comparison
// eg fieldType === "Array" instead of fieldType === FieldType.ARRAY is taking place
// and modified accordingly
export enum FieldType {
  TEXT = "Text",
  AUTOCOMPLETE_INPUT = "AUTOCOMPLETE_INPUT",
  TEXT_INPUT = InputTypes.TEXT_INPUT,
  MULTILINE_TEXT_INPUT = InputTypes.MULTI_LINE_TEXT,
  PASSWORD_INPUT = InputTypes.PASSWORD,
  // CURRENCY_INPUT = InputTypes.CURRENCY,
  SEARCH_INPUT = InputTypes.SEARCH,
  NUMBER_INPUT = InputTypes.NUMBER,
  // PHONE_NUMBER_INPUT = InputTypes.PHONE_NUMBER,
  // EMAIL_INPUT = InputTypes.EMAIL,
  ARRAY = "Array",
  CHECKBOX = "Checkbox",
  DATEPICKER = "Datepicker",
  MULTISELECT = "Multiselect",
  TREESELECT = "TreeSelect",
  OBJECT = "Object",
  RADIO_GROUP = "Radio Group",
  // SELECT = "Select",
  SWITCH = "Switch",
  CASCADE = "Cascade",
  // 未实现类型
  // AUTOCOMPLETE = "Auto Complete",
  // CASCADER = "Cascader",
  // RATE = "Rate",
  // SLIDER = "Slider",
  // TEXT = "Text",
  // TIMEPICKER = "Timepicker",
  // TRANSFER = "Transfer",
  // TREESELECT = "TreeSelect",
  // TREE = "Tree",
  // UPLOAD = "Upload",
}
export const fieldTypeOptions = [
  {
    label: "文本",
    value: FieldType.TEXT,
  },
  {
    label: "输入框",
    value: FieldType.TEXT_INPUT,
  },
  {
    label: "自动完成输入框",
    value: FieldType.AUTOCOMPLETE_INPUT,
  },
  {
    label: "选择器",
    value: FieldType.MULTISELECT,
  },
  {
    label: "单选框",
    value: FieldType.RADIO_GROUP,
  },
  {
    label: "复选框",
    value: FieldType.CHECKBOX,
  },

  {
    label: "开关",
    value: FieldType.SWITCH,
  },
  {
    label: "树选择器",
    value: FieldType.TREESELECT,
  },
  {
    label: "级联选择器",
    value: FieldType.CASCADE,
  },
  {
    label: "日期选择器",
    value: FieldType.DATEPICKER,
  },
  {
    label: "对象",
    value: FieldType.OBJECT,
  },
  {
    label: "数组",
    value: FieldType.ARRAY,
  },
];

export type FieldTypeKey = keyof typeof FieldType;

export const inverseFieldType = Object.entries(FieldType).reduce<
  Record<FieldType, FieldTypeKey>
>((previousValue, currentValue) => {
  const [key, value] = currentValue;
  previousValue[value] = key as FieldTypeKey;
  return previousValue;
}, {} as Record<FieldType, FieldTypeKey>);

export enum DataType {
  STRING = "string",
  NUMBER = "number",
  ARRAY = "array",
  BOOLEAN = "boolean",
  OBJECT = "object",
  BIGINT = "bigint",
  SYMBOL = "symbol",
  UNDEFINED = "undefined",
  NULL = "null",
  FUNCTION = "function",
}

export type Obj = Record<string, any>;
export type JSON = Obj | Obj[];

export type FieldComponentBaseProps = {
  type: string;
  labelAlignment?: "left" | "right";
  controlSize?: ProFormProps["size"];
  labelPosition?: AntdLabelPosition;
  defaultValue?: string | number;
  isDisabled?: boolean;
  isRequired?: boolean;
  isVisible?: boolean;
  labelText: string;
  labelStyle?: string;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  tooltip?: string;
  label?: string;
};

export type FieldEventProps = {
  onFocus?: string;
  onBlur?: string;
};

export type BaseFieldComponentProps<TProps = any> = {
  hideLabel?: boolean;
  isRootField?: boolean;
  fieldClassName: string;
  name: ControllerRenderProps["name"];
  formIsRequird?: boolean;
  propertyPath: string;
  passedDefaultValue?: unknown;
  schemaItem: SchemaItem & TProps;
};

export type Schema = Record<string, SchemaItem>;

/**
 * dataType - result of "typeof value" -> string/number/boolean etc.
 * fieldType - the field component that this represents -> Text/Switch/Email etc.
 * sourceData - the data that is used to compute initial dataType and fieldType.
 * isCustomField - this is set to true only for fields created using the "Add new field" in Property Pane
 * name - this is a sanitized value used to identify a field uniquely -> firstName, age etc.
 * position - a number from 0..n specifying the order in a form.
 * originalIdentifier - This is derived from the sourceData key, in it's unsanitized form.
 *    It is used as a marker to identify this field in the sourceData to detect any change. As the actual
 *    identifier used can be modified during sanitization process.
 * identifier - This is derived from the sourceData key, in it's sanitized form. This acts as a marker
 *    in the schema and helps identifying from nested property changes.
 * accessor - This is very similar to the name property. This is directly exposed in the property pane to be
 *    modified at free will. It acts as a staging state for the name, as name cannot have invalid values. So
 *    when accessor is updated, it checks if this value can be used as name and then updates it, else keeps the
 *    name property intact for data sanity.
 */
export type SchemaItem = FieldComponentBaseProps & {
  colorPrimary?: string;
  accessor: string;
  children: Schema;
  dataType: DataType;
  fieldType: FieldType;
  identifier: string;
  isCustomField: boolean;
  originalIdentifier: string;
  position: number;
  sourceData: any;
};

export type ComponentDefaultValuesFnProps<TSourceData = any> = {
  sourceDataPath?: string;
  fieldType: FieldType;
  bindingTemplate: {
    suffixTemplate: string;
    prefixTemplate: string;
  };
  isCustomField: boolean;
  sourceData: TSourceData;
  skipDefaultValueProcessing: boolean;
};

// This defines a react component with componentDefaultValues property attached to it.
export type FieldComponent = {
  (props: BaseFieldComponentProps): JSX.Element | null;
  componentDefaultValues?:
    | FieldComponentBaseProps
    | ((props: ComponentDefaultValuesFnProps) => FieldComponentBaseProps);
  isValidType?: (value: any, options?: any) => boolean;
};

export type FieldState<TObj> =
  | {
      [k: string]: TObj | TObj[] | FieldState<TObj> | FieldState<TObj>[];
    }
  | FieldState<TObj>[]
  | TObj;

export type HookResponse =
  | Array<{ propertyPath: string; propertyValue: any }>
  | undefined;

export type FieldThemeStylesheet = Record<
  FieldTypeKey,
  { [key: string]: string }
>;

export enum ActionUpdateDependency {
  FORM_DATA = "FORM_DATA",
}

export const ARRAY_ITEM_KEY = "__array_item__";
export const ROOT_SCHEMA_KEY = "__root_schema__";

export const MAX_ALLOWED_FIELDS = 50;

export const RESTRICTED_KEYS = [ARRAY_ITEM_KEY, ROOT_SCHEMA_KEY];

export const FIELD_MAP: Record<FieldType, FieldComponent> = {
  [FieldType.TEXT_INPUT]: InputField,
  [FieldType.AUTOCOMPLETE_INPUT]: InputField,
  [FieldType.SEARCH_INPUT]: InputField,
  // [FieldType.EMAIL_INPUT]: InputField,
  [FieldType.MULTILINE_TEXT_INPUT]: InputField,
  [FieldType.NUMBER_INPUT]: InputField,
  [FieldType.PASSWORD_INPUT]: InputField,
  // [FieldType.CURRENCY_INPUT]: CurrencyInputField,
  // [FieldType.PHONE_NUMBER_INPUT]: PhoneInputField,
  [FieldType.ARRAY]: ArrayField,
  [FieldType.CHECKBOX]: CheckboxField,

  [FieldType.DATEPICKER]: DateField,
  [FieldType.MULTISELECT]: AntdSelectField,
  [FieldType.TREESELECT]: AntdTreeSelectField,
  [FieldType.OBJECT]: ObjectField,
  [FieldType.RADIO_GROUP]: RadioGroupField,
  [FieldType.SWITCH]: SwitchField,
  [FieldType.TEXT]: TextField,
  [FieldType.CASCADE]: CascaderField,
};

export const INPUT_TYPES = [
  // FieldType.CURRENCY_INPUT,
  // FieldType.EMAIL_INPUT,
  FieldType.MULTILINE_TEXT_INPUT,
  FieldType.NUMBER_INPUT,
  FieldType.PASSWORD_INPUT,
  // FieldType.PHONE_NUMBER_INPUT,
  FieldType.TEXT_INPUT,
  FieldType.SEARCH_INPUT,
] as const;

/**
 * This translates FieldType to Input component inputType
 * As InputField would handle all the below types (Text/Number), this map
 * would help use identify what inputType it is based on the FieldType.
 */
export const INPUT_FIELD_TYPE: Record<(typeof INPUT_TYPES)[number], InputType> =
  {
    // [FieldType.CURRENCY_INPUT]: "CURRENCY",
    // [FieldType.PHONE_NUMBER_INPUT]: "PHONE_NUMBER",
    // [FieldType.EMAIL_INPUT]: "EMAIL",
    [FieldType.NUMBER_INPUT]: "NUMBER",
    [FieldType.PASSWORD_INPUT]: "PASSWORD",
    [FieldType.TEXT_INPUT]: "TEXT",
    [FieldType.MULTILINE_TEXT_INPUT]: "TEXT",
    [FieldType.SEARCH_INPUT]: "SEARCH",
  };

export const FIELD_EXPECTING_OPTIONS = [
  FieldType.MULTISELECT,
  // FieldType.SELECT,
];

export const DATA_TYPE_POTENTIAL_FIELD = {
  [DataType.STRING]: FieldType.TEXT_INPUT,
  [DataType.NUMBER]: FieldType.TEXT_INPUT,
  [DataType.BIGINT]: FieldType.TEXT_INPUT,
  [DataType.SYMBOL]: FieldType.TEXT_INPUT,
  [DataType.UNDEFINED]: FieldType.TEXT_INPUT,
  [DataType.FUNCTION]: FieldType.TEXT_INPUT,
  [DataType.NULL]: FieldType.TEXT_INPUT,
  [DataType.BOOLEAN]: FieldType.SWITCH,
  [DataType.OBJECT]: FieldType.OBJECT,
  [DataType.ARRAY]: FieldType.ARRAY,
};

// The potential value here is just for representation i.e it won't be used to set default value anywhere.
// This will just help to transform a field type (when modified in custom field) to appropriate schemaItem
// using schemaParser.
export const FIELD_TYPE_TO_POTENTIAL_DATA: Record<FieldType, any> = {
  [FieldType.ARRAY]: [{ firstField: "" }],
  [FieldType.TREESELECT]: [],
  [FieldType.CHECKBOX]: true,
  // [FieldType.CURRENCY_INPUT]: "",
  // [FieldType.PHONE_NUMBER_INPUT]: "",
  [FieldType.DATEPICKER]: "",
  // [FieldType.EMAIL_INPUT]: "",
  [FieldType.MULTISELECT]: [],
  [FieldType.MULTILINE_TEXT_INPUT]: "",
  [FieldType.NUMBER_INPUT]: 0,
  [FieldType.OBJECT]: {},
  [FieldType.PASSWORD_INPUT]: "",
  [FieldType.RADIO_GROUP]: "",
  // [FieldType.SELECT]: "",
  [FieldType.SWITCH]: true,
  [FieldType.TEXT_INPUT]: "",
  [FieldType.SEARCH_INPUT]: "",
  [FieldType.AUTOCOMPLETE_INPUT]: "",
  [FieldType.TEXT]: "",
  [FieldType.CASCADE]: [],
};

export const FIELD_SUPPORTING_FOCUS_EVENTS = [
  FieldType.CHECKBOX,
  // FieldType.CURRENCY_INPUT,
  FieldType.DATEPICKER,
  // FieldType.EMAIL_INPUT,
  FieldType.MULTISELECT,
  FieldType.MULTILINE_TEXT_INPUT,
  FieldType.NUMBER_INPUT,
  FieldType.PASSWORD_INPUT,
  // FieldType.PHONE_NUMBER_INPUT,
  FieldType.TEXT_INPUT,
];

// These are the fields who's defaultValue property control's JS
// mode would be enabled by default.
export const AUTO_JS_ENABLED_FIELDS: Record<
  FieldType,
  (keyof SchemaItem)[] | null
> = {
  [FieldType.TREESELECT]: ["defaultValue"],
  [FieldType.TEXT]: ["defaultValue"],
  [FieldType.DATEPICKER]: ["defaultValue"],
  [FieldType.SWITCH]: ["defaultValue"],
  [FieldType.ARRAY]: null,
  [FieldType.CHECKBOX]: ["defaultValue"],
  // [FieldType.CURRENCY_INPUT]: null,
  // [FieldType.EMAIL_INPUT]: null,
  [FieldType.MULTISELECT]: null,
  [FieldType.MULTILINE_TEXT_INPUT]: null,
  [FieldType.NUMBER_INPUT]: null,
  [FieldType.OBJECT]: null,
  [FieldType.PASSWORD_INPUT]: null,
  // [FieldType.PHONE_NUMBER_INPUT]: null,
  [FieldType.RADIO_GROUP]: null,
  // [FieldType.SELECT]: null,
  [FieldType.TEXT_INPUT]: null,
  [FieldType.AUTOCOMPLETE_INPUT]: null,
  [FieldType.SEARCH_INPUT]: null,
  [FieldType.CASCADE]: null,
};

export const getBindingTemplate = (widgetName: string) => {
  const prefixTemplate = `{{((sourceData, formData, fieldState) => (`;
  const suffixTemplate = `))(${widgetName}.sourceData, ${widgetName}.formData, ${widgetName}.fieldState)}}`;

  return { prefixTemplate, suffixTemplate };
};
