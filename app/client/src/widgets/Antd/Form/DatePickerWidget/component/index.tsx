import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { DatePickerProps, TimePickerProps } from "antd";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import locale from "antd/locale/zh_CN";
import { AntdLabelPosition } from "components/constants";
import type { RenderMode, TextSize } from "constants/WidgetConstants";
import type { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AntdFormItemContainer } from "widgets/Antd/Style";

// 使用 weekday 插件
dayjs.extend(weekday);
// isoWeek

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import type { RangePickerProps } from "antd/es/date-picker";
import "dayjs/locale/zh-cn";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { isEqual, omit } from "lodash";
import { DatePresetsOptions, DateRangePresetsOptions } from "../widget/data";
import { simpleDiff } from "widgets/Antd/tools/tool";
// import quarterOfYear from 'dayjs/plugin/quarterOfYear' // ES 2015

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.locale("zh-cn");

const disabledDateFunc = (
  currentDate: Dayjs,
  disabledDateRule?: DisabledDateRule,
): boolean => {
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
      return specificYear?.includes(currentDate.year().toString()) || false;
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
      return (
        specificQuarters?.includes(currentDate.quarter()?.toString()) || false
      );
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
      return (
        specificMonths?.includes((currentDate.month() + 1).toString()) || false
      );
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
      return (
        specificDaysOfWeek?.includes(currentDate.day().toString()) || false
      );
    case "weekends":
      return currentDate.day() === 0 || currentDate.day() === 6;
    case "specificDates":
      return (
        specificDates?.includes(currentDate?.format("YYYY-MM-DD")) || false
      );
    case "specificDaysOfMonth":
      return (
        specificDaysOfMonth
          ?.split(",")
          .includes(currentDate.date().toString()) || false
      );
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
  widgetName?: string;
  disabled?: boolean;
  placeholderText?: string;
  placeholderTextStart?: string;
  placeholderTextEnd?: string;
  onDateSelected?: string;
  onChange?: <T extends Dayjs | Dayjs[] | null, U extends string | string[]>(
    value: T,
    dateString: U,
  ) => void;
  onRangeChange?: RangePickerProps["onChange"];
  labelText?: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  labelTooltip?: string;
  compactMode?: boolean;
  width?: number;
  isValid?: boolean;
  borderRadius?: string;
  boxShadow?: string;
  colorPrimary?: string;
  widgetId?: string;
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
  disabledDateRule?: DisabledDateRule;
  showPreset?: boolean;
  presetRange?: string[];
  presetDate?: string[];
  showNow?: boolean;
  isEnabledDateValid?: boolean;
  onOk?: () => void;
  selectedValue?: string | [string, string];
  handleDateValid?: (value: any) => void;
  isDateValid?: boolean | boolean[];
  unValidDateMessage?: string;
  accessor?: string | string[];
  allowEmptyStartTime: boolean;
  allowEmptyEndTime: boolean;
  disabledDate?: (date: Dayjs) => boolean;
  placeholder?: string;
  presets?: {
    range: RangePickerProps["presets"];
    date: DatePickerProps["presets"];
  };
  size?: SizeType;
  value?: DatePickerProps["value"];
  rangeValue?: RangePickerProps["value"];
}

// DatePickerBase.tsx - 拆分基础组件
const DatePickerBase = memo(function DatePickerBase({
  allowClear,
  allowEmptyEndTime,
  allowEmptyStartTime,
  disabled,
  disabledDate,
  format,
  isRangePicker,
  onChange,
  onOk,
  onRangeChange,
  picker,
  placeholder,
  presets,
  rangeValue,
  showNow,
  showTime,
  size,
  value,
}: DatePickerWidgetProps) {
  if (isRangePicker) {
    return (
      <DatePicker.RangePicker
        allowClear={allowClear}
        allowEmpty={[allowEmptyStartTime, allowEmptyEndTime]}
        disabled={disabled}
        disabledDate={disabledDate}
        format={format}
        onChange={onRangeChange}
        onOk={onOk}
        picker={picker}
        placeholder={placeholder as any}
        presets={presets?.range}
        showTime={showTime}
        size={size}
        value={rangeValue}
      />
    );
  }

  return (
    <DatePicker
      allowClear={allowClear}
      disabled={disabled}
      disabledDate={disabledDate}
      format={format}
      onChange={onChange}
      onOk={onOk}
      picker={picker}
      placeholder={placeholder as any}
      presets={presets?.date}
      showNow={showNow}
      showTime={showTime}
      size={size}
      value={value}
    />
  );
},
isEqual);

