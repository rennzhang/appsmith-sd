import React, { useEffect, useState } from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import { BaseButton } from "widgets/ButtonWidget/component";
import { Colors } from "constants/Colors";
import { ConfigProvider, message } from "antd";
import { ButtonVariantTypes, LabelPosition } from "components/constants";
import type { ButtonProps, UploadFile, UploadProps } from "antd";
import { Button, Upload } from "antd";
import styled from "styled-components";
import { AntdFormItemContainer, BtnContent } from "widgets/Antd/Style";
import type { IconName } from "@blueprintjs/core";
import { Icon, Alignment } from "@blueprintjs/core";
import type {
  ButtonBorderRadius,
  ButtonVariant,
  ButtonPlacement,
} from "components/constants";
import { ProFormItem } from "@ant-design/pro-components";
import type { FormLabelAlign } from "@taroify/core/form";
import type { FileType } from "design-system-old";
const StyledDropdownBox = styled.div<{
  boxShadow?: string;
  borderRadius?: string;
}>`
  padding: 0;
  min-width: 0px;
  overflow: hidden;
  box-shadow: ${({ boxShadow }) => boxShadow};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

const UploadDraggerContentBox = styled.div<{
  iconColor?: string;
}>`
  .ant-upload-drag-icon {
    color: ${({ iconColor }) => iconColor};
  }
