// import { AutoComplete } from "antd";
// import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";
import type { ProFormInstance } from "@ant-design/pro-components";
import { ProFormItem, ProForm } from "@ant-design/pro-components";
import { Input } from "antd";
import {
  AntdFormItemContainer,
  AntdProformContainer,
} from "widgets/Antd/Style";

export interface ProformContainerComponentProps
  extends WidgetStyleContainerProps {
  getChildContainer: () => ContainerWidgetProps<WidgetProps>;
  children: ReactNode;
  backgroundImage?: string;
  shouldScrollContents?: boolean;
  resizeDisabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  detachFromLayout?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onClickCapture?: MouseEventHandler<HTMLDivElement>;
  backgroundColor?: string;
  noScroll?: boolean;
  minHeight?: number;
  useAutoLayout?: boolean;
  direction?: string;
  justifyContent?: string;
  alignItems?: string;
  dropDisabled?: boolean;
  appPositioningType?: AppPositioningTypes;
  isListItemContainer?: boolean;
}

// export default InputComponent;
import type { MouseEventHandler, ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { AutoComplete, ConfigProvider } from "antd";
import styled from "styled-components";
import { LabelPosition } from "design-system-old";
import type { WidgetStyleContainerProps } from "components/designSystems/appsmith/WidgetStyleContainer";
import type { AppPositioningTypes } from "reducers/entityReducers/pageListReducer";
import type { WidgetType } from "utils/WidgetFactory";
import type { WidgetProps } from "widgets/BaseWidget";
import type { ContainerWidgetProps } from "widgets/ContainerWidget/widget";
const mockVal = (str: InputDataType, repeat = 1) => ({
  value: String(str).repeat(repeat),
});

type InputDataType = string | undefined;
const AntdAutoComplete = (props: ProformContainerComponentProps) => {
  const { borderRadius, boxShadow, children, getChildContainer } = props;

  const [value, setValue] = useState<InputDataType>();
  const [options, setOptions] = useState<{ value: string }[]>([]);

  const formRef = useRef<ProFormInstance<any>>();

  const handleFinsh = async (values: any) => {
    console.group("表单组件 handleFinsh");
    console.log("表单组件 handleFinsh");
    console.log(values);
    console.log(" formRef.current", formRef.current);
    const val1 = await formRef.current?.validateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();
  };

  const handleSubmit = async (values: any) => {
    const childContainer = getChildContainer?.();

    console.log("表单组件 handleSubmit", values, childContainer);
  };
  return (
    <AntdProformContainer>
      <ConfigProvider
        theme={{
          components: {
            Form: {
              // labelColor: labelTextColor,
              // labelFontSize: parseInt(labelTextSize || "0"),
            },
          },
        }}
      >
        <ProForm
          formRef={formRef}
          onFinish={handleFinsh}
          submitter={{
            onSubmit: handleSubmit,
          }}
        >
          {children}
        </ProForm>
      </ConfigProvider>
    </AntdProformContainer>
  );
};

export default AntdAutoComplete;
