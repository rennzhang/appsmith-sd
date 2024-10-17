import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { LabelInValueType, DraftValueType } from "rc-select/lib/Select";
// import { useController } from "react-hook-form";
import { isNil, omit } from "lodash";

import Field from "../component/Field";
import FormContext from "../FormContext";
import SelectComponent from "widgets/Antd/Form/SelectWidget/component";
import useEvents from "./useBlurAndFocusEvents";
import useRegisterFieldValidity from "./useRegisterFieldValidity";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import { Layers } from "constants/Layers";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, SelectWidgetConfig } from "../constants";
import type { DropdownOption } from "widgets/MultiSelectTreeWidget/widget";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { isPrimitive, validateOptions } from "../helper";
import { Colors } from "constants/Colors";
import { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";

type SelectComponentProps = FieldComponentBaseProps &
  FieldEventProps & {
    boxShadow?: string;
    allowSelectAll?: boolean;
    borderRadius?: string;
    defaultValue?: string[];
    isFilterable: boolean;
    onFilterChange?: string;
    onFilterUpdate?: string;
    onOptionChange?: string;
    options: DropdownOption[];
    placeholderText?: string;
    accentColor?: string;
    serverSideFiltering: boolean;
  };

export type SelectFieldProps = BaseFieldComponentProps<SelectComponentProps>;

const DEFAULT_ACCENT_COLOR = Colors.GREEN;
const DEFAULT_BORDER_RADIUS = "0";

const COMPONENT_DEFAULT_VALUES: SelectComponentProps = {
  // omit defaultValue
  ...omit(SelectWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isFilterable: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  labelTextSize: BASE_LABEL_TEXT_SIZE,
  serverSideFiltering: false,
};

const isValid = (
  schemaItem: SelectFieldProps["schemaItem"],
  value: unknown[],
) => !schemaItem.isRequired || Boolean(value.length);

const DEFAULT_DROPDOWN_STYLES = {
  zIndex: Layers.dropdownModalWidget,
};

const fieldValuesToComponentValues = (
  values: LabelInValueType["value"][],
  options: LabelInValueType[] = [],
) => {
  return values.map((value) => {
    const option = options.find((option) => option.value === value);
    return option ? option : { value, label: value };
  });
};

const componentValuesToFieldValues = (
  componentValues: LabelInValueType[] = [],
) => componentValues.map(({ value }) => value);

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
    formRef,
    updateFormData,
  } = useContext(FormContext);
  const commonProps = useFieldPropsHandler(schemaItem);

  const {
    fieldType,
    isRequired,
    onBlur: onBlurDynamicString,
    onFocus: onFocusDynamicString,
  } = schemaItem;
  const options = Array.isArray(schemaItem.options) ? schemaItem.options : [];
  const wrapperRef = useRef<HTMLDivElement>(null);

  // const { onBlurHandler, onFocusHandler } = useEvents<HTMLInputElement>({
  //   onFocusDynamicString,
  //   onBlurDynamicString,
  // });

  const [updateFilterText] = useUpdateInternalMetaState({
    propertyName: `${name}.filterText`,
  });

  const fieldDefaultValue = useMemo(() => {
    const values: LabelInValueType["value"][] | LabelInValueType[] = (() => {
      if (!isNil(passedDefaultValue) && validateOptions(passedDefaultValue)) {
        return passedDefaultValue;
      }

      if (
        !isNil(schemaItem.defaultValue) &&
        validateOptions(schemaItem.defaultValue)
      ) {
        return schemaItem.defaultValue;
      }

      return [];
    })();

    if (values.length && isPrimitive(values[0])) {
      return values as LabelInValueType["value"][];
    } else {
      return componentValuesToFieldValues(values as LabelInValueType[]);
    }
  }, [schemaItem.defaultValue, passedDefaultValue]);

  useEffect(() => {
    updateFormData({
      [name]: fieldDefaultValue,
    });
  }, [name, fieldDefaultValue, updateFormData]);

  const onFilterChange = useCallback(
    (value: string) => {
      if (!schemaItem.onFilterUpdate) {
        updateFilterText(value);
      } else {
        updateFilterText(value, {
          triggerPropertyName: "onFilterUpdate",
          dynamicString: schemaItem.onFilterUpdate,
          event: {
            type: EventType.ON_FILTER_UPDATE,
          },
        });
      }
    },
    [executeAction, schemaItem.onFilterUpdate],
  );

  const onChangeHandler = useCallback(
    (values: DraftValueType) => {
      updateFormData({
        [name]: values,
      });

      if (schemaItem.onOptionChange && executeAction) {
        executeAction({
          triggerPropertyName: "onOptionChange",
          dynamicString: schemaItem.onOptionChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, name, schemaItem.onOptionChange, updateFormData],
  );

  const onBlurHandler = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (schemaItem.onBlur) {
        executeAction({
          triggerPropertyName: "onBlur",
          dynamicString: schemaItem.onBlur,
          event: {
            type: EventType.ON_BLUR,
          },
        });
      }
    },
    [executeAction, schemaItem.onBlur],
  );

  const onFocusHandler = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (schemaItem.onFocus) {
        executeAction({
          triggerPropertyName: "onFocus",
          dynamicString: schemaItem.onFocus,
          event: {
            type: EventType.ON_FOCUS,
          },
        });
      }
    },
    [executeAction, schemaItem.onFocus],
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
        allowSelectAll={schemaItem.allowSelectAll}
        dropDownWidth={dropdownWidth || 100}
        dropdownStyle={DEFAULT_DROPDOWN_STYLES}
        isFilterable={schemaItem.isFilterable}
        onBlur={onBlurHandler}
        onChange={onChangeHandler}
        onFilterChange={onFilterChange}
        onFocus={onFocusHandler}
        options={options}
        placeholder={schemaItem.placeholderText || ""}
        serverSideFiltering={schemaItem.serverSideFiltering}
        widgetId={fieldClassName}
      />
    );
  }, [
    schemaItem,
    formIsDisabled,
    dropdownWidth,
    onBlurHandler,
    onChangeHandler,
    onFilterChange,
    onFocusHandler,
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
