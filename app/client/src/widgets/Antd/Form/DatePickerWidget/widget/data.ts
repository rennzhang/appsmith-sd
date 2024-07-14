import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { SubTextPosition } from "design-system-old";
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

export const DisabledRuleOptions = [
  { label: "无", value: "none" },
  { label: "禁用今天", value: "today" },
  { label: "禁用今天之前的日期", value: "beforeToday" },
  { label: "禁用今天之后的日期", value: "afterToday" },
  { label: "禁用过去一年前", value: "lastYear" },
  { label: "禁用本年", value: "currentYear" },
  { label: "禁用未来一年后", value: "nextYear" },
  { label: "禁用特定年份", value: "specificYear" },
  { label: "禁用上季度", value: "lastQuarter" },
  { label: "禁用本季度", value: "currentQuarter" },
  { label: "禁用下季度", value: "nextQuarter" },
  { label: "禁用特定季度", value: "specificQuarters" },
  { label: "禁用过去 30 天", value: "last30Days" },
  { label: "禁用本月", value: "currentMonth" },
  { label: "禁用未来 30 天", value: "next30Days" },
  { label: "禁用特定月份", value: "specificMonths" },
  { label: "禁用过去七天", value: "last7days" },
  { label: "禁用未来七天", value: "next7days" },
  { label: "禁用本周", value: "currentWeek" },
  { label: "禁用特定星期几", value: "specificDaysOfWeek" },
  { label: "禁用周末", value: "weekends" },
  { label: "禁用特定日期", value: "specificDates" },
  // 禁用每月指定日期
  { label: "禁用每月特定日期", value: "specificDaysOfMonth" },
  // 自定义范围
  { label: "基于偏移量的自定义范围", value: "offsetRange" },

  // { label: "自定义规则", value: "customFunc" },
];

export const DatePresetsOptions = [
  { label: "今天", value: "today", dateValue: dayjs() },
  { label: "明天", value: "tomorrow", dateValue: dayjs().add(1, "day") },
  { label: "昨天", value: "yesterday", dateValue: dayjs().subtract(1, "day") },
  {
    label: "前天",
    value: "the day before yesterday",
    dateValue: dayjs().subtract(2, "day"),
  },
  {
    label: "后天",
    value: "the day after tomorrow",
    dateValue: dayjs().add(2, "day"),
  },
  { label: "上周", value: "last week", dateValue: dayjs().subtract(1, "week") },
  { label: "本周", value: "this week", dateValue: dayjs() },
  { label: "下周", value: "next week", dateValue: dayjs().add(1, "week") },
  {
    label: "上个月",
    value: "last month",
    dateValue: dayjs().subtract(1, "month"),
  },
  { label: "本月", value: "this month", dateValue: dayjs() },
  { label: "下个月", value: "next month", dateValue: dayjs().add(1, "month") },
  {
    label: "上季度",
    value: "last quarter",
    dateValue: dayjs().subtract(1, "quarter"),
  },
  { label: "本季度", value: "this quarter", dateValue: dayjs() },
  {
    label: "下季度",
    value: "next quarter",
    dateValue: dayjs().add(1, "quarter"),
  },
  {
    label: "半年前",
    value: "half a year ago",
    dateValue: dayjs().subtract(6, "month"),
  },
  {
    label: "半年后",
    value: "half a year later",
    dateValue: dayjs().add(6, "month"),
  },
  { label: "去年", value: "last year", dateValue: dayjs().subtract(1, "year") },
  { label: "今年", value: "this year", dateValue: dayjs() },
  { label: "明年", value: "next year", dateValue: dayjs().add(1, "year") },
  {
    label: "3 天前",
    value: "3 days ago",
    dateValue: dayjs().subtract(3, "day"),
  },
  {
    label: "7 天前",
    value: "7 days ago",
    dateValue: dayjs().subtract(7, "day"),
  },
  {
    label: "14 天前",
    value: "14 days ago",
    dateValue: dayjs().subtract(14, "day"),
  },
  {
    label: "30 天前",
    value: "30 days ago",
    dateValue: dayjs().subtract(30, "day"),
  },
  {
    label: "60 天前",
    value: "60 days ago",
    dateValue: dayjs().subtract(60, "day"),
  },
  {
    label: "90 天前",
    value: "90 days ago",
    dateValue: dayjs().subtract(90, "day"),
  },
  {
    label: "180 天前",
    value: "180 days ago",
    dateValue: dayjs().subtract(180, "day"),
  },
  {
    label: "1 年前",
    value: "1 year ago",
    dateValue: dayjs().subtract(1, "year"),
  },
  {
    label: "2 年前",
    value: "2 years ago",
    dateValue: dayjs().subtract(2, "year"),
  },
  {
    label: "5 年前",
    value: "5 years ago",
    dateValue: dayjs().subtract(5, "year"),
  },
  {
    label: "3 天后",
    value: "3 days later",
    dateValue: dayjs().add(3, "day"),
  },
  {
    label: "7 天后",
    value: "7 days later",
    dateValue: dayjs().add(7, "day"),
  },
  {
    label: "14 天后",
    value: "14 days later",
    dateValue: dayjs().add(14, "day"),
  },
  {
    label: "30 天后",
    value: "30 days later",
    dateValue: dayjs().add(30, "day"),
  },
  {
    label: "60 天后",
    value: "60 days later",
    dateValue: dayjs().add(60, "day"),
  },
  {
    label: "90 天后",
    value: "90 days later",
    dateValue: dayjs().add(90, "day"),
  },
  {
    label: "180 天后",
    value: "180 days later",
    dateValue: dayjs().add(180, "day"),
  },
  {
    label: "1 年后",
    value: "1 year later",
    dateValue: dayjs().add(1, "year"),
  },
  {
    label: "2 年后",
    value: "2 years later",
    dateValue: dayjs().add(2, "year"),
  },
  {
    label: "5 年后",
    value: "5 years later",
    dateValue: dayjs().add(5, "year"),
  },
];

