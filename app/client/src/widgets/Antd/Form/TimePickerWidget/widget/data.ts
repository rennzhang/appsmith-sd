import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { SubTextPosition } from "design-system-old";
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

const getNow = () => dayjs().format("HH:mm:ss");

const getLastMinutes = (minutes: number) =>
  dayjs().subtract(minutes, "minute").format("HH:mm:ss");
const getNextMinutes = (minutes: number) =>
  dayjs().add(minutes, "minute").format("HH:mm:ss");

const getLastHours = (hours: number) =>
  dayjs().subtract(hours, "hour").format("HH:mm:ss");
const getNextHours = (hours: number) =>
  dayjs().add(hours, "hour").format("HH:mm:ss");
export const DisabledRuleOptions = [
  { label: "无", value: "none" },
  {
    label: "禁用当日已过时间",
    value: "beforeNow_FIXED",
    getRangeValue: () => [`00:00:00-${getNow()}`],
  },
  {
    label: "禁用当日剩余时间",
    value: "afterNow_FIXED",
    getRangeValue: () => [`${getNow()}-23:59:59`],
  },
  // 上午和下午
  {
    label: "禁用上午",
    value: "am",
    getRangeValue: () => [`00:00:00-11:59:59`],
    diabledHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    label: "禁用下午",
    value: "pm",
    getRangeValue: () => [`12:00:00-23:59:59`],
    diabledHours: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  // 过去未来5分钟
  {
    label: "禁用过去5分钟",
    value: "last5Minutes_FIXED",
    getRangeValue: () => [`${getLastMinutes(5)}-${dayjs().format("HH:mm:ss")}`],
  },
  {
    label: "禁用未来5分钟",
    value: "next5Minutes_FIXED",
    getRangeValue: () => [`${getNow()}-${getNextMinutes(5)}`],
  },
  // 过去未来10分钟
  {
    label: "禁用过去10分钟",
    value: "last10Minutes_FIXED",
    getRangeValue: () => [`${getLastMinutes(10)}-${getNow()}`],
  },
  {
    label: "禁用未来10分钟",
    value: "next10Minutes_FIXED",
    getRangeValue: () => [`${getNow()}-${getNextMinutes(10)}`],
  },
  // 过去未来15分钟
  {
    label: "禁用过去15分钟",
    value: "last15Minutes_FIXED",
    // getRangeValue: () => [dayjs().subtract(15, "minute"), dayjs()],
    getRangeValue: () => [`${getLastMinutes(15)}-${getNow()}`],
  },
  {
    label: "禁用未来15分钟",
    value: "next15Minutes_FIXED",
    getRangeValue: () => [`${getNow()}-${getNextMinutes(15)}`],
  },
  // 过去未来30分钟
  {
    label: "禁用过去30分钟",
    value: "last30Minutes_FIXED",
    getRangeValue: () => [`${getLastMinutes(30)}-${getNow()}`],
  },
  {
    label: "禁用未来30分钟",
    value: "next30Minutes_FIXED",
    getRangeValue: () => [`${getNow()}-${getNextMinutes(30)}`],
  },
  // 过去未来45分钟
  {
    label: "禁用过去45分钟",
    value: "last45Minutes_FIXED",
    getRangeValue: () => [`${getLastMinutes(45)}-${getNow()}`],
  },
  {
    label: "禁用未来45分钟",
    value: "next45Minutes_FIXED",
    getRangeValue: () => [`${getNow()}-${getNextMinutes(45)}`],
  },
  // 过去未来1小时
  {
    label: "禁用过去1小时",
    value: "last1Hour_FIXED",
    getRangeValue: () => [`${getLastHours(1)}-${getNow()}`],
  },
  {
    label: "禁用未来1小时",
    value: "next1Hour_FIXED",
    getRangeValue: () => [`${getNextHours(1)}-${getNow()}`],
  },
  // 过去未来3小时
  {
    label: "禁用过去3小时",
    value: "last3Hours_FIXED",
    getRangeValue: () => [`${getLastHours(3)}-${getNow()}`],
  },
  {
    label: "禁用未来3小时",
    value: "next3Hours_FIXED",
    getRangeValue: () => [`${getNextHours(3)}-${getNow()}`],
  },
  // 过去未来6小时
  {
    label: "禁用过去6小时",
    value: "last6Hours_FIXED",
    getRangeValue: () => [`${getLastHours(6)}-${getNow()}`],
  },
  {
    label: "禁用未来6小时",
    value: "next6Hours_FIXED",
    getRangeValue: () => [`${getNextHours(6)}-${getNow()}`],
  },
  // 过去未来12小时
  {
    label: "禁用过去12小时",
    value: "last12Hours_FIXED",
    getRangeValue: () => [`${getLastHours(12)}-${getNow()}`],
  },
  {
    label: "禁用未来12小时",
    value: "next12Hours_FIXED",
    getRangeValue: () => [`${getNextHours(12)}-${getNow()}`],
  },
  // 禁用指定时分秒
  {
    label: "禁用指定时分秒",
    value: "specificHMS",
  },
  {
    label: "禁用特定时间",
    value: "specificTime",
  },
  // 自定义范围
  { label: "自定义多时间段", value: "customRanges" },
];
export const TimePresetsOptions = [
  {
    label: "1 分钟前",
    value: "1 minute ago",
    getValue: () => dayjs().subtract(1, "minute"),
  },
  {
    label: "1 分钟后",
    value: "1 minute later",
    getValue: () => dayjs().add(1, "minute"),
  },
  {
    label: "5 分钟前",
    value: "5 minutes ago",
    getValue: () => dayjs().subtract(5, "minute"),
  },
  {
    label: "5 分钟后",
    value: "5 minutes later",
    getValue: () => dayjs().add(5, "minute"),
  },
  {
    label: "10 分钟前",
    value: "10 minutes ago",
    getValue: () => dayjs().subtract(10, "minute"),
  },
  {
    label: "10 分钟后",
    value: "10 minutes later",
    getValue: () => dayjs().add(10, "minute"),
  },
  {
    label: "15 分钟前",
    value: "15 minutes ago",
    getValue: () => dayjs().subtract(15, "minute"),
  },
  {
    label: "15 分钟后",
    value: "15 minutes later",
    getValue: () => dayjs().add(15, "minute"),
  },
  {
    label: "30 分钟前",
    value: "30 minutes ago",
    getValue: () => dayjs().subtract(30, "minute"),
  },
  {
    label: "30 分钟后",
    value: "30 minutes later",
    getValue: () => dayjs().add(30, "minute"),
  },
  {
    label: "45 分钟前",
    value: "45 minutes ago",
    getValue: () => dayjs().subtract(45, "minute"),
  },
  {
    label: "45 分钟后",
    value: "45 minutes later",
    getValue: () => dayjs().add(45, "minute"),
  },

  {
    label: "1 小时前",
    value: "1 hour ago",
    getValue: () => dayjs().subtract(1, "hour"),
  },
  {
    label: "1 小时后",
    value: "1 hour later",
    getValue: () => dayjs().add(1, "hour"),
  },

  {
    label: "3 小时前",
    value: "3 hours ago",
    getValue: () => dayjs().subtract(3, "hour"),
  },
  {
    label: "3 小时后",
    value: "3 hours later",
    getValue: () => dayjs().add(3, "hour"),
  },

  {
    label: "6 小时前",
    value: "6 hours ago",
    getValue: () => dayjs().subtract(6, "hour"),
  },
  {
    label: "6 小时后",
    value: "6 hours later",
    getValue: () => dayjs().add(6, "hour"),
  },

  {
    label: "12 小时前",
    value: "12 hours ago",
    getValue: () => dayjs().subtract(12, "hour"),
  },
  {
    label: "12 小时后",
    value: "12 hours later",
    getValue: () => dayjs().add(12, "hour"),
  },
];

//5 分钟前后(过去五分钟，未来五分钟)、10分钟前后、 15分钟前后、30分钟前后、45分钟前后、1小时前后、3小时前后、6小时前后、12小时前后
export const TimeRangePresetsOptions = [
  {
    label: "5 分钟前",
    value: "past 5 minutes",
    getValue: () => [dayjs().subtract(5, "minute"), dayjs()],
  },
  {
    label: "5 分钟后",
    value: "next 5 minutes",
    getValue: () => [dayjs(), dayjs().add(5, "minute")],
  },
  {
    label: "10 分钟前",
    value: "past 10 minutes",
    getValue: () => [dayjs().subtract(10, "minute"), dayjs()],
  },
  {
    label: "10 分钟后",
    value: "next 10 minutes",
    getValue: () => [dayjs(), dayjs().add(10, "minute")],
  },
  {
    label: "15 分钟前",
    value: "past 15 minutes",
    getValue: () => [dayjs().subtract(15, "minute"), dayjs()],
  },
  {
    label: "15 分钟后",
    value: "next 15 minutes",
    getValue: () => [dayjs(), dayjs().add(15, "minute")],
  },
  {
    label: "30 分钟前",
    value: "past 30 minutes",
    getValue: () => [dayjs().subtract(30, "minute"), dayjs()],
  },
  {
    label: "30 分钟后",
    value: "next 30 minutes",
    getValue: () => [dayjs(), dayjs().add(30, "minute")],
  },
  {
    label: "45 分钟前",
    value: "past 45 minutes",
    getValue: () => [dayjs().subtract(45, "minute"), dayjs()],
  },
  {
    label: "45 分钟后",
    value: "next 45 minutes",
    getValue: () => [dayjs(), dayjs().add(45, "minute")],
  },
  {
    label: "1 小时前",
    value: "past 1 hour",
    getValue: () => [dayjs().subtract(1, "hour"), dayjs()],
  },
  {
    label: "1 小时后",
    value: "next 1 hour",
    getValue: () => [dayjs(), dayjs().add(1, "hour")],
  },
  {
    label: "3 小时前",
    value: "past 3 hours",
    getValue: () => [dayjs().subtract(3, "hour"), dayjs()],
  },
  {
    label: "3 小时后",
    value: "next 3 hours",
    getValue: () => [dayjs(), dayjs().add(3, "hour")],
  },
  {
    label: "6 小时前",
    value: "past 6 hours",
    getValue: () => [dayjs().subtract(6, "hour"), dayjs()],
  },
  {
    label: "6 小时后",
    value: "next 6 hours",
    getValue: () => [dayjs(), dayjs().add(6, "hour")],
  },
  {
    label: "12 小时前",
    value: "past 12 hours",
    getValue: () => [dayjs().subtract(12, "hour"), dayjs()],
  },
  {
    label: "12 小时后",
    value: "next 12 hours",
    getValue: () => [dayjs(), dayjs().add(12, "hour")],
  },
];

export const TimeFormatOptions = [
  {
    label: dayjs().format("HH:mm:ss"),
    subText: "HH:mm:ss",
    value: "HH:mm:ss",
  },
  {
    label: dayjs().format("HH:mm"),
    subText: "HH:mm",
    value: "HH:mm",
  },
  {
    label: dayjs().format("hh:mm:ss A"),
    subText: "hh:mm:ss A",
    value: "hh:mm:ss A",
  },
  {
    label: dayjs().format("hh:mm A"),
    subText: "hh:mm A",
    value: "hh:mm A",
  },
  {
    label: dayjs().format("HH:mm:ss.SSS"),
    subText: "HH:mm:ss.SSS",
    value: "HH:mm:ss.SSS",
  },
  {
    label: dayjs().format("hh:mm:ss.S A"),
    subText: "hh:mm:ss.S A",
    value: "hh:mm:ss.S A",
  },
  {
    label: dayjs().format("hh:mm:ss.SSS A"),
    subText: "hh:mm:ss.SSS A",
    value: "hh:mm:ss.SSS A",
  },
  {
    label: dayjs().format("hh:mm:ss.SSSSSS A"),
    subText: "hh:mm:ss.SSSSSS A",
    value: "hh:mm:ss.SSSSSS A",
  },
].map((x) => ({
  ...x,
  subTextPosition: SubTextPosition.BOTTOM,
}));
