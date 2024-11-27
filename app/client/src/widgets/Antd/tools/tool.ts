import React from "react";
interface DiffResult {
  path: string;
  prevValue: string;
  nextValue: string;
}

export function simpleDiff(
  prev: any,
  next: any,
  path = "",
): DiffResult[] | null {
  // 在非开发环境下直接返回 NULL
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  // 如果值相等，直接返回空数组
  if (prev === next) {
    return [];
  }

  // 处理基础类型
  if (
    typeof prev !== "object" ||
    typeof next !== "object" ||
    prev === null ||
    next === null
  ) {
    return [
      {
        path,
        prevValue: String(prev),
        nextValue: String(next),
      },
    ];
  }

  const changes: DiffResult[] = [];
  const allKeys = Array.from(
    new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]),
  );

  allKeys.forEach((key) => {
    const prevVal = prev[key];
    const nextVal = next[key];
    const currentPath = path ? `${path}.${key}` : key;

    // 处理 ReactNode
    if (React.isValidElement(prevVal) || React.isValidElement(nextVal)) {
      if (prevVal !== nextVal) {
        changes.push({
          path: currentPath,
          prevValue: React.isValidElement(prevVal)
            ? `<${prevVal.type.name || prevVal.type}>`
            : String(prevVal),
          nextValue: React.isValidElement(nextVal)
            ? `<${nextVal.type.name || nextVal.type}>`
            : String(nextVal),
        });
      }
      return;
    }

    // 处理数组
    if (Array.isArray(prevVal) && Array.isArray(nextVal)) {
      if (
        prevVal.some(React.isValidElement) ||
        nextVal.some(React.isValidElement)
      ) {
        if (prevVal !== nextVal) {
          changes.push({
            path: currentPath,
            prevValue: `ReactNode[${prevVal.length}]`,
            nextValue: `ReactNode[${nextVal.length}]`,
          });
        }
        return;
      }

      // 如果数组内容是对象，递归处理
      if (prevVal.length === nextVal.length) {
        prevVal.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            const nestedChanges =
              simpleDiff(item, nextVal[index], `${currentPath}[${index}]`) ||
              [];
            changes.push(...nestedChanges);
          } else if (item !== nextVal[index]) {
            changes.push({
              path: `${currentPath}[${index}]`,
              prevValue: String(item),
              nextValue: String(nextVal[index]),
            });
          }
        });
      } else {
        changes.push({
          path: currentPath,
          prevValue: `Array[${prevVal.length}]`,
          nextValue: `Array[${nextVal.length}]`,
        });
      }
      return;
    }

    // 递归处理对象
    if (
      typeof prevVal === "object" &&
      typeof nextVal === "object" &&
      prevVal !== null &&
      nextVal !== null
    ) {
      const nestedChanges = simpleDiff(prevVal, nextVal, currentPath) || [];
      changes.push(...nestedChanges);
      return;
    }

    // 处理基础类型
    if (prevVal !== nextVal) {
      changes.push({
        path: currentPath,
        prevValue: prevVal === undefined ? "undefined" : String(prevVal),
        nextValue: nextVal === undefined ? "undefined" : String(nextVal),
      });
    }
  });

  return changes?.length ? changes : null;
}
