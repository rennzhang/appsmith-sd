import { useCallback, useContext, useMemo, useRef } from "react";
import type { DraftValueType } from "rc-select/lib/Select";
import { omit } from "lodash";

import FormContext from "../FormContext";
import type { TreeSelectComponentProps } from "widgets/Antd/Form/SelectWidget/component";
import SelectComponent from "widgets/Antd/Form/SelectWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, SelectWidgetConfig } from "../constants";
import type { DropdownOption } from "widgets/MultiSelectTreeWidget/widget";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

type SelectComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  TreeSelectComponentProps;

export type SelectFieldProps = BaseFieldComponentProps<SelectComponentProps>;

const COMPONENT_DEFAULT_VALUES: SelectComponentProps = {
  // omit defaultValue
  ...omit(SelectWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: SelectWidgetConfig.type,
};

const isValid = (
  schemaItem: SelectFieldProps["schemaItem"],
  value: unknown[],
) => !schemaItem.isRequired || Boolean(value.length);

function AntdSelectField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: SelectFieldProps) {
  const {
    executeAction,
    formControlSize,
    formIsDisabled,
    formIsRequird,
    formLabelAlign,
    formLayout,
    updateFormData,
  } = useContext(FormContext);
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const options = Array.isArray(schemaItem.options) ? schemaItem.options : [];
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [updateFilterText] = useUpdateInternalMetaState({
    propertyName: `${name}.filterText`,
  });

  // const fieldDefaultValue = useMemo(() => {
  //   const values: LabelInValueType["value"][] | LabelInValueType[] = (() => {
  //     if (!isNil(passedDefaultValue) && validateOptions(passedDefaultValue)) {
  //       return passedDefaultValue;
  //     }

  //     if (
  //       !isNil(schemaItem.defaultValue) &&
  //       validateOptions(schemaItem.defaultValue)
  //     ) {
  //       return schemaItem.defaultValue;
  //     }

  //     return [];
  //   })();

  //   if (values.length && isPrimitive(values[0])) {
  //     return values as LabelInValueType["value"][];
  //   } else {
  //     return componentValuesToFieldValues(values as LabelInValueType[]);
  //   }
  // }, [schemaItem.defaultValue, passedDefaultValue]);

  // useEffect(() => {
  //   updateFormData({
  //     [name]: fieldDefaultValue,
  //   });
  // }, [name, fieldDefaultValue, updateFormData]);

  const onSearchHandler = useCallback(
    (value: string) => {
      updateFilterText(value);

      if (schemaItem.onOptionSearch && executeAction) {
        executeAction({
          triggerPropertyName: "onOptionSearch",
          dynamicString: schemaItem.onOptionSearch,
          event: {
            type: EventType.ON_SEARCH,
          },
        });
      }
    },
    [executeAction, name, schemaItem.onOptionSearch, updateFilterText],
  );

  const onChangeHandler = useCallback(
    (values: DraftValueType) => {
      updateFormData({
        [name]: values,
      });

      if (schemaItem.onValueChange && executeAction) {
        executeAction({
          triggerPropertyName: "onValueChange",
          dynamicString: schemaItem.onValueChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, name, schemaItem.onValueChange, updateFormData],
  );

  const dropdownWidth = wrapperRef.current?.clientWidth;

  console.log("JSONFormWidget 选择器", {
    schemaItem,
    formControlSize,
    formLayout,
    formIsRequird,
    formLabelAlign,
    commonProps,
  });

  const fieldComponent = useMemo(() => {
    return (
      <SelectComponent
        {...schemaItem}
        {...commonProps}
        handleSearch={onSearchHandler}
        handleValueChange={onChangeHandler}
        options={options}
      />
    );
  }, [
    schemaItem,
    formIsDisabled,
    dropdownWidth,
    onChangeHandler,
    options,
    fieldClassName,
    formControlSize,
    formLayout,
    formIsRequird,
    formLabelAlign,
  ]);

  return fieldComponent;
}

AntdSelectField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default AntdSelectField;
