import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type {
  DatePickerProps,
  TimePickerProps,
  TimeRangePickerProps,
} from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { TextSize, RenderMode } from "constants/WidgetConstants";
import locale from "antd/locale/zh_CN";
import type { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";

// 使用 weekday 插件
dayjs.extend(weekday);
// isoWeek

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import "dayjs/locale/zh-cn";
import type { RangePickerProps } from "antd/es/date-picker";
import { omit } from "lodash";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import {
  TimeRangePresetsOptions,
  TimePresetsOptions,
  DisabledRuleOptions,
} from "../widget/data";
import { convertTimeRanges, parseTime } from "./dateUtils";

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.locale("zh-cn");

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i <= (end < 0 ? 0 : end); i++) {
    result.push(i);
  }
  return result;
};
// 处理 json 数组或者逗号分割的字符串
const handleJsonArray = (value?: string | number[]) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value).map((c: any) => +c);
  } catch (error) {
    return value?.split(",").map((c) => +c);
  }
};
function transDayjs(date?: dayjs.ConfigType): dayjs.Dayjs;

function transDayjs(
  date?: dayjs.ConfigType,
  format?: dayjs.OptionType,
  strict?: boolean,
): dayjs.Dayjs;

function transDayjs(
  date?: dayjs.ConfigType,
  format?: dayjs.OptionType,
  locale?: string,
  strict?: boolean,
): dayjs.Dayjs;

function transDayjs(...args: any[]) {
  const dayStr = dayjs().format("YYYY-MM-DD") + " " + args[0];
  return dayjs(dayStr);
}

type disabledTimeRule = {
  label: "禁用时间";
  id: "config";
  config: {
    offsetWay: "front" | "back" | "both";
    isInvertSelection: boolean;
    id: "config";
    label: "菜单项";
    isVisible: true;
    isDisabled: false;
    specificTime: string | string[];
    specificHours: string | number[];
    specificMinutes: string | number[];
    specificSeconds: string | number[];
    disabledRule: string;
    frontOffset: number;
    backOffset: number;
    customRanges: string | string[];
  };
};
export interface DatePickerWidgetProps {
  widgetName: string;
  disabled?: boolean;
  placeholderText?: string;
  onTimeSelected: <
    T extends Dayjs | Dayjs[] | null,
    U extends string | string[],
  >(
    value: T,
    dateString: U,
  ) => void;
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
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  widgetId: string;
  renderMode?: RenderMode;
  required?: boolean;
  errorMessage: string;
  controlSize?: SizeType;
  allowClear?: boolean;
  defaultValue?: string;
  format?: string;
  loading?: boolean;
  isRangePicker?: boolean;
  allowEmpty?: boolean;
  disabledTimeRule?: disabledTimeRule;
  showPreset?: boolean;
  presetRange?: string[];
  presetSingle?: string[];
  showNow?: boolean;
  isEnabledDateValid?: boolean;
  onOk: () => void;
  selectedValue?: string | [string, string];
  handleDateValid: (value: any) => void;
  isDateValid?: boolean | boolean[];
  unValidDateMessage?: string;
}