// hooks/useDatePickerValue.ts
function useDatePickerValue({
  defaultValue,
  format,
  isRangePicker,
  selectedValue,
}: {
  defaultValue?: string;
  format?: string;
  isRangePicker?: boolean;
  selectedValue?: string | [string, string];
}) {
  const [value, setValue] = useState<DatePickerProps["value"]>();
  const [rangeValue, setRangeValue] = useState<RangePickerProps["value"]>();

  const defaultValueMemo = useMemo(() => {
    if (isRangePicker) {
      try {
        return JSON.parse(defaultValue || "[]").map((c: any) =>
          c ? dayjs(c, format) : undefined,
        );
      } catch (error) {
        return [undefined, undefined];
      }
    }
    return defaultValue?.length ? dayjs(defaultValue, format) : undefined;
  }, [defaultValue, format, isRangePicker]);

  useEffect(() => {
    !Array.isArray(defaultValueMemo) && setValue(defaultValueMemo);
    setRangeValue(defaultValueMemo);
  }, [defaultValueMemo]);

  useEffect(() => {
    if (!selectedValue) return setValue(undefined);

    let transValue;
    if (isRangePicker) {
      transValue = Array.isArray(selectedValue)
        ? selectedValue.map((v) => (v ? dayjs(v, format) : undefined))
        : [dayjs(selectedValue, format), undefined];
      setRangeValue(transValue as RangePickerProps["value"]);
    } else {
      transValue = Array.isArray(selectedValue)
        ? dayjs(selectedValue[0], format)
        : dayjs(selectedValue, format);
      setValue(transValue);
    }
  }, [selectedValue, format, isRangePicker]);

  return { value, setValue, rangeValue, setRangeValue, defaultValueMemo };
}

// hooks/useDateValidation.ts
function useDateValidation({
  disabledDateRule,
  handleDateValid,
  isEnabledDateValid,
  rangeValue,
  value,
}: {
  disabledDateRule?: DisabledDateRule;
  handleDateValid?: (value: any) => void;
  isEnabledDateValid?: boolean;
  rangeValue?: RangePickerProps["value"];
  value?: DatePickerProps["value"];
}) {
  useEffect(() => {
    if (!isEnabledDateValid) return;

    if (rangeValue) {
      const [startDate, endDate] = rangeValue;
      handleDateValid?.([
        startDate && !disabledDateFunc(startDate, disabledDateRule),
        endDate && !disabledDateFunc(endDate, disabledDateRule),
      ]);
    } else if (value) {
      handleDateValid?.(!disabledDateFunc(value, disabledDateRule));
    }
  }, [
    value,
    rangeValue,
    disabledDateRule,
    handleDateValid,
    isEnabledDateValid,
  ]);
}

// hooks/usePresets.ts
function usePresets(presetRange?: string[], presetDate?: string[]) {
  return useMemo<DatePickerWidgetProps["presets"]>(
    () => ({
      range: DateRangePresetsOptions.filter((c) =>
        presetRange?.includes(c.value),
      ).map((c) => ({ label: c.label, value: c.getValue() })) as any[],
      date: DatePresetsOptions.filter((c) => presetDate?.includes(c.value)).map(
        (c) => ({ label: c.label, value: c.getValue() }),
      ),
    }),
    [presetRange, presetDate],
  );
}

