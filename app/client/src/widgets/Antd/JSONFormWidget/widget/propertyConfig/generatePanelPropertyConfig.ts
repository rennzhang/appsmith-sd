import { cloneDeep, get, isEmpty } from "lodash";

import type { PanelConfig } from "constants/PropertyControlConstants";
import type { SchemaItem } from "widgets/Antd/JSONFormWidget/constants";
import {
  FieldType,
  INPUT_TYPES,
  JSONFORM_WIDGET_DEPENDENCIES,
} from "widgets/Antd/JSONFormWidget/constants";
import type { HiddenFnParams } from "./helper";
import {
  getSchemaItem,
  hiddenIfArrayItemIsObject,
  isFieldTypeArrayOrObject,
} from "./helper";
import { ARRAY_PROPERTIES, COMMON_PROPERTIES } from "./properties";
import { mergeWidgetConfig } from "utils/helpers";
import {
  AllAntdFormItems,
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
  ObjectFieldConfig,
  ArrayFieldConfig,
} from "../../constants";
const transDependencies = (item: any) => {
  return {
    ...item,
    ...(item.validation
      ? {
          ...item.validation,
          // 去重
          dependentPaths: [
            ...new Set([...(item.validation?.dependentPaths || []), "schema"]),
          ],
        }
      : {}),
    dependencies: [
      ...new Set([
        ...(item.dependencies || []),
        ...JSONFORM_WIDGET_DEPENDENCIES,
      ]),
    ],
    evaluatedDependencies: [
      ...new Set([
        ...(item.evaluatedDependencies || []),
        ...JSONFORM_WIDGET_DEPENDENCIES,
      ]),
    ],
  };
};
const isMatchType = (args: HiddenFnParams, item: any, types: FieldType[]) => {
  if (!types) {
    return true;
  }
  return getSchemaItem(...args, !!item.sectionName).fieldTypeNotIncludes(types);
};
// 转换PropertyPaneContentConfig，合并 hidden 属性
const transConfig = (
  config: any[],
  types: FieldType[],
  isSkipHidden?: boolean,
) => {
  if (!config?.length) {
    return [];
  }

  return config.map((item) => {
    if (item.children) {
      item.children = transConfig(item.children, types, isSkipHidden);
    }

    const transItem = {
      ...item,
      ...transDependencies(item),
      helperText: item.helperText
        ? (...args: HiddenFnParams) => {
            if (!isMatchType(args, item, types)) {
              return undefined;
            }
            return item.helperText(...args);
          }
        : undefined,
      hidden: (...args: HiddenFnParams) => {
        const originHiddenRes = item?.hidden?.(...args);

        if (isSkipHidden) {
          return originHiddenRes;
        }
        const isMatch = isMatchType(args, item, types);
        return originHiddenRes || isMatch;
      },
    };
    if (item.panelConfig?.contentChildren) {
      transItem.panelConfig.contentChildren = transConfig(
        transItem.panelConfig.contentChildren,
        types,
        true,
      );
    }

    if (item.panelConfig?.styleChildren) {
      transItem.panelConfig.styleChildren = transConfig(
        item.panelConfig.styleChildren,
        types,
        isSkipHidden,
      );
    }
    // if (["isVisible", "useSourceData"].includes(item.propertyName)) {
    //   transItem.controlType = "ANTD_JSON_FORM_COMPUTE_VALUE";
    // }
    // if (item.controlType == "INPUT_TEXT") {
    //   transItem.controlType = "ANTD_JSON_FORM_COMPUTE_VALUE";
    // } else {
    //   transItem.customJSControl = "ANTD_JSON_FORM_COMPUTE_VALUE";
    // }

    if (item.propertyName === "labelText") {
      item.hidden = hiddenIfArrayItemIsObject;
    }

    return transItem;
  });
};
const comTypesMap = {
  [AntdInputWidgetConfig.type]: INPUT_TYPES,
  [AutoCompleteWidgetConfig.type]: [FieldType.AUTOCOMPLETE_INPUT],
  [SelectWidgetConfig.type]: [FieldType.MULTISELECT],
  [RadioWidgetConfig.type]: [FieldType.RADIO_GROUP],
  [CheckboxWidgetConfig.type]: [FieldType.CHECKBOX],
  [SwitchWidgetConfig.type]: [FieldType.SWITCH],
  [TextWidgetConfig.type]: [FieldType.TEXT],
  [TreeSelectWidgetConfig.type]: [FieldType.TREESELECT],
  [CascaderWidgetConfig.type]: [FieldType.CASCADE],
  [TimePickerWidgetConfig.type]: [FieldType.TIMEPICKER],
  [DatePickerWidgetConfig.type]: [FieldType.DATEPICKER],
  [ObjectFieldConfig.type]: [FieldType.OBJECT],
  [ArrayFieldConfig.type]: [FieldType.ARRAY],
};
const allItemPropertyPaneConfig: Map<string, any[]> = new Map();
const allItemStylePaneConfig: Map<string, any[]> = new Map();

const getAllItemPaneConfig = (
  contentChildren: any,
  isStyleConfig?: boolean,
) => {
  const targetMap = isStyleConfig
    ? allItemStylePaneConfig
    : allItemPropertyPaneConfig;
  AllAntdFormItems.forEach((item) => {
    if (targetMap.has(item.type)) {
      return;
    }
    const targetConfig = isStyleConfig
      ? item.properties.styleConfig
      : item.properties.contentConfig;
    const finalConfig = transConfig(
      mergeWidgetConfig(
        cloneDeep(contentChildren),

        cloneDeep(targetConfig),
      ),
      comTypesMap[item.type] as FieldType[],
    );

    targetMap.set(item.type, finalConfig);
  });

  const res: any[] = [];
  // 返回普通数组，不能含有 map 的id
  targetMap.forEach((c) => {
    res.push(...c);
  });

  return res;
};

function generatePanelPropertyConfig(
  nestingLevel: number,
): PanelConfig | undefined {
  if (nestingLevel === 0) return;
  const contentChildren = [
    {
      sectionName: "基本配置",
      children: [
        ...COMMON_PROPERTIES.content.data,
        {
          propertyName: "children",
          label: "字段配置",
          helpText: "字段配置",
          controlType: "ANTD_FIELD_CONFIGURATION",
          isJSConvertible: true,
          isBindProperty: false,
          isTriggerProperty: false,
          panelConfig: generatePanelPropertyConfig(nestingLevel - 1),
          hidden: (...args: HiddenFnParams) => {
            return getSchemaItem(...args).compute((schemaItem) => {
              return (
                schemaItem.fieldType !== FieldType.OBJECT &&
                isEmpty(schemaItem.children)
              );
            });
          },
          dependencies: [
            "schema",
            "childStylesheet",
            ...JSONFORM_WIDGET_DEPENDENCIES,
          ],
        },
      ],
    },
  ];
  const mergedContentChildren = getAllItemPaneConfig([]);
  const mergedStyleChildren = getAllItemPaneConfig([], true);

  // console.log("contentChildren", mergedContentChildren);
  // console.log("mergedStyleChildren", mergedStyleChildren);

  return {
    editableTitle: true,
    titlePropertyName: "labelText",
    panelIdPropertyName: "identifier",
    contentChildren: [...contentChildren, ...mergedContentChildren],
    styleChildren: [...mergedStyleChildren],
  } as PanelConfig;
}

export default generatePanelPropertyConfig;
