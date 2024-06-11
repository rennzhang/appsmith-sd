import { ASSETS_CDN_URL } from "constants/ThirdPartyConstants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import { getAssetUrl } from "@appsmith/utils/airgapHelpers";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DynamicHeight } from "utils/WidgetFeatures";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "Antd 图片",
  searchTags: ["picture", "image", "图片"],
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD],
  defaults: {
    // features: {
    //   dynamicHeight: {
    //     sectionIndex: 3,
    //     // 让容器高度自适应，自动高度
    //     defaultValue: DynamicHeight.AUTO_HEIGHT,
    //     active: false,
    //   },
    // },
    // dynamicHeight: "AUTO_HEIGHT",
    defaultImage: getAssetUrl(`${ASSETS_CDN_URL}/widgets/default.png`),
    imageShape: "RECTANGLE",
    scaleStep: 0.5,
    horizontalPosition: "center",
    verticalPosition: "center",
    horizontalPositionPercentage: 50,
    enableRotation: true,
    enableDownload: false,
    objectFit: "cover",
    enablePreview: true,
    image: "",
    imageList: [],
    showMode:"single",
    rows: 12,
    columns: 12,
    widgetName: "AntdImage",
    version: 1,
    animateLoading: false,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
    setterConfig: Widget.getSetterConfig(),
    autocompleteDefinitions: Widget.getAutocompleteDefinitions(),
  },
  autoLayout: {
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "280px",
            minHeight: "40px",
          };
        },
      },
    ],
  },
};

export default Widget;
