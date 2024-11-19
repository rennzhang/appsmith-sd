import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { ControlWrapper, InputGroup } from "./StyledControls";
import { Input, Icon } from "design-system";

import type { SegmentedControlOption } from "design-system";
import { Button } from "design-system";
import { generateReactKey } from "utils/generators";
import { debounce, noop } from "lodash";
import { getNextEntityName } from "utils/AppsmithUtils";
import { DraggableListControl } from "pages/Editor/PropertyPane/DraggableListControl";
import { DroppableComponent } from "components/propertyControls/DraggableListComponent";

type DroppableItem = {
  id: string;
  isVisible?: boolean;
  index: number;
  value: string;
  label: string;
};

export const StyledIcon = styled(Icon)`
  padding: 0;
  margin-right: 15px;
  cursor: move;
`;
function updateOptionLabel<T>(
  options: Array<T>,
  index: number,
  updatedLabel: string,
) {
  return options.map((option: T, optionIndex) => {
    if (index !== optionIndex) {
      return option;
    }
    return {
      ...option,
      label: updatedLabel,
    };
  });
}

function updateOptionValue<T>(
  options: Array<T>,
  index: number,
  updatedValue: string,
) {
  return options.map((option, optionIndex) => {
    if (index !== optionIndex) {
      return option;
    }
    return {
      ...option,
      value: updatedValue,
    };
  });
}

const StyledBox = styled.div`
  width: 10px;
`;

type UpdatePairFunction = (
  pair: SegmentedControlOption[],
  isUpdatedViaKeyboard?: boolean,
) => any;

type KeyValueComponentProps = {
  pairs: SegmentedControlOption[];
  updatePairs: UpdatePairFunction;
  addLabel?: string;
};

type SegmentedControlOptionWithKey = SegmentedControlOption & {
  key: string;
};

const StyledInputGroup = styled(InputGroup)`
  > .ads-v2-input__input-section > div {
    min-width: 0px;
  }
`;

export function KeyValueComponentWithDrag(props: KeyValueComponentProps) {
  const [renderPairs, setRenderPairs] = useState<
    SegmentedControlOptionWithKey[]
  >([]);
  const { pairs } = props;
  useEffect(() => {
    let { pairs } = props;
    pairs = Array.isArray(pairs) ? pairs.slice() : [];

    const newRenderPairs: SegmentedControlOptionWithKey[] = pairs.map(
      (pair) => {
        return {
          ...pair,
          key: generateReactKey(),
        };
      },
    );

    if (JSON.stringify(pairs) !== JSON.stringify(renderPairs)) {
      setRenderPairs(newRenderPairs);
    }
  }, [props.pairs]);

  const debouncedUpdatePairs = useCallback(
    debounce((updatedPairs: SegmentedControlOption[]) => {
      props.updatePairs(updatedPairs, true);
    }, 200),
    [props.updatePairs],
  );

  function updateKey(index: number, updatedKey: string) {
    let { pairs } = props;
    pairs = Array.isArray(pairs) ? pairs : [];
    const updatedPairs = updateOptionLabel(pairs, index, updatedKey);
    const updatedRenderPairs = updateOptionLabel(
      renderPairs,
      index,
      updatedKey,
    );
    console.log("KeyValueComponentWithDrag updatedKey", {
      updatedPairs,
      index,
      updatedKey,
      updatedRenderPairs,
    });
    setRenderPairs(updatedRenderPairs);
    debouncedUpdatePairs(updatedPairs);
  }

  function updateValue(index: number, updatedValue: string) {
    let { pairs } = props;
    pairs = Array.isArray(pairs) ? pairs : [];
    const updatedPairs = updateOptionValue(pairs, index, updatedValue);
    const updatedRenderPairs = updateOptionValue(
      renderPairs,
      index,
      updatedValue,
    );
    console.log("KeyValueComponentWithDrag updateValue", {
      updatedPairs,
      index,
      updatedValue,
      updatedRenderPairs,
    });

    setRenderPairs(updatedRenderPairs);
    debouncedUpdatePairs(updatedPairs);
  }

  function deletePair(index: number, isUpdatedViaKeyboard = false) {
    let { pairs } = props;
    pairs = Array.isArray(pairs) ? pairs : [];

    const newPairs = pairs.filter((o, i) => i !== index);
    const newRenderPairs = renderPairs.filter((o, i) => i !== index);

    setRenderPairs(newRenderPairs);
    props.updatePairs(newPairs, isUpdatedViaKeyboard);
  }

  function addPair(e: React.MouseEvent) {
    let { pairs } = props;
    pairs = Array.isArray(pairs) ? pairs.slice() : [];
    pairs.push({
      label: getNextEntityName(
        "Option",
        pairs.map((pair: any) => pair.label),
      ),
      value: getNextEntityName(
        "OPTION",
        pairs.map((pair: any) => pair.value),
      ),
    });
    const updatedRenderPairs = renderPairs.slice();
    updatedRenderPairs.push({
      label: getNextEntityName(
        "Option",
        renderPairs.map((pair: any) => pair.label),
      ),
      value: getNextEntityName(
        "OPTION",
        renderPairs.map((pair: any) => pair.value),
      ),
      key: getNextEntityName(
        "OPTION",
        renderPairs.map((pair: any) => pair.value),
      ),
    });

    setRenderPairs(updatedRenderPairs);
    props.updatePairs(pairs, e.detail === 0);
  }

  // 处理拖拽后的项目更新
  const updateItems = (items: DroppableItem[]) => {
    const updatedPairs = items.map((item) => ({
      label: item.label,
      value: item.value,
      key: generateReactKey(),
    }));
    console.log("KeyValueComponentWithDrag updateItems", {
      updatedPairs,
    });

    setRenderPairs(updatedPairs);
    props.updatePairs(updatedPairs);
  };

  // 将pairs转换为draggable items
  const draggableItems = useMemo<DroppableItem[]>(
    () =>
      renderPairs.map((pair, index) => ({
        id: pair.key,
        index,
        label: pair.label as string,
        value: pair.value,
        isVisible: true,
      })),
    [renderPairs],
  );
  console.log("KeyValueComponentWithDrag draggableItems", {
    draggableItems,
  });

  return (
    <>
      <DroppableComponent
        deleteOption={noop}
        itemHeight={40}
        items={draggableItems}
        renderComponent={(props: any) => {
          const { index, item } = props;
          console.log("KeyValueComponentWithDrag renderComponent", {
            props,
          });
          return (
            <div className="flex flex-row">
              <StyledIcon name="drag-control" size="md" />
              <StyledInputGroup
                dataType={"text"}
                onChange={(value: string) => {
                  updateKey(index, value);
                }}
                placeholder={"名称"}
                value={item.label}
              />
              <StyledBox />
              <StyledInputGroup
                dataType={"text"}
                onChange={(value: string) => {
                  updateValue(index, value);
                }}
                placeholder={"值"}
                value={item.value}
              />

              <StyledBox />
              <Button
                isIconButton
                kind="tertiary"
                onClick={(e: React.MouseEvent) => {
                  deletePair(index, e.detail === 0);
                }}
                size="sm"
                startIcon="delete-bin-line"
                style={{ width: "50px" }}
              />
            </div>
          );
        }}
        updateItems={updateItems}
        updateOption={noop}
      />

      <div className="flex flex-row-reverse mt-1">
        <Button
          className="t--property-control-options-add"
          kind="tertiary"
          onClick={addPair}
          size="sm"
          startIcon="plus"
        >
          {props.addLabel || "添加一项"}
        </Button>
      </div>
    </>
  );
}
