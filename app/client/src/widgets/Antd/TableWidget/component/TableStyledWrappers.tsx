import styled, { css } from "styled-components";
import type { CellLayoutProperties } from "./Constants";
import type { Color } from "constants/Colors";
import type { TableVariant } from "../constants";

export const TableWrapper = styled.div<{
  width: number;
  height: number;
  accentColor: string;
  backgroundColor?: Color;
  triggerRowSelection: boolean;
  isHeaderVisible?: boolean;
  borderRadius: string;
  boxShadow?: string;
  borderColor?: string;
  borderWidth?: number;
  isResizingColumn?: boolean;
  variant?: TableVariant;
  isAddRowInProgress: boolean;
  multiRowSelection?: boolean;
}>`
  width: 100%;
  height: 100%;
  background: white;
  border-style: solid;
  border-width: ${({ borderWidth }) => `${borderWidth}px`};
  border-color: ${({ borderColor }) => borderColor};
  border-radius: ${({ borderRadius }) => borderRadius};
  box-shadow: ${({ boxShadow }) => `${boxShadow}`} !important;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  overflow: hidden;


  }
`;

export const TableStyles = css<{
  cellProperties?: CellLayoutProperties;
  isTextType?: boolean;
}>``;
