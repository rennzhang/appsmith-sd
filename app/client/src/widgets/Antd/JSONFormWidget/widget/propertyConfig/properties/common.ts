import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { get } from "lodash";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { SchemaItem } from "widgets/Antd/JSONFormWidget/constants";
import {
  ARRAY_ITEM_KEY,
  FIELD_EXPECTING_OPTIONS,
  FIELD_SUPPORTING_FOCUS_EVENTS,
  FieldType,
  fieldTypeOptions,
  JSONFORM_WIDGET_DEPENDENCIES,
} from "widgets/Antd/JSONFormWidget/constants";
import type { JSONFormWidgetProps } from "../..";
import { getParentPropertyPath } from "../../helper";
import type { HiddenFnParams } from "../helper";
import {
  fieldTypeUpdateHook,
  getAutocompleteProperties,
  getSchemaItem,
  getStylesheetValue,
  hiddenIfArrayItemIsObject,
  updateChildrenDisabledStateHook,
} from "../helper";
// ARRAY and OBJECT have border radius but in their own property configs as they have a variation
const FIELDS_WITHOUT_BORDER_RADIUS = [
  FieldType.ARRAY,
  FieldType.OBJECT,
  FieldType.RADIO_GROUP,
  FieldType.SWITCH,
];

const FIELDS_WITHOUT_BOX_SHADOW = [
  FieldType.ARRAY,
  FieldType.OBJECT,
  FieldType.CHECKBOX,
  FieldType.RADIO_GROUP,
  FieldType.SWITCH,
];

const FIELDS_WITH_ACCENT_COLOR = [
  FieldType.CHECKBOX,
  // FieldType.CURRENCY_INPUT,
  FieldType.DATEPICKER,
  // FieldType.EMAIL_INPUT,
  FieldType.MULTILINE_TEXT_INPUT,
  FieldType.MULTISELECT,
  FieldType.NUMBER_INPUT,
  FieldType.PASSWORD_INPUT,
  // FieldType.PHONE_NUMBER_INPUT,
  FieldType.RADIO_GROUP,
  // FieldType.SELECT,
  FieldType.SWITCH,
  FieldType.TEXT_INPUT,
];

function accessorValidation(
  value: any,
  props: JSONFormWidgetProps,
  lodash: any,
  _: any,
  propertyPath: string,
): ValidationResponse {
  const propertyPathChunks = propertyPath.split(".");
  const grandParentPath = propertyPathChunks.slice(0, -2).join(".");
  const schemaItemIdentifier = propertyPathChunks.slice(-2)[0]; // ['schema', '__root_field__', 'children', 'age', 'name'] -> age
  const schema = lodash.cloneDeep(lodash.get(props, grandParentPath));
  const RESTRICTED_KEYS = ["__array_item__", "__root_schema__"];
  const currentSchemaItem = lodash.cloneDeep(schema[schemaItemIdentifier]);
  // Remove the current edited schemaItem from schema so it doesn't
  // get picked in the existing keys list
  delete schema[schemaItemIdentifier];

  // If the field is not _id (mongo id) then it shouldn't be allowed
  if (currentSchemaItem.originalIdentifier !== "_id") {
    RESTRICTED_KEYS.push("_id");
  }

  if (value === "") {
    return {
      isValid: false,
      parsed: value,
      messages: [
        {
          name: "ValidationError",
          message: "Property Name cannot be empty",
        },
      ],
    };
  }

  const existingKeys = (Object.values(schema) || []).map(
    // @ts-expect-error: Types are not available
    (schemaItem) => schemaItem.name,
  );

  if (existingKeys.includes(value)) {
    return {
      isValid: false,
      parsed: "",
      messages: [
        {
          name: "ValidationError",
          message: "Property name already in use.",
        },
      ],
    };
  }

  if (RESTRICTED_KEYS.includes(value)) {
    return {
      isValid: false,
      parsed: "",
      messages: [
        {
          name: "ValidationError",
          message: "This is a restricted Property Name",
        },
      ],
    };
  }

  return {
    isValid: true,
    parsed: value,
    messages: [{ name: "", message: "" }],
  };
}

const COMMON_PROPERTIES = {
  content: {
    data: [
      {
        propertyName: "fieldType",
        label: "表单控件类型",
        helpText: "与字段对应的要使用的组件类型",
        controlType: "DROP_DOWN",
        isBindProperty: false,
        isTriggerProperty: false,
        options: fieldTypeOptions,
        defaultValue: FieldType.TEXT_INPUT,
        dependencies: [
          "schema",
          "childStylesheet",
          "dynamicBindingPathList",
          ...JSONFORM_WIDGET_DEPENDENCIES,
        ],
        updateHook: fieldTypeUpdateHook,
      },
      {
        helpText: "字段默认值，默认值修改后会自动更新字段当前值",
        propertyName: "defaultValue",
        label: "默认值",
        controlType: "ANTD_JSON_FORM_COMPUTE_VALUE",
        placeholderText: "[]",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.ARRAY,
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.ARRAY),
        dependencies: ["schema", ...JSONFORM_WIDGET_DEPENDENCIES],
      },
      {
        propertyName: "accessor",
        helpText: "设置字段属性名让用户可以在表单数据中访问到对应的值",
        label: "属性名",
        controlType: "INPUT_TEXT",
        placeholderText: "name",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: accessorValidation,
            expected: {
              type: "unique string",
              example: `firstName | last_name | age14`,
              autocompleteDataType: AutocompleteDataType.STRING,
            },
          },
        },
        hidden: (props: JSONFormWidgetProps, propertyPath: string) => {
          const parentPath = getParentPropertyPath(propertyPath);
          const schemaItem: SchemaItem = get(props, parentPath, {});
          const isArrayItem = schemaItem.identifier === ARRAY_ITEM_KEY;

          if (isArrayItem) return true;
        },
        dependencies: ["schema", ...JSONFORM_WIDGET_DEPENDENCIES],
      },
    ],
  },
};

export default COMMON_PROPERTIES;