// 主组件
const DatePickerWidget: React.FC<DatePickerWidgetProps> = memo(
  function DatePickerWidget(props) {
    const {
      accessor,
      allowClear = true,
      allowEmptyEndTime = false,
      allowEmptyStartTime = false,
      borderRadius,
      boxShadow,
      colorPrimary,
      controlSize,
      disabled,
      disabledDateRule,
      errorMessage,
      format,
      handleDateValid,
      isDateValid,
      isEnabledDateValid,
      isRangePicker,
      labelAlignment,
      labelPosition,
      labelStyle,
      labelText,
      labelTextColor,
      labelTextSize,
      labelTooltip,
      labelWidth,
      onChange,
      picker,
      placeholderText,
      placeholderTextEnd,
      placeholderTextStart,
      required,
      showNow,
      showPreset,
      showTime,
      unValidDateMessage,
      widgetName,
    } = props;

    // 使用自定义 hooks 管理状态和计算值
    const { defaultValueMemo, rangeValue, setRangeValue, setValue, value } =
      useDatePickerValue(props);

    const presets = usePresets(props.presetRange, props.presetDate);

    useDateValidation({
      disabledDateRule,
      handleDateValid,
      isEnabledDateValid,
      rangeValue,
      value,
    });

    // 缓存计算值
    const colLayout = useMemo(
      () =>
        labelPosition === AntdLabelPosition.Left
          ? {
              labelCol: { sm: { span: labelWidth } },
              wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
            }
          : {},
      [labelPosition, labelWidth],
    );

    const validateProps = useMemo<ProFormItemProps>(
      () => ({
        required,
        validateTrigger: ["onChange", "onBlur"],
        rules: [
          {
            required,
            message: errorMessage,
            validateTrigger: ["onChange", "onBlur"],
            validator: async (_: any, value: any) => {
              if (required && !value) {
                return Promise.reject(errorMessage);
              }
              return Promise.resolve();
            },
          },
        ],
        ...(isEnabledDateValid && isDateValid?.toString()?.includes?.("false")
          ? {
              validateStatus: "error",
              help: unValidDateMessage,
            }
          : {}),
      }),
      [
        required,
        errorMessage,
        isEnabledDateValid,
        isDateValid,
        unValidDateMessage,
      ],
    );

    const placeholder = useMemo(
      () =>
        isRangePicker
          ? [placeholderTextStart, placeholderTextEnd]
          : placeholderText,
      [
        isRangePicker,
        placeholderTextStart,
        placeholderTextEnd,
        placeholderText,
      ],
    );

    // 缓存回调函数
    const handleChange = useCallback(
      (date: any, dateString: any) => {
        setValue(date);
        onChange?.(date, dateString);
      },
      [onChange],
    );

    const handleRangeChange = useCallback(
      (dates: any, dateStrings: any) => {
        setRangeValue(dates);
        onChange?.(dates, dateStrings);
      },
      [onChange],
    );

    const handleOk = useCallback(() => {
      props.onOk?.();
    }, [props.onOk]);

    const disabledDate = useCallback(
      (d: Dayjs) => disabledDateFunc(d, disabledDateRule),
      [disabledDateRule],
    );

    // 主题配置
    const theme = useMemo(
      () => ({
        components: {
          Form: {
            labelColor: labelTextColor,
            labelFontSize: (labelTextSize as unknown as number) || 0,
          },
          DatePicker: {
            colorPrimary,
            borderRadius: (borderRadius as unknown as number) || 0,
            boxShadow,
          },
          Button: { colorPrimary },
          Dropdown: { colorPrimary },
        },
      }),
      [labelTextColor, labelTextSize, colorPrimary, borderRadius, boxShadow],
    );

    return (
      <AntdFormItemContainer
        boxShadow={boxShadow}
        className="antd-datepicker-container"
        labelPosition={labelPosition}
        labelStyle={labelStyle}
      >
        <ConfigProvider locale={locale} theme={theme}>
          <ProFormItem
            label={labelText}
            labelAlign={labelAlignment}
            name={accessor || widgetName}
            tooltip={labelTooltip}
            {...validateProps}
            {...colLayout}
          >
            <DatePickerBase
              allowClear={allowClear}
              allowEmptyEndTime={allowEmptyEndTime}
              allowEmptyStartTime={allowEmptyStartTime}
              defaultValue={defaultValueMemo}
              disabled={disabled}
              disabledDate={disabledDate}
              errorMessage={errorMessage}
              format={format}
              isRangePicker={isRangePicker}
              onChange={handleChange}
              onOk={handleOk}
              onRangeChange={handleRangeChange}
              picker={picker}
              placeholder={placeholder as any}
              presets={showPreset ? presets : undefined}
              rangeValue={rangeValue}
              showNow={showNow}
              showTime={showTime}
              size={controlSize}
              value={value}
            />
          </ProFormItem>
        </ConfigProvider>
      </AntdFormItemContainer>
    );
  },
);

// Props 比较函数
function arePropsEqual(
  prev: DatePickerWidgetProps,
  next: DatePickerWidgetProps,
) {
  if (process.env.NODE_ENV === "development") {
    const differences = simpleDiff(prev, next);
    if (differences) {
      console.log("DatePicker props changed:", differences);
    }
  }
  return isEqual(prev, next);
}

export default memo(DatePickerWidget, arePropsEqual);
