import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { DatePickerProps, TimePickerProps } from "antd";
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
import { DatePresetsOptions, DateRangePresetsOptions } from "../widget/data";
// import quarterOfYear from 'dayjs/plugin/quarterOfYear' // ES 2015

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.locale("zh-cn");

const disabledDateFunc = (
  currentDate: Dayjs,
  disabledDateRule?: DisabledDateRule,
) => {
  if (!currentDate) {
    return false;
  }
  const today = dayjs();
  const last30DaysStart = today.subtract(30, "days");
  const next30DaysEnd = today.add(30, "days");

  // const startOfCurrentWeek = today.startOf("isoWeek");
  // const endOfCurrentWeek = today.endOf("isoWeek");
  const {
    backOffset = 0,
    disabledRule,
    frontOffset = 0,
    isInvertSelection,
    offsetWay,
    specificDates,
    specificDaysOfMonth,
    specificDaysOfWeek,
    specificMonths,
    specificQuarters,
    specificYear,
  } = disabledDateRule?.config || {};
  // const offsetStartDate = today.add(frontOffset, "day");
  // const offsetEndDate = today.add(backOffset, "day");
  const offsetStartDate = today.add(
    frontOffset > 0 ? frontOffset : frontOffset - 1,
    "day",
  );
  const offsetEndDate = today.add(
    backOffset >= 0 ? backOffset : backOffset - 1,
    "day",
  );

  // console.log(
  //   "日期选择 disabledDateRule",
  //   disabledDateRule,
  //   offsetStartDate.format("YYYY-MM-DD"),
  //   offsetEndDate.format("YYYY-MM-DD"),
  // );

  switch (disabledRule) {
    case "today":
      return currentDate.isSame(today, "day");
    case "beforeToday":
      return currentDate.isBefore(today, "day");
    case "afterToday":
      return currentDate.isAfter(today, "day");
    case "lastYear":
      return currentDate.isBefore(today.subtract(1, "year"), "day");
    case "currentYear":
      return currentDate.year() === today.year();
    case "nextYear":
      return currentDate.isAfter(today.add(1, "year"), "day");
    case "specificYear":
      return specificYear?.includes(currentDate.year().toString());
    case "lastQuarter":
      return (
        currentDate.isAfter(today.subtract(1, "quarter").startOf("quarter")) &&
        currentDate.isBefore(today.subtract(1, "quarter").endOf("quarter"))
      );

    case "currentQuarter":
      return currentDate.isSame(today, "quarter");
    case "nextQuarter":
      return (
        currentDate.isAfter(today.add(1, "quarter").startOf("quarter")) &&
        currentDate.isBefore(today.add(1, "quarter").endOf("quarter"))
      );
    case "specificQuarters":
      return specificQuarters?.includes(currentDate.quarter()?.toString());
    case "last30Days":
      // 从今天开始往前推30天内的日期
      return (
        currentDate.isAfter(last30DaysStart, "day") &&
        currentDate.isBefore(today, "day")
      );

    case "currentMonth":
      return currentDate.isSame(today, "month");
    case "next30Days":
      return (
        currentDate.isAfter(today, "day") &&
        currentDate.isBefore(next30DaysEnd, "day")
      );

    case "specificMonths":
      return specificMonths?.includes((currentDate.month() + 1).toString());
    case "last7days":
      return (
        currentDate.isAfter(today.subtract(7, "days"), "day") &&
        currentDate.isBefore(today, "day")
      );
    case "next7days":
      return (
        currentDate.isAfter(today, "day") &&
        currentDate.isBefore(today.add(7, "days"), "day")
      );
    case "currentWeek":
      return currentDate.isSame(today, "week");
    case "specificDaysOfWeek":
      return specificDaysOfWeek?.includes(currentDate.day().toString());
    case "weekends":
      return currentDate.day() === 0 || currentDate.day() === 6;
    case "specificDates":
      return specificDates?.includes(currentDate.format("YYYY-MM-DD"));
    case "specificDaysOfMonth":
      return specificDaysOfMonth
        ?.split(",")
        .includes(currentDate.date().toString());
    case "offsetRange":
      if (offsetWay === "front") {
        return isInvertSelection
          ? currentDate.isAfter(offsetStartDate)
          : currentDate.isBefore(offsetStartDate);
      } else if (offsetWay === "back") {
        return isInvertSelection
          ? currentDate.isBefore(offsetEndDate)
          : currentDate.isAfter(offsetEndDate);
      } else if (offsetWay === "both") {
        return isInvertSelection
          ? currentDate.isAfter(offsetStartDate) &&
              currentDate.isBefore(offsetEndDate)
          : currentDate.isBefore(offsetStartDate) ||
              currentDate.isAfter(offsetEndDate);
      }
      return false;
    case "custom":
      // 自定义逻辑可以在这里定义
      return false;
    default:
      return false;
  }
};

