import dayjs from "dayjs";

export function parseTime(time: string) {
  const parts = time.split(":").map(Number);
  while (parts.length < 3) parts.push(0); // Ensure hours, minutes, and seconds are present
  return parts;
}

function addMinutesRange(
  result: Record<string, any>,
  h: string,
  startMinute: number,
  endMinute: number,
) {
  if (!startMinute && endMinute == 59) return;
  // if (startMinute == 0 && endMinute == 0) return;
  for (let minute = startMinute; minute <= endMinute; minute++) {
    if (!result[h]) {
      result[h] = [];
    }
    result[h].push(minute);
  }
}

const beforeTransFunc = (timeString: string | string[], isSingle?: boolean) => {
  let timeArray: string[] = [];
  try {
    timeArray = Array.isArray(timeString)
      ? timeString
      : JSON.parse(timeString as string);
  } catch (error) {
    timeArray = (timeString as string).split(",");
  }
  if (isSingle) {
    timeArray = timeArray.map((item) => `${item}-${item}`);
  }
  return timeArray;
};

export function convertTimeRanges(
  timeString: string | string[],
  isSingle?: boolean,
) {
  if (!timeString) return undefined;
  // 先将字符串按逗号拆分为数组
  const timeArray: string[] = beforeTransFunc(timeString, isSingle);
  console.log("时间选择 convertTimeRanges", timeArray);

  const result: Record<string, number[]> = {
    HH: [],
  };

  timeArray.forEach((range) => {
    const [start, end] = range.split("-");
    const [sh, sm, ss] = parseTime(start);
    const [eh, em, es] = parseTime(end);

    if (sh === eh) {
      // Same hour range
      if (sm === em) {
        // if (ss === es) {
        //   result[`${sh}:${sm}`] = [ss];
        // }
        // Same minute range
        addMinutesRange(result, `${sh}:${sm}`, ss, es);
      } else {
        // Different minute range
        addMinutesRange(result, `${sh}:${sm}`, ss, 59);
        addMinutesRange(result, `${eh}:${em}`, 0, es);
        if (em - sm > 1) {
          for (let m = sm + 1; m < em; m++) {
            !result[sh] && (result[sh] = []);
            result[sh].push(m);
          }
        }
      }
    } else {
      const endWith59 = em == 59 && es == 59;
      const endWith0 = !em && !es;
      const startWith0 = !sm && !ss;

      // 处理整小时的情况
      if (eh - sh > 1) {
        for (let h = sh + 1; h < eh; h++) {
          result["HH"]?.push(h);
        }
      }

      if (endWith59) result["HH"].push(eh);
      if (startWith0) result["HH"].push(sh);

      // 处理 HH:00:00
      // endWith0 && (result[`${eh}:0`] = [0]);

      // 处理开始的分钟
      addMinutesRange(result, `${sh}:${sm}`, ss, 59);
      // 处理结束的分钟
      addMinutesRange(result, `${eh}:${em}`, 0, es);

      // 处理中间的分钟
      if (em > 0 && em < 59) {
        for (let m = 0; m < em; m++) {
          !result[eh] && (result[eh] = []);
          result[eh].push(m);
        }
      }

      if (sm > 0 && sm < 59) {
        //   如果当前小时在"HH"中，说明已经处理过，是重合的部分
        if (result["HH"].includes(sh)) return;
        for (let m = sm + 1; m < 60; m++) {
          !result[sh] && (result[sh] = []);
          result[sh].push(m);
        }
      }
    }
  });

  return result;
}
