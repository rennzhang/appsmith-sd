import type { ComponentProps } from "widgets/BaseComponent";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ConfigProvider, Image, Space } from "antd";
import {
  AntdImageContainer,
  ImagePreviewContainer,
  AntdImageBackground,
} from "widgets/Antd/Style";
import {
  DownloadOutlined,
  UndoOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";
import { size } from "lodash";
const onDownload = (src: string) => {
  fetch(src)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    });
};
const ImageComponent = (props: ImageComponentProps) => {
  const {
    borderRadius,
    boxShadow,
    defaultImageUrl,
    disableDrag,
    enableDownload,
    enablePreview,
    enableRotation,
    height,
    horizontalPosition,
    horizontalPositionPercentage,
    imageList,
    imageUrl,
    isLoading,
    objectFit,
    onClick,
    scaleStep,
    showHoverPointer,
    showMode,
    verticalPosition,
    verticalPositionPercentage,
    widgetId,
    width,
  } = props;

  const [computedWidth, setComputedWidth] = useState<string | number>(width);
  const [computedHeight, setComputedHeight] = useState<string | number>("auto");

  useEffect(() => {
    console.log("图片组件 componentWidth 变化", width);

    setComputedWidth(parseInt(width as any) - 8);
    setComputedHeight("auto");
  }, [width]);

  useEffect(() => {
    console.log("图片组件 componentHeight 变化", height);
    setComputedWidth("auto");
    setComputedHeight(parseInt(height as any) - 8);
  }, [height]);

  const horizontalPositionMemo = useMemo(() => {
    if (["fill", "contain"].includes(objectFit)) {
      return "center";
    }
    return horizontalPosition === "percentage"
      ? `${horizontalPositionPercentage}%`
      : horizontalPosition;
  }, [horizontalPosition, horizontalPositionPercentage, objectFit]);

  const verticalPositionMemo = useMemo(() => {
    if (["fill", "contain"].includes(objectFit)) {
      return "center";
    }
    return verticalPosition === "percentage"
      ? `${verticalPositionPercentage}%`
      : verticalPosition;
  }, [verticalPosition, verticalPositionPercentage, objectFit]);

  const imageListMemo = useMemo(() => {
    let result = imageList;
    if (typeof imageList === "string") {
      try {
        result = JSON.parse(imageList);
      } catch (e) {
        result = [];
      }
    }
    return result;
  }, [imageList]);
  return (
    <ConfigProvider
      theme={{
        components: {
          Image: {
            borderRadius: (borderRadius as unknown as number) || 0,
            boxShadow: boxShadow,
          },
        },
      }}
    >
      <AntdImageContainer
        borderRadius={borderRadius}
        boxShadow={boxShadow}
        className={`image-container-${widgetId}`}
        defaultImageUrl={defaultImageUrl}
        horizontalPositionMemo={horizontalPositionMemo}
        imageUrl={imageUrl}
        objectFit={objectFit}
        verticalPositionMemo={verticalPositionMemo}
      >
        <Image.PreviewGroup
          items={showMode == "album" ? imageListMemo : undefined}
          preview={
            enablePreview
              ? {
                  scaleStep,
                  countRender: (currentIndex: number, allSize: number) => (
                    <div style={{ marginBottom: "30px" }}>
                      {currentIndex}/{allSize}
                    </div>
                  ),
                  toolbarRender: (
                    _,
                    {
                      actions: {
                        onFlipX,
                        onFlipY,
                        onRotateLeft,
                        onRotateRight,
                        onZoomIn,
                        onZoomOut,
                      },
                      transform: { scale },
                    },
                  ) => (
                    <ImagePreviewContainer className="image-preview-container">
                      <Space className="toolbar-wrapper" size={12}>
                        {enableDownload && (
                          <DownloadOutlined
                            onClick={() => onDownload(imageUrl)}
                          />
                        )}
                        {enableRotation && (
                          <>
                            <SwapOutlined onClick={onFlipY} rotate={90} />
                            <SwapOutlined onClick={onFlipX} />
                            <RotateLeftOutlined onClick={onRotateLeft} />
                            <RotateRightOutlined onClick={onRotateRight} />
                          </>
                        )}
                        <ZoomOutOutlined
                          disabled={scale === 1}
                          onClick={onZoomOut}
                        />
                        <ZoomInOutlined
                          disabled={scale === 50}
                          onClick={onZoomIn}
                        />
                      </Space>
                    </ImagePreviewContainer>
                  ),
                }
              : false
          }
        >
          {showMode == "tile" ? (
            <div className="flex max-h-full">
              {imageListMemo?.map?.((item, index) => (
                <Image
                  fallback={defaultImageUrl}
                  height={"100%"}
                  key={item}
                  onClick={onClick}
                  placeholder
                  src={item}
                  width={"100%"}
                />
              ))}
            </div>
          ) : (
            <Image
              fallback={defaultImageUrl}
              height={"100%"}
              onClick={onClick}
              placeholder
              src={imageUrl}
              width={"100%"}
            />
          )}
        </Image.PreviewGroup>
      </AntdImageContainer>
    </ConfigProvider>
  );
};

export interface ImageComponentProps extends ComponentProps {
  showMode?: string;
  imageUrl: string;
  defaultImageUrl: string;
  isLoading: boolean;
  showHoverPointer?: boolean;
  scaleStep: number;
  enableRotation?: boolean;
  enableDownload?: boolean;
  objectFit: string;
  disableDrag: (disabled: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  borderRadius: string;
  boxShadow?: string;
  width: number | string;
  height: number | string;
  enablePreview?: boolean;
  horizontalPosition: string;
  verticalPosition: string;
  horizontalPositionPercentage: number;
  verticalPositionPercentage: number;
  imageList: string[];
}

export default ImageComponent;