const DatePickerWidget: React.FC<DatePickerWidgetProps> = (props) => {
  const {
    accentColor,
    allowClear,
    allowEmpty,
    borderRadius,
    boxShadow,
    compactMode,
    controlSize,
    defaultValue,
    disabled,
    disabledTimeRule,
    errorMessage,
    format,
    handleDateValid,
    isDateValid,
    isEnabledDateValid,
    isRangePicker,
    isValid,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    onTimeSelected,
    placeholderText,
    required,
    selectedValue,
    showNow,
    showPreset,
    unValidDateMessage,
    widgetId,
    widgetName,
  } = props;
  const [value, setValue] = useState<TimePickerProps["value"]>();
  const [rangeValue, setRangeValue] = useState<RangePickerProps["value"]>();

  const defaultValueMemo = useMemo(() => {
    if (isRangePicker) {
      try {
        return JSON.parse(defaultValue || "[]").map((c: any) =>
          c ? transDayjs(c, format) : undefined,
        );
      } catch (error) {
        return [undefined, undefined];
      }
    }
    return defaultValue?.length ? transDayjs(defaultValue, format) : undefined;
  }, [defaultValue]);

  const presetRange = useMemo(() => {
    return TimeRangePresetsOptions.filter((c) =>
      props.presetRange?.find((d) => d === c.value),
    ).map((c) => {
      return { label: c.label, value: c.getValue };
    });
  }, [props.presetRange]);

  const presetSingle = useMemo(() => {
    return TimePresetsOptions.filter((c) =>
      props.presetSingle?.find((d) => d === c.value),
    ).map((c) => {
      return { label: c.label, value: c.getValue };
    });
  }, [props.presetSingle]);

  useEffect(() => {
    console.log("时间选择 defaultValueMemo", defaultValueMemo);
    !Array.isArray(defaultValueMemo) && setValue(defaultValueMemo as any);
    setRangeValue(defaultValueMemo as any);
  }, [defaultValueMemo]);

  useEffect(() => {
    let transValue: typeof value | typeof rangeValue;
    if (!selectedValue) return setValue((selectedValue as any) || undefined);
    if (isRangePicker) {
      if (Array.isArray(selectedValue)) {
        transValue = selectedValue.map((c: any) =>
          c ? transDayjs(c, format) : undefined,
        ) as any;
      } else {
        transValue = [transDayjs(selectedValue, format), undefined as any];
      }
      setRangeValue(transValue as any);
    } else {
      if (Array.isArray(selectedValue)) {
        transValue = transDayjs(selectedValue[0], format);
      } else {
        transValue = transDayjs(selectedValue, format);
      }
      setValue(transValue);
    }
  }, [selectedValue]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const validateProps = useMemo(() => {
    const data: ProFormItemProps = {
      required,
      validateTrigger: ["onChange", "onBlur"],
      rules: [
        {
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
          validator: async (_rule, value) => {
            if (required && !value) {
              return Promise.reject(errorMessage);
            }
            return Promise.resolve();
          },
        },
      ],
    };
    if (isEnabledDateValid && isDateValid?.toString()?.includes?.("false")) {
      data.validateStatus = "error";
      data.help = unValidDateMessage;
    }
    return data;
  }, [
    required,
    errorMessage,
    isEnabledDateValid,
    isDateValid,
    unValidDateMessage,
  ]);

  const handleOk = () => {
    props.onOk();
  };
  const handleChange: TimePickerProps["onChange"] = (date, dateString) => {
    console.log("时间选择 handleChange", date, dateString);
    setValue(date);
    onTimeSelected?.(date, dateString);
  };
  const handleRangeChange: RangePickerProps["onChange"] = (
    dates,
    dateStrings,
  ) => {
    console.log("时间选择 handleChange", dates, dateStrings);
    setRangeValue(dates);
    onTimeSelected?.(dates as any, dateStrings);
  };

  const disabledTimeMapMemo = useMemo(() => {
    let beforeTransRangeString: typeof customRanges = "";
    const { customRanges, disabledRule = "none" } =
      disabledTimeRule?.config || {};
    if (disabledRule?.includes("_FIXED")) {
      beforeTransRangeString = DisabledRuleOptions.find(
        (c) => c.value === disabledTimeRule?.config.disabledRule,
      )?.getRangeValue?.();
    } else {
      beforeTransRangeString = (disabledTimeRule?.config as any)?.[
        disabledRule
      ];
    }

    const disabledTimeMap = convertTimeRanges(
      beforeTransRangeString as string,
      disabledRule == "specificTime",
    );

    return disabledTimeMap;
  }, [
    disabledTimeRule?.config.customRanges,
    disabledTimeRule?.config.disabledRule,
  ]);

  const isDisabledTime = (t: string) => {
    const [h, m, s] = parseTime(t);
    return (
      disabledTimeMapMemo?.["HH"]?.includes(h) ||
      disabledTimeMapMemo?.[h]?.includes(m) ||
      disabledTimeMapMemo?.[`${h}:${m}`]?.includes(s)
    );
  };

  // 校验合法性
  useEffect(() => {
    if (isEnabledDateValid) {
      if (isRangePicker) {
        const startDate = rangeValue?.[0] as Dayjs;
        const endDate = rangeValue?.[1] as Dayjs;
        props.handleDateValid([
          !isDisabledTime(startDate?.format("HH:mm:ss") || ""),
          !isDisabledTime(endDate?.format("HH:mm:ss") || ""),
        ]);
      } else {
        const isValid = !isDisabledTime(value?.format("HH:mm:ss") || "");
        props.handleDateValid(isValid);
      }
    }
  }, [value, rangeValue, disabledTimeMapMemo, disabledTimeRule]);

  const disabledTime = useCallback(
    (d) => {
      const {
        disabledRule = "none",
        specificHours,
        specificMinutes,
        specificSeconds,
      } = disabledTimeRule?.config || {};

      if (["am", "pm"].includes(disabledRule)) {
        return {
          disabledHours: () =>
            disabledRule === "am" ? range(0, 12) : range(12, 23),
        };
      }

      if (disabledRule === "specificHMS") {
        return {
          disabledHours: () => handleJsonArray(specificHours),
          disabledMinutes: () => handleJsonArray(specificMinutes),
          disabledSeconds: () => handleJsonArray(specificSeconds),
        };
      }

      return {
        disabledHours: () => disabledTimeMapMemo?.["HH"] || [],
        disabledMinutes: (h: number) => disabledTimeMapMemo?.[h] || [],
        disabledSeconds: (h: number, m: number) =>
          disabledTimeMapMemo?.[`${h}:${m}`] || [],
      };
    },
    [disabledTimeRule, disabledTimeMapMemo],
  );

  console.group("Antd 时间选择框");
  console.log(" props", props);
  console.groupEnd();

  return (
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-datepicker-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        locale={locale}
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            DatePicker: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
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
          <PickerWithType
            allowClear={allowClear}
            disabledTime={disabledTime}
            format={format}
            isRangePicker={isRangePicker}
            onChange={handleChange}
            onOk={handleOk}
            onRangeChange={handleRangeChange}
            placeholder={placeholderText}
            presetRange={presetRange}
            presetSingle={presetSingle}
            rangeValue={rangeValue}
            showNow={showNow}
            showPreset={showPreset}
            size={controlSize}
            value={value}
            allowEmpty={allowEmpty}
            // defaultValue={defaultValueMemo}
            disabled={disabled}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};
const PickerWithType = (props: {
  value: TimePickerProps["value"];
  disabledTime: TimePickerProps["disabledTime"];
  rangeValue: TimeRangePickerProps["value"];
  onChange: TimePickerProps["onChange"] | TimePickerProps["onChange"];
  onRangeChange: TimeRangePickerProps["onChange"];
  onOk: () => void;
  showPreset?: boolean;
  isRangePicker?: boolean;
  presetRange: any;
  presetSingle: any;
  status?: TimePickerProps["status"];
  [key: string]: any;
}) => {
  const {
    onChange,
    onOk,
    onRangeChange,
    presetRange,
    presetSingle,
    rangeValue,
    showPreset,
    value,
  } = props;
  console.group("Antd 时间选择框 PickerWithType");
  console.log(" props", props);
  console.log(" props defaultValue", props.defaultValue);
  console.groupEnd();
  if (props.isRangePicker) {
    const rangeProps = omit(props, [
      "isRangePicker",
      "onChange",
      "onRangeChange",
      // "defaultValue",
      // "type",
    ]);
    return (
      <TimePicker.RangePicker
        {...rangeProps}
        onOk={onOk}
        presets={showPreset ? presetRange : undefined}
        value={rangeValue}
        // defaultValue={[dayjs("2024-07-13"), dayjs("2024-07-23")]}
        onChange={onRangeChange}
      />
    );
  }

  const dateProps = omit(props, [
    "isRangePicker",
    "onRangeChange",
    // "defaultValue",
    // "value",
  ]);

  return (
    <TimePicker
      {...dateProps}
      presets={showPreset ? presetSingle : undefined}
    />
  );
};
export default DatePickerWidget;
