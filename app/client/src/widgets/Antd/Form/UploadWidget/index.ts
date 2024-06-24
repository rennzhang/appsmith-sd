import { BUTTON_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "utils/autoLayout/constants";
import FileDataTypes from "./constants";
import IconSVG from "./icon.svg";
import Widget from "./widget";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { DynamicHeight } from "utils/WidgetFeatures";
import { ButtonVariantTypes, AntdLabelPosition } from "components/constants";
import { DEFAULT_CONFIG } from "../CONST/DEFAULT_CONFIG";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "Antd 文件上传",
  iconSVG: IconSVG,
  tags: [WIDGET_TAGS.ANTD, WIDGET_TAGS.ANTD_FORM],
  needsMeta: true,
  searchTags: ["upload", "file picker"],
  defaults: {
    ...DEFAULT_CONFIG.defaults,

    labelWidth: 6,
    iconColor: "#553DE9",
    iconName: "cloud-upload",
    dragText: "支持单次或批量上传，严禁上传涉密数据或其他被禁止的文件",
    iconSize: 32,
    buttonVariant: ButtonVariantTypes.SECONDARY,
    dynamicHeight: DynamicHeight.AUTO_HEIGHT,
    rows: 4,
    files: [],
    selectedFiles: [],
    allowedFileTypes: [],
    label: "选择文件",
    columns: 16,
    maxNumFiles: 1,
    maxFileSize: 5,
    fileDataType: FileDataTypes.Base64,
    dynamicTyping: true,
    widgetName: "AntdUpload",
    isDefaultClickDisabled: true,
    version: 1,
    isRequired: false,
    isDisabled: false,
    animateLoading: false,
    responsiveBehavior: ResponsiveBehavior.Hug,
    minWidth: BUTTON_MIN_WIDTH,
    fileList: [],
    uploadedFileData: [],
    labelPosition: AntdLabelPosition.Auto,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    stylesheetConfig: Widget.getStylesheetConfig(),
    autocompleteDefinitions: Widget.getAutocompleteDefinitions(),
    setterConfig: Widget.getSetterConfig(),
  },
  autoLayout: {
    defaults: {
      rows: 4,
      columns: 6.632,
    },
    autoDimension: {
      width: true,
    },
    widgetSize: [
      {
        viewportMinWidth: 0,
        configuration: () => {
          return {
            minWidth: "120px",
            maxWidth: "360px",
            minHeight: "40px",
          };
        },
      },
    ],
    disableResizeHandles: {
      horizontal: true,
      vertical: true,
    },
  },
};

export default Widget;
