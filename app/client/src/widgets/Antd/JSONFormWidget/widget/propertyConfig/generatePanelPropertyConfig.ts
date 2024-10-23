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
import {
  ARRAY_PROPERTIES,
  CHECKBOX_PROPERTIES,
  COMMON_PROPERTIES,
  DATE_PROPERTIES,
  INPUT_PROPERTIES,
  MULTI_SELECT_PROPERTIES,
  OBJECT_PROPERTIES,
  RADIO_GROUP_PROPERTIES,
  SELECT_PROPERTIES,
  SWITCH_PROPERTIES,
} from "./properties";
import type { JSONFormWidgetProps } from "..";
import AntdInputWidget from "widgets/Antd/Form/InputWidget/widget";
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
} from "../../constants";
// console.log("AntdInputWidget", AntdInputWidget.getPropertyPaneContentConfig());

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
    const configKey = isStyleConfig
      ? item.properties.styleConfig
      : item.properties.contentConfig;
    const finalConfig = transConfig(
      mergeWidgetConfig(
        cloneDeep(contentChildren),

        cloneDeep(configKey),
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
        // ...INPUT_PROPERTIES.content.data,
        // ...SWITCH_PROPERTIES.content.data,
        // ...SELECT_PROPERTIES.content.data,
        // ...RADIO_GROUP_PROPERTIES.content.data,
        // ...MULTI_SELECT_PROPERTIES.content.data,
        ...DATE_PROPERTIES.content.data,
        // ...CHECKBOX_PROPERTIES.content.data,
        ...ARRAY_PROPERTIES.content.data,
        {
          propertyName: "children",
          label: "字段配置",
          helpText: "字段配置",
          controlType: "FIELD_CONFIGURATION",
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
  const styleChildren = [
    // {
    //   sectionName: "标签样式",
    //   children: [...COMMON_PROPERTIES.style.label],
    // },
    // {
    //   sectionName: "图标配置",
    //   children: [...INPUT_PROPERTIES.style.icon],
    //   hidden: (props: JSONFormWidgetProps, propertyPath: string) => {
    //     const schemaItem: SchemaItem = get(props, propertyPath, {});
    //     return !(
    //       schemaItem.fieldType === FieldType.TEXT_INPUT ||
    //       schemaItem.fieldType === FieldType.EMAIL_INPUT ||
    //       schemaItem.fieldType === FieldType.PASSWORD_INPUT ||
    //       schemaItem.fieldType === FieldType.NUMBER_INPUT
    //     );
    //   },
    // },
    // {
    //   sectionName: "颜色配置",
    //   children: [...COMMON_PROPERTIES.style.color],
    //   hidden: isFieldTypeArrayOrObject,
    // },
    // {
    //   sectionName: "轮廓样式",
    //   children: [...COMMON_PROPERTIES.style.borderShadow],
    //   hidden: (props: JSONFormWidgetProps, propertyPath: string) => {
    //     const schemaItem: SchemaItem = get(props, propertyPath, {});
    //     return (
    //       schemaItem.fieldType === FieldType.ARRAY ||
    //       schemaItem.fieldType === FieldType.OBJECT ||
    //       schemaItem.fieldType === FieldType.RADIO_GROUP ||
    //       schemaItem.fieldType === FieldType.SWITCH
    //     );
    //   },
    // },
    ...OBJECT_PROPERTIES.style.root,
    ...ARRAY_PROPERTIES.style.root,
  ];
  const mergedContentChildren = getAllItemPaneConfig([]);
  const mergedStyleChildren = getAllItemPaneConfig(styleChildren, true);

  console.log("contentChildren", mergedContentChildren);
  console.log("mergedStyleChildren", mergedStyleChildren);

  return {
    editableTitle: true,
    titlePropertyName: "labelText",
    panelIdPropertyName: "identifier",
    contentChildren: [...contentChildren, ...mergedContentChildren],
    styleChildren: mergedStyleChildren,
  } as PanelConfig;
}

export default generatePanelPropertyConfig;