type DisabledDateRule = {
  label: "禁用日期";
  id: "config";
  config: {
    offsetWay: "front" | "back" | "both";
    isInvertSelection: boolean;
    id: "config";
    label: "菜单项";
    isVisible: true;
    isDisabled: false;
    specificQuarters: string[];
    specificDates: string[];
    specificDaysOfWeek: string[];
    specificDaysOfMonth: string;
    specificYear: string[];
    disabledRule: string;
    specificMonths: string[];
    frontOffset: number;
    backOffset: number;
  };
};
export interface DatePickerWidgetProps {
  widgetName: string;
  disabled?: boolean;
  placeholderText?: string;
  onValueChange: <
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
  showTime?: boolean;
  format?: string;
  picker?: DatePickerProps["picker"];
  loading?: boolean;
  isRangePicker?: boolean;
  allowEmpty?: boolean;
  disabledDateRule?: DisabledDateRule;
  showPreset?: boolean;
  presetRange?: string[];
  presetDate?: string[];
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
    disabledDateRule,
    errorMessage,
    format,
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
    onValueChange,
    picker,
    placeholderText,
    required,
    showPreset,
    showTime,
    widgetId,
    widgetName,
  } = props;
  const [value, setValue] = useState<DatePickerProps["value"]>();
  const [rangeValue, setRangeValue] = useState<RangePickerProps["value"]>();

  const defaultValueMemo = useMemo(() => {
    if (isRangePicker) {
      return JSON.parse(defaultValue || "[]").map((c: any) =>
        c ? dayjs(c) : undefined,
      );
    }
    return defaultValue ? dayjs(defaultValue) : undefined;
  }, [defaultValue]);

  const presetRange = useMemo(() => {
    return DateRangePresetsOptions.filter((c) =>
      props.presetRange?.find((d) => d === c.value),
    ).map((c) => {
      return { label: c.label, value: c.dateValue };
    });
  }, [props.presetRange]);

  const presetDate = useMemo(() => {
    return DatePresetsOptions.filter((c) =>
      props.presetDate?.find((d) => d === c.value),
    ).map((c) => {
      return { label: c.label, value: c.dateValue };
    });
  }, [props.presetDate]);

  useEffect(() => {
    setValue(defaultValueMemo as any);
    setRangeValue(defaultValueMemo as any);
  }, [defaultValueMemo]);

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

    return data;
  }, [required, errorMessage]);

  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log("日期选择 handleChange", date, dateString);
    setValue(date);
    onValueChange?.(date, dateString);
  };
  const handleRangeChange: RangePickerProps["onChange"] = (
    dates,
    dateStrings,
  ) => {
    console.log("日期选择 handleChange", dates, dateStrings);
    setRangeValue(dates);
    onValueChange?.(dates as any, dateStrings);
  };

  const disabledDate = useCallback(
    (d) => disabledDateFunc(d, disabledDateRule),
    [disabledDateRule],
  );

  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY", "DD-MM-YYYY", "DD-MM-YY"];

  const dateFormat = useCallback(() => {
    return dateFormatList;
    if (format) return format;
    if (showTime) return "YYYY-MM-DD HH:mm:ss";
    return "YYYY-MM-DD";
  }, [format, showTime]);

  console.group("Antd 日期选择框");
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
            allowEmpty={allowEmpty}
            defaultValue={defaultValueMemo}
            disabled={disabled}
            disabledDate={disabledDate}
            format={format}
            isRangePicker={isRangePicker}
            onChange={handleChange}
            onRangeChange={handleRangeChange}
            placeholder={placeholderText}
            presetDate={presetDate}
            presetRange={presetRange}
            rangeValue={rangeValue}
            showPreset={showPreset}
            type={picker}
            // defaultValue={defaultValueMemo}
            // format={"MM/DD"}
            // format={dateFormat}
            showTime={showTime}
            size={controlSize}
            value={value}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};
const PickerWithType = (props: {
  value: DatePickerProps["value"];
  rangeValue: RangePickerProps["value"];
  type: DatePickerProps["picker"];
  onChange: TimePickerProps["onChange"] | DatePickerProps["onChange"];
  onRangeChange: RangePickerProps["onChange"];
  showPreset?: boolean;
  isRangePicker?: boolean;
  presetRange: any;
  presetDate: any;
  [key: string]: any;
}) => {
  const {
    onChange,
    onRangeChange,
    presetDate,
    presetRange,
    rangeValue,
    showPreset,
    type,
    value,
  } = props;
  console.group("Antd 日期选择框 PickerWithType");
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
      <DatePicker.RangePicker
        {...rangeProps}
        presets={showPreset ? presetRange : undefined}
        value={rangeValue}
        picker={type}
        // defaultValue={[dayjs("2024-07-13"), dayjs("2024-07-23")]}
        onChange={onRangeChange}
      />
    );
  }

  // if (type === "time") return <TimePicker {...props} onChange={onChange} />;
  if (type === "date")
    return (
      <DatePicker
        {...props}
        onChange={onChange}
        picker={type}
        presets={showPreset ? presetDate : undefined}
      />
    );
  return (
    <DatePicker
      {...props}
      onChange={onChange}
      picker={type}
      presets={showPreset ? presetDate : undefined}
    />
  );
};
export default DatePickerWidget;