`;

function FilePickerComponent(props: FilePickerComponentProps) {
  let computedLabel = props.label;

  const {
    allowedFileTypes,
    borderRadius,
    boxShadow,
    buttonColor,
    buttonSize,
    buttonVariant,
    directory,
    dragText,
    files,
    iconAlign,
    iconColor,
    iconName,
    iconSize,
    isDisabled,
    isDragger,
    label,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    maxFileSize,
    maxNumFiles,
    multiple,
    onFilesSelected,
    placement,
    required,
  } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (files) {
      setFileList(files);
    }
  }, [files]);

  console.log("上传组件 ", props, allowedFileTypes);

  if (props.files && props.files.length) {
    computedLabel = `已选择 ${props.files.length} 个文件`;
  }
  // 校验文件大小
  const validateFileSize = (file: File) => {
    console.log("上传组件 文件大小", file.size / 1024 / 1024, maxFileSize);

    return file.size / 1024 / 1024 < (maxFileSize || 5);
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    // console.log("上传组件 beforeUpload", file);

    const isLt2M = validateFileSize(file); // 2MB 限制
    if (!isLt2M) {
      message.error(`${file.name} 文件大小不能超过 ${maxFileSize}MB!`);
    }
    return false;
    // let data = undefined;
    // const reader = new FileReader();
    // reader.onload = async (e) => {
    //   const blob = new Blob([e.target.result], { type: file.type });
    //   data = blob;
    //   console.log("上传组件 Blob data:", e, blob, data);
    //   // 在这里可以将 Blob 数据发送到服务器或进行其他处理
    //   setFileList([...fileList, { ...file, data }]);
    // };
    // reader.readAsArrayBuffer(file);
    // return data; // 返回 true 表示通过验证
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: file.type });
        console.log("上传组件 Blob data:", e, blob);

        resolve(blob as any);
        // const img = document.createElement("img");
        // img.src = reader.result as string;
        // img.onload = () => {
        //   const canvas = document.createElement("canvas");
        //   canvas.width = img.naturalWidth;
        //   canvas.height = img.naturalHeight;
        //   const ctx = canvas.getContext("2d")!;
        //   ctx.drawImage(img, 0, 0);
        //   ctx.fillStyle = "red";
        //   ctx.textBaseline = "middle";
        //   ctx.font = "33px Arial";
        //   ctx.fillText("Ant Design", 20, 20);
        //   canvas.toBlob((result) => resolve(result as any));
        // };
      };
    });
  };

  const accept = allowedFileTypes?.join(",") || "*";

  const handleUpload = () => {
    // const formData = new FormData();
    // fileList.forEach((file) => {
    //   formData.append("files[]", file as FileType);
    // });
    // setUploading(true);
    // // You can use any AJAX library you like
    // fetch("https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload", {
    //   method: "POST",
    //   body: formData,
    // })
    //   .then((res) => res.json())
    //   .then(() => {
    //     setFileList([]);
    //     message.success("upload successfully.");
    //   })
    //   .catch(() => {
    //     message.error("upload failed.");
    //   })
    //   .finally(() => {
    //     setUploading(false);
    //   });
  };

  const uploadProps: UploadProps = {
    name: "file",
    action: "http://api.jinzeplastics.com/api/app.php?service=App.File.Upload",
    method: "post",
    headers: {
      authorization: "authorization-text",
    },
    data: {
      access_token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI2ZjQ2YTFkZSIsImF1ZCI6ImFwcCIsInN1YiI6IlA3UHFORFlNS3hVZkNKakJtaW5INyIsInVpZCI6MSwiaWF0IjoxNzE4MTkyMzk2LCJleHAiOjE3MjA3ODQzOTZ9.tHsJWO0yrqF_Z5BULqkbhz24nCGEvG2Oul0oyHx-Q1I",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
      let fileList = [...info.fileList];

      fileList = fileList.map((file) => {
        const data = undefined;
        // 读取文件并转换为 Blob

        return { ...file, data };
      });
      // fileList = fileList.map((file) => {
      //   const newFile = {
      //     ...file,
      //   };
      //   if (!validateFileSize(file.originFileObj as File)) {
      //     newFile.status = "error";
      //     newFile.response = "上传失败，请检查文件大小";
      //   }
      //   // if (file.status === "error") {
      //   //   file.response = "上传失败，请检查文件大小";
      //   // }
      //   return newFile;
      // });
      console.log("上传组件 fileList", fileList);

      setFileList(fileList);
      onFilesSelected && onFilesSelected(fileList);
    },
  };
  return (
    <AntdFormItemContainer
      borderRadius={borderRadius}
      boxShadow={boxShadow}
      className="antd-transfer-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              // labelFontSize: parseInt(labelTextSize || "0"),
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            Button: {
              algorithm: true,
              colorPrimary: buttonColor,
              colorLink: buttonColor,
              borderRadius: (borderRadius as unknown as number) || 0,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          labelCol={
            labelPosition == LabelPosition.Left
              ? { span: labelWidth }
              : undefined
          }
          required={required}
          tooltip={labelTooltip}
        >
          <Button
            disabled={fileList.length === 0}
            loading={uploading}
            onClick={handleUpload}
            style={{ marginTop: 16 }}
            type="primary"
          >
            {uploading ? "Uploading" : "Start Upload"}
          </Button>
          {isDragger ? (
            <Upload.Dragger
              accept={accept}
              beforeUpload={beforeUpload}
              directory={directory}
              fileList={fileList}
              maxCount={maxNumFiles}
              multiple={multiple}
              {...uploadProps}
            >
              <UploadDraggerContentBox iconColor={iconColor}>
                <p className="ant-upload-drag-icon">
                  <Icon color={iconColor} icon={iconName} size={iconSize} />
                </p>
                <p className="ant-upload-text">
                  单击或拖动文件到此区域进行上传
                </p>
                <p className="ant-upload-hint">{dragText}</p>
              </UploadDraggerContentBox>
            </Upload.Dragger>
          ) : (
            <Upload
              accept={accept}
              beforeUpload={beforeUpload}
              directory={directory}
              fileList={fileList}
              maxCount={maxNumFiles}
              multiple={multiple}
              {...uploadProps}
            >
              <Button
                block
                className="w-full"
                disabled={isDisabled}
                ghost={buttonVariant === ButtonVariantTypes.SECONDARY}
                onClick={(e) => e.preventDefault()}
                size={buttonSize}
                type={
                  buttonVariant === ButtonVariantTypes.TERTIARY
                    ? "link"
                    : "primary"
                }
              >
                <BtnContent
                  className="w-full h-full flex items-center"
                  placement={placement}
                >
                  {iconAlign !== Alignment.RIGHT && iconName ? (
                    <Icon className="mr-1" icon={iconName} />
                  ) : null}
                  {label}
                  {iconAlign == Alignment.RIGHT && iconName ? (
                    <Icon className="ml-1" icon={iconName} />
                  ) : null}
                </BtnContent>
              </Button>
            </Upload>
          )}
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}
export interface FilePickerComponentProps extends ComponentProps {
  onFilesSelected?: (files: any[]) => void;
  isDragger?: boolean;
  dragText?: string;
  iconSize?: number;
  iconColor?: string;
  label: string;
  isLoading: boolean;
  files?: any[];
  buttonColor: string;
  borderRadius: string;
  boxShadow?: string;
  shouldFitContent: boolean;
  maxWidth?: number;
  minWidth?: number;
  minHeight?: number;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonVariant;
  iconAlign?: Alignment;
  iconName?: IconName;
  placement?: ButtonPlacement;
  labelStyle?: string;
  labelPosition?: LabelPosition;
  labelText?: string;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTooltip?: string;
  required?: boolean;
  allowedFileTypes?: string[];
  maxNumFiles?: number;
  multiple?: boolean;
  directory?: boolean;
  maxFileSize?: number;
  labelTextColor?: string;
  labelTextSize?: string;
}

FilePickerComponent.defaultProps = {
  backgroundColor: Colors.GREEN,
};

export default FilePickerComponent;
