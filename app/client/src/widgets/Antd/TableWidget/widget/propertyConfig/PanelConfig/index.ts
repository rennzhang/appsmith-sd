import { updateCustomColumnAliasOnLabelChange } from "../../propertyUtils";
import Alignment from "./Alignment";
import Color from "./Color";
import Data from "./Data";

import Events from "./Events";
import General, { GeneralStyle } from "./General";
import Icon from "./Icon";

import Select from "./Select";
import TreeSelect from "./TreeSelect";
import TextFormatting from "./TextFormatting";
import Validations from "./Validation";
// import DateProperties from "./DateProperties";
import ColumnStyleControl from "./ColumnStyleControl";

export default {
  editableTitle: true,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  dependencies: ["primaryColumns", "columnOrder"],
  contentChildren: [
    Data,
    General,
    Validations,
    Select,
    TreeSelect,
    Events /* DateProperties */,
  ],
  styleChildren: [
    GeneralStyle,
    Icon,
    Alignment,
    TextFormatting,
    ColumnStyleControl,
    Color,
  ],
  updateHook: updateCustomColumnAliasOnLabelChange,
};