//过去 3 天、未来 3 天、过去 7 天、未来 7 天、过去 14 天、未来 14、过去 30 天、未来 30 天、上周、本周、下周、 天上个月、本月、下个月、上季度、本季度、下季度、上半年、下半年、今年、明年、去年, 转化以上数据为 options，用逗号分隔value,比如 "subtract_1_day,subtract_1_day"
export const DateRangePresetsOptions = [
  {
    label: "今天",
    value: "today",
    dateValue: [dayjs().startOf("day"), dayjs().endOf("day")],
  },

  {
    label: "上周",
    value: "last week",
    dateValue: [
      dayjs().subtract(1, "week").startOf("isoWeek"),
      dayjs().subtract(1, "week").endOf("isoWeek"),
    ],
  },
  {
    label: "本周",
    value: "this week",
    dateValue: [dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")],
  },
  {
    label: "下周",
    value: "next week",
    dateValue: [
      dayjs().add(1, "week").startOf("isoWeek"),
      dayjs().add(1, "week").endOf("isoWeek"),
    ],
  },

  {
    label: "上个月",
    value: "last month",
    dateValue: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  },
  {
    label: "本月",
    value: "this month",
    dateValue: [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "下个月",
    value: "next month",
    dateValue: [
      dayjs().add(1, "month").startOf("month"),
      dayjs().add(1, "month").endOf("month"),
    ],
  },

  {
    label: "上季度",
    value: "last quarter",
    dateValue: [
      dayjs().subtract(1, "quarter").startOf("quarter"),
      dayjs().subtract(1, "quarter").endOf("quarter"),
    ],
  },
  {
    label: "本季度",
    value: "this quarter",
    dateValue: [dayjs().startOf("quarter"), dayjs().endOf("quarter")],
  },
  {
    label: "下季度",
    value: "next quarter",
    dateValue: [
      dayjs().add(1, "quarter").startOf("quarter"),
      dayjs().add(1, "quarter").endOf("quarter"),
    ],
  },

  {
    label: "上半年",
    value: "last half year",
    dateValue: [
      dayjs().month(0).startOf("month"),
      dayjs().month(5).endOf("month"),
    ],
  },
  {
    label: "下半年",
    value: "next half year",
    dateValue: [
      dayjs().month(6).startOf("month"),
      dayjs().month(11).endOf("month"),
    ],
  },
  {
    label: "去年",
    value: "last year",
    dateValue: [
      dayjs().subtract(1, "year").startOf("year"),
      dayjs().subtract(1, "year").endOf("year"),
    ],
  },
  {
    label: "今年",
    value: "this year",
    dateValue: [dayjs().startOf("year"), dayjs().endOf("year")],
  },
  {
    label: "明年",
    value: "next year",
    dateValue: [
      dayjs().add(1, "year").startOf("year"),
      dayjs().add(1, "year").endOf("year"),
    ],
  },

  {
    label: "过去 3 天",
    value: "past 3 days",
    dateValue: [
      dayjs().subtract(3, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 7 天",
    value: "past 7 days",
    dateValue: [
      dayjs().subtract(7, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 14 天",
    value: "past 14 days",
    dateValue: [
      dayjs().subtract(14, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 30 天",
    value: "past 30 days",
    dateValue: [
      dayjs().subtract(30, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 60 天",
    value: "past 60 days",
    dateValue: [
      dayjs().subtract(60, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 90 天",
    value: "past 90 days",
    dateValue: [
      dayjs().subtract(90, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 180 天",
    value: "past 180 days",
    dateValue: [
      dayjs().subtract(180, "day").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 1 年",
    value: "past 1 year",
    dateValue: [
      dayjs().subtract(1, "year").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 2 年",
    value: "past 2 years",
    dateValue: [
      dayjs().subtract(2, "year").startOf("day"),
      dayjs().endOf("day"),
    ],
  },
  {
    label: "过去 5 年",
    value: "past 5 years",
    dateValue: [
      dayjs().subtract(5, "year").startOf("day"),
      dayjs().endOf("day"),
    ],
  },

  {
    label: "未来 3 天",
    value: "next 3 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(3, "day").endOf("day")],
  },
  {
    label: "未来 7 天",
    value: "next 7 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(7, "day").endOf("day")],
  },
  {
    label: "未来 14 天",
    value: "next 14 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(14, "day").endOf("day")],
  },
  {
    label: "未来 30 天",
    value: "next 30 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(30, "day").endOf("day")],
  },
  {
    label: "未来 60 天",
    value: "next 60 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(60, "day").endOf("day")],
  },
  {
    label: "未来 90 天",
    value: "next 90 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(90, "day").endOf("day")],
  },
  {
    label: "未来 180 天",
    value: "next 180 days",
    dateValue: [dayjs().startOf("day"), dayjs().add(180, "day").endOf("day")],
  },
  {
    label: "未来 1 年",
    value: "next 1 year",
    dateValue: [dayjs().startOf("day"), dayjs().add(1, "year").endOf("day")],
  },
  {
    label: "未来 2 年",
    value: "next 2 years",
    dateValue: [dayjs().startOf("day"), dayjs().add(2, "year").endOf("day")],
  },
  {
    label: "未来 5 年",
    value: "next 5 years",
    dateValue: [dayjs().startOf("day"), dayjs().add(5, "year").endOf("day")],
  },
];

export const DateFormatOptions = [
  {
    label: dayjs().format("YYYY-MM-DD"),
    subText: "YYYY-MM-DD",
    value: "YYYY-MM-DD",
  },
  {
    label: dayjs().format("DD/MM/YYYY"),
    subText: "DD/MM/YYYY",
    value: "DD/MM/YYYY",
  },
  {
    label: dayjs().format("MM/DD/YYYY"),
    subText: "MM/DD/YYYY",
    value: "MM/DD/YYYY",
  },
  {
    label: dayjs().format("YYYY-MM-DD HH:mm"),
    subText: "YYYY-MM-DD HH:mm",
    value: "YYYY-MM-DD HH:mm",
  },
  {
    label: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    subText: "YYYY-MM-DD HH:mm:ss",
    value: "YYYY-MM-DD HH:mm:ss",
  },
  {
    label: dayjs().format("DD-MM-YYYY"),
    subText: "DD-MM-YYYY",
    value: "DD-MM-YYYY",
  },
  {
    label: dayjs().format("MM-DD-YYYY"),
    subText: "MM-DD-YYYY",
    value: "MM-DD-YYYY",
  },
  {
    label: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    subText: "YYYY-MM-DDTHH:mm:ss",
    value: "YYYY-MM-DDTHH:mm:ss",
  },
  {
    label: dayjs().format("DD/MM/YYYY HH:mm"),
    subText: "DD/MM/YYYY HH:mm",
    value: "DD/MM/YYYY HH:mm",
  },
  {
    label: dayjs().format("DD/MM/YY"),
    subText: "DD/MM/YY",
    value: "DD/MM/YY",
  },
  {
    label: dayjs().format("MM/DD/YY"),
    subText: "MM/DD/YY",
    value: "MM/DD/YY",
  },
  // 周
  {
    label: dayjs().format("YYYY-W周"),
    subText: "YYYY-W周",
    value: "YYYY-W周",
  },
  {
    label: dayjs().format("W周-YYYY"),
    subText: "W周-YYYY",
    value: "W周-YYYY",
  },
  {
    label: dayjs().format("YYYY/W周"),
    subText: "YYYY/W周",
    value: "YYYY/W周",
  },
  {
    label: dayjs().format("W周/YYYY"),
    subText: "W周/YYYY",
    value: "W周/YYYY",
  },
  {
    label: dayjs().format("YYYY, W周"),
    subText: "YYYY, W周",
    value: "YYYY, W周",
  },
  {
    label: dayjs().format("W周, YYYY"),
    subText: "W周, YYYY",
    value: "W周, YYYY",
  },

  // 月
  {
    label: dayjs().format("YYYY-MM"),
    subText: "YYYY-MM",
    value: "YYYY-MM",
  },
  {
    label: dayjs().format("YYYY-MMMM"),
    subText: "YYYY-MMMM",
    value: "YYYY-MMMM",
  },
  {
    label: dayjs().format("MM-YYYY"),
    subText: "MM-YYYY",
    value: "MM-YYYY",
  },
  {
    label: dayjs().format("MMMM-YYYY"),
    subText: "MMMM-YYYY",
    value: "MMMM-YYYY",
  },

  {
    label: dayjs().format("YYYY/MM"),
    subText: "YYYY/MM",
    value: "YYYY/MM",
  },
  {
    label: dayjs().format("YYYY/MMMM"),
    subText: "YYYY/MMMM",
    value: "YYYY/MMMM",
  },
  {
    label: dayjs().format("MM/YYYY"),
    subText: "MM/YYYY",
    value: "MM/YYYY",
  },
  {
    label: dayjs().format("MMMM/YYYY"),
    subText: "MMMM/YYYY",
    value: "MMMM/YYYY",
  },
  {
    label: dayjs().format("MMMM, YYYY"),
    subText: "MMMM, YYYY",
    value: "MMMM, YYYY",
  },
  {
    label: dayjs().format("YYYY, MMMM"),
    subText: "YYYY, MMMM",
    value: "YYYY, MMMM",
  },

  // 季度
  {
    label: dayjs().format("Qo, YYYY"),
    subText: "[Q]Q, YYYY",
    value: "[Q]Q, YYYY",
  },
  {
    label: dayjs().format("YYYY, [Q]Q"),
    subText: "YYYY, [Q]Q",
    value: "YYYY, [Q]Q",
  },
  {
    label: dayjs().format("[Q]Q-YYYY"),
    subText: "[Q]Q-YYYY",
    value: "[Q]Q-YYYY",
  },
  {
    label: dayjs().format("YYYY-[Q]Q"),
    subText: "YYYY-[Q]Q",
    value: "YYYY-[Q]Q",
  },
  // 年
  {
    label: dayjs().format("YYYY"),
    subText: "YYYY",
    value: "YYYY",
  },
  {
    label: dayjs().format("YYYY-MM-DD hh:mm:ss A"),
    subText: "YYYY-MM-DD hh:mm:ss A",
    value: "YYYY-MM-DD hh:mm:ss A",
  },
  {
    label: dayjs().format("D MMMM, YYYY"),
    subText: "D MMMM, YYYY",
    value: "D MMMM, YYYY",
  },
  {
    label: dayjs().format("H:mm A D MMMM, YYYY"),
    subText: "H:mm A D MMMM, YYYY",
    value: "H:mm A D MMMM, YYYY",
  },
  {
    label: dayjs().format("YYYY-MM-DDTHH:mm:ss.sssZ"),
    subText: "ISO 8601",
    value: "YYYY-MM-DDTHH:mm:ss.sssZ",
  },
  {
    label: dayjs().format("LLL"),
    subText: "LLL",
    value: "LLL",
  },
  {
    label: dayjs().format("LL"),
    subText: "LL",
    value: "LL",
  },
].map((x) => ({
  ...x,
  subTextPosition: SubTextPosition.BOTTOM,
}));
