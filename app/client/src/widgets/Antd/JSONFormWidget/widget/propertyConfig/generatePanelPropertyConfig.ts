import { cloneDeep, get, isEmpty } from "lodash";

import type { PanelConfig } from "constants/PropertyControlConstants";
import type { SchemaItem } from "widgets/Antd/JSONFormWidget/constants";
import { FieldType, INPUT_TYPES } from "widgets/Antd/JSONFormWidget/constants";
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
} from "../../constants";

// 转换PropertyPaneContentConfig，合并 hidden 属性
const transConfig = (config: any[], types: FieldType[]) => {
  return config.map((item) => {
    if (item.children) {
      item.children = transConfig(item.children, types);
    }

    const transItem = {
      ...item,
      // 去重
      dependencies: [
        ...new Set([...(item.dependencies || []), "schema", "sourceData"]),
      ],
      evaluatedDependencies: [
        ...new Set([
          ...(item.evaluatedDependencies || []),
          "schema",
          "sourceData",
        ]),
      ],
      hidden: (...args: HiddenFnParams) => {
        let originHiddenRes = null;
        if (item.hidden) {
          originHiddenRes = item.hidden(...args);
        }
        // if (item.sectionName == "数字输入框属性") {
        //   console.log(
        //     "transConfig",
        //     {
        //       item,
        //       args,
        //       originHiddenRes,
        //       types,
        //     },
        //     getSchemaItem(...args).fieldTypeNotIncludes(types),
        //   );
        // }

        if (originHiddenRes) {
          return originHiddenRes;
        }
        if (!types) {
          return true;
        }
        // return originHiddenRes;
        return getSchemaItem(...args, !!item.sectionName).fieldTypeNotIncludes(
          types,
        );
      },
    };
    if (item.controlType == "INPUT_TEXT") {
      transItem.controlType = "JSON_FORM_COMPUTE_VALUE";
    } else {
      transItem.customJSControl = "JSON_FORM_COMPUTE_VALUE";
    }
    if (item.validation) {
      transItem.validation = {
        ...item.validation,
        // 去重
        dependentPaths: [
          ...new Set([...(item.validation?.dependentPaths || []), "schema"]),
        ],
      };
    }

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
        ...ARRAY_PROPERTIES.content.data,
        {
          propertyName: "children",
          label: "字段配置",
          helpText: "字段配置",
          controlType: "ANTD_FIELD_CONFIGURATION",
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
          dependencies: ["schema", "childStylesheet"],
        },
      ],
    },
  ];
  const styleChildren = [...ARRAY_PROPERTIES.style.root];
  const mergedContentChildren = getAllItemPaneConfig([]);
  const mergedStyleChildren = getAllItemPaneConfig([], true);

  // console.log("contentChildren", mergedContentChildren);
  // console.log("mergedStyleChildren", mergedStyleChildren);

  return {
    editableTitle: true,
    titlePropertyName: "labelText",
    panelIdPropertyName: "identifier",
    contentChildren: [...contentChildren, ...mergedContentChildren],
    styleChildren: [...styleChildren, ...mergedStyleChildren],
  } as PanelConfig;
}

export default generatePanelPropertyConfig;
