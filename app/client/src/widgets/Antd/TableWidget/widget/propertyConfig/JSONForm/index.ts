import type { PanelConfig } from "constants/PropertyControlConstants";
import { cloneDeep, omit } from "lodash";
import { CONFIG } from "widgets/Antd/JSONFormWidget";

const dependencies = [
  "primaryColumns",
  "tableData",
  "filteredTableData",
  "editingColumnId",
  "editingColumnIndex",
  "orderedTableColumns",
  "columnOrder",
  "childStylesheet",
  "autoFormConfig",
];
// 转换PropertyPaneContentConfig，合并 hidden 属性
const transConfig = (config: any[]) => {
  return config.map((item) => {
    if (item.children) {
      item.children = transConfig(item.children);
    }

    const transItem = {
      ...item,
      // 去重
      dependencies: [
        ...new Set([...(item.dependencies || []), ...dependencies]),
      ],
      evaluatedDependencies: [
        ...new Set([...(item.evaluatedDependencies || []), ...dependencies]),
      ],
    };

    if (item.validation) {
      transItem.validation = {
        ...item.validation,
        // 去重
        dependentPaths: [
          ...new Set([
            ...(item.validation?.dependentPaths || []),
            ,
            ...dependencies,
          ]),
        ],
      };
    }

    // if (item.propertyName === "labelText") {
    //   item.hidden = hiddenIfArrayItemIsObject;
    // }

    return transItem;
  });
};
const contentChildren = transConfig(CONFIG.properties.contentConfig);
console.log(`JSONFormWidget contentChildren`, contentChildren);
export const JSONFormConfig: PanelConfig = {
  editableTitle: false,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  contentChildren,
  styleChildren: transConfig(CONFIG.properties.styleConfig),

  updateHook: (props: any, propertyPath: string, propertyValue: any) => {
    console.log("JSONFormConfig updateHook", {
      props,
      propertyPath,
      propertyValue,
    });

    return [
      {
        propertyPath,
        propertyValue,
      },
    ];
  },
};

export const JSONFormDefaults = cloneDeep(omit(CONFIG.defaults, "blueprint"));
