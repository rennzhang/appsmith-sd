import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import type { ControllerRenderProps } from "react-hook-form";
import { get, isEqual, set } from "lodash";
import { klona } from "klona";

import Accordion from "../component/Accordion";
import FieldLabel, { BASE_LABEL_TEXT_SIZE } from "../component/FieldLabel";
import FieldRenderer from "./FieldRenderer";
import FormContext from "../FormContext";
import NestedFormWrapper from "../component/NestedFormWrapper";
import useDeepEffect from "utils/hooks/useDeepEffect";
import useUpdateAccessor from "./useObserveAccessor";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldState,
  SchemaItem,
} from "../constants";
import { ARRAY_ITEM_KEY } from "../constants";
import { Colors } from "constants/Colors";
import { FIELD_MARGIN_BOTTOM } from "../component/styleConstants";
import { generateReactKey } from "utils/generators";
import { schemaItemDefaultValue } from "../helper";
import { ArrayFieldConfig } from "../constants";
import type { FormListActionType } from "@ant-design/pro-components";

import { Button, Tooltip } from "antd";
import { DeleteOutlined, CopyOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";

type ArrayComponentProps = FieldComponentBaseProps & {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: string;
  boxShadow?: string;
  cellBackgroundColor?: string;
  cellBorderColor?: string;
  cellBorderWidth?: number;
  cellBorderRadius?: string;
  cellBoxShadow?: string;
  accentColor?: string;
  defaultValue?: any[];
  isCollapsible: boolean;
};

type ArrayFieldProps = BaseFieldComponentProps<ArrayComponentProps>;

const COMPONENT_DEFAULT_VALUES: ArrayComponentProps = {
  backgroundColor: Colors.GREY_1,
  isCollapsible: true,
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelTextSize: BASE_LABEL_TEXT_SIZE,
  labelText: "",
  type: ArrayFieldConfig.type,
};

const StyledNestedFormWrapper = styled(NestedFormWrapper)`
  margin-bottom: ${FIELD_MARGIN_BOTTOM}px;
  padding-bottom: 0;
`;

const StyledItemWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const DEFAULT_FIELD_RENDERER_OPTIONS = {
  hideLabel: true,
  hideAccordion: true,
};

// 按钮容器
const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
`;

const getDefaultValue = (
  schemaItem: SchemaItem,
  passedDefaultValue?: unknown,
) => {
  if (Array.isArray(passedDefaultValue)) {
    return passedDefaultValue;
  }
  if (
    Array.isArray(schemaItem.defaultValue) &&
    schemaItem.defaultValue.length > 0
  ) {
    return schemaItemDefaultValue(schemaItem, "identifier") as unknown[];
  }

  return [];
};

function ArrayField({
  fieldClassName,
  isLastField,
  isRootField = false,
  name,
  passedDefaultValue,
  propertyPath,
  schemaItem,
}: ArrayFieldProps) {
  const { formRef, updateFormData } = useContext(FormContext);
  const keysRef = useRef<string[]>([]);
  const removedKeys = useRef<string[]>([]);
  const [cachedDefaultValue, setCachedDefaultValue] = useState<unknown[]>(
    getDefaultValue(schemaItem, passedDefaultValue),
  );
  const defaultValue = useMemo(() => {
    const data = getDefaultValue(schemaItem, passedDefaultValue);
    if (!data || isEqual(data, defaultValue)) {
      return [];
    }
    setCachedDefaultValue(klona(data));

    return data;
  }, [schemaItem.defaultValue, passedDefaultValue]);
  // const value = watch(name);

  const [value, setValue] = useState(() => defaultValue);

  // useEffect(() => {
  //   if (
  //     !defaultValue ||
  //     isEqual(defaultValue, cachedDefaultValue) ||
  //     defaultValue.length < cachedDefaultValue.length
  //   ) {
  //     return;
  //   }

  //   console.log(
  //     "ArrayField defaultValue",
  //     { defaultValue, value, cachedDefaultValue },
  //     isEqual(defaultValue, cachedDefaultValue),
  //   );

  //   setValue(defaultValue);
  //   setCachedDefaultValue(klona(defaultValue));
  // }, [defaultValue]);
  const valueLength = useMemo(
    () => value?.length || cachedDefaultValue.length || 0,
    [value, cachedDefaultValue],
  );

  useUpdateAccessor({ accessor: schemaItem.accessor });

  const { setMetaInternalFieldState } = useContext(FormContext);

  const updateValue = async (data: any) => {
    const _value = formRef?.current?.getFieldValue(name.split("."));
    if (_value === undefined) return;
    if (isEqual(_value, data)) return;

    await setValue(_value);
    await setCachedDefaultValue(klona(_value));
    console.log("updateFormData result cb", {
      data,
      cachedDefaultValue,
      value,
      _value,
    });
  };
  const addItem = useCallback(
    (index?: number) => {
      const values = formRef?.current?.getFieldValue(name.split("."));
      if (values === undefined) {
        return;
      }

      values.push(values[index ?? -1] || {});
      console.log("addItem2", {
        values,
        index,
        name,
      });

      updateFormData(
        {
          [name]: values,
        },
        updateValue,
      );
    },
    [name, updateFormData, updateValue],
  );

  const remove = useCallback(
    (removedKey: string) => {
      const values = formRef?.current?.getFieldValue(name.split("."));
      if (values === undefined) return;

      const removedIndex = keysRef.current.findIndex(
        (key) => key === removedKey,
      );

      const newValues = values.filter(
        (_val: any, index: number) => index !== removedIndex,
      );

      console.log("removeremoveremoveremove", {
        removedIndex,
        removedKey,
        values,
        newValues,
        name,
        cachedDefaultValue,
      });

      // if (removedIndex < cachedDefaultValue.length) {
      //   setCachedDefaultValue((prev) => {
      //     const cloned = klona(prev);
      //     cloned.splice(removedIndex, 1);
      //     return cloned;
      //   });
      // }

      removedKeys.current = [removedKey];

      updateFormData({ [name]: newValues }, updateValue);
    },
    [name, updateFormData, updateValue],
  );
  console.log("ArrayField props", {
    defaultValue,
    value,
    name,
    passedDefaultValue,
    propertyPath,
    schemaItem,
    valueLength,
    keysRef,
    removedKeys,
    cachedDefaultValue,
  });

  const itemKeys = useMemo(() => {
    if (keysRef.current.length > valueLength) {
      if (removedKeys.current.length > 0) {
        const removedKey = removedKeys.current[0];
        const prevKeys: string[] = [...keysRef.current];
        const newKeys = prevKeys.filter((prevKey) => prevKey !== removedKey);

        keysRef.current = newKeys;
        removedKeys.current = [];
      } else {
        const diff = keysRef.current.length - valueLength;
        const newKeys = [...keysRef.current];
        newKeys.splice(-1 * diff);

        keysRef.current = newKeys;
      }
    } else if (keysRef.current.length < valueLength) {
      const diff = valueLength - keysRef.current.length;

      const newKeys = Array(diff).fill(0).map(generateReactKey);

      keysRef.current = [...keysRef.current, ...newKeys];
    }

    return keysRef.current;
  }, [valueLength]);

  useDeepEffect(() => {
    updateFormData(
      {
        [name]: klona(defaultValue),
      },
      updateValue,
    );
  }, [defaultValue]);

  /**
   * If array field is reset/array items are removed, the field metaInternalState
   * should reflect that change. This block ensures only when there is a
   * decrease of array items, we remove the last n removed items as the rest
   * would auto correct it self by individual field using useRegisterFieldInvalid hook
   */
  useDeepEffect(() => {
    setMetaInternalFieldState((prevState) => {
      const metaInternalFieldState = klona(prevState.metaInternalFieldState);
      const currMetaInternalFieldState: FieldState<{ isValid: true }> = get(
        metaInternalFieldState,
        name,
        [],
      );

      if (Array.isArray(currMetaInternalFieldState)) {
        if (currMetaInternalFieldState.length > itemKeys.length) {
          const updatedMetaInternalFieldState =
            currMetaInternalFieldState.slice(0, itemKeys.length);

          set(metaInternalFieldState, name, updatedMetaInternalFieldState);
        }
      }

      return {
        ...prevState,
        metaInternalFieldState,
      };
    });
  }, [itemKeys, name]);

  const fields = useMemo(() => {
    const arrayItemSchema = schemaItem.children[ARRAY_ITEM_KEY];

    const fieldPropertyPath = `${propertyPath}.children.${ARRAY_ITEM_KEY}`;
    console.log("ArrayField fields", {
      arrayItemSchema,
      fieldPropertyPath,
      itemKeys,
    });

    return itemKeys.map((key, index) => {
      // const fieldName = `${name}[${index}]` as ControllerRenderProps["name"];
      const fieldName = `${name}.${index}` as ControllerRenderProps["name"];

      console.log("ArrayField", {
        fieldName,
        key,
        index,
        fieldPropertyPath,
        arrayItemSchema,
      });

      return (
        <Accordion
          backgroundColor={schemaItem.cellBackgroundColor}
          borderColor={schemaItem.cellBorderColor}
          borderRadius={schemaItem.cellBorderRadius}
          borderWidth={schemaItem.cellBorderWidth}
          boxShadow={schemaItem.cellBoxShadow}
          className={`t--jsonformfield-${fieldClassName}-item t--item-${index}`}
          isCollapsible={schemaItem.isCollapsible}
          key={key}
          title={`${index + 1}`}
        >
          <StyledItemWrapper>
            <FieldRenderer
              fieldName={fieldName}
              inArray
              isLastField
              key={key}
              options={DEFAULT_FIELD_RENDERER_OPTIONS}
              passedDefaultValue={cachedDefaultValue[index]}
              propertyPath={fieldPropertyPath}
              schemaItem={arrayItemSchema}
            />
            <StyledButtonContainer>
              {/* 复制 */}
              <Tooltip title="复制该项到行尾">
                <Button
                  className="t--jsonformfield-array-copy-btn p-0"
                  key={key}
                  onClick={() => addItem(index)}
                  size="small"
                  type="link"
                >
                  <CopyOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="删除">
                {/* 删除 */}
                <Button
                  className="t--jsonformfield-array-delete-btn p-0"
                  danger
                  disabled={schemaItem.isDisabled}
                  key={key}
                  onClick={
                    schemaItem.isDisabled ? undefined : () => remove(key)
                  }
                  size="small"
                  type="link"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            </StyledButtonContainer>
          </StyledItemWrapper>
        </Accordion>
      );
    });
  }, [
    cachedDefaultValue,
    fieldClassName,
    itemKeys,
    name,
    propertyPath,
    remove,
    schemaItem,
  ]);

  if (!schemaItem.isVisible) {
    return null;
  }

  return (
    <StyledNestedFormWrapper
      backgroundColor={schemaItem.backgroundColor}
      borderColor={schemaItem.borderColor}
      borderRadius={schemaItem.borderRadius}
      borderWidth={schemaItem.borderWidth}
      boxShadow={schemaItem.boxShadow}
      className={`t--jsonformfield-${fieldClassName} NestedFormWrapper ${
        isLastField ? "is-last-field" : ""
      }`}
      key={`${name}-add-btn`}
      labelStyle={schemaItem.labelStyle}
      labelTextColor={schemaItem.labelTextColor}
      labelTextSize={schemaItem.labelTextSize}
      withoutPadding={isRootField}
    >
      <FieldLabel
        labelStyle={schemaItem.labelStyle}
        labelText={schemaItem.labelText}
        labelTextColor={schemaItem.labelTextColor}
        labelTextSize={schemaItem.labelTextSize}
        tooltip={schemaItem.tooltip}
      >
        {/* <ProFormList
          actionRef={actionRef}
          copyIconProps={false}
          deleteIconProps={false}
          tooltip={schemaItem.tooltip}
          initialValue={defaultValue}
          // label={schemaItem.labelText}
          name={name}
        > */}
        {/* <ProFormGroup
          direction="vertical"
          key={name + "-group" + generateReactKey()}
          size={"middle"}
          spaceProps={{
            direction: "vertical",
          }}
        > */}
        {fields}
        {/* </ProFormGroup> */}
        {/* </ProFormList> */}
        <Button
          className={
            "t--jsonformfield-array-add-btn w-full mt-3" + ` ${name}-add-btn`
          }
          disabled={schemaItem.isDisabled}
          icon={<PlusOutlined />}
          key={`${name}-add-btn`}
          onClick={schemaItem.isDisabled ? undefined : () => addItem()}
        >
          添加新项
        </Button>
      </FieldLabel>
    </StyledNestedFormWrapper>
  );
}

const MemoizedArrayField: FieldComponent = React.memo(ArrayField);
MemoizedArrayField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedArrayField;
