/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  // getEditableColumn
  getEditableColumn: (props, moment, _) => {
    const editableColumn = [];
    Object.values(props.primaryColumns).map((column) => {
      if (column.isCellEditable) {
        editableColumn.push(column);
      }
    });
    return editableColumn;
  },
  //
  getQueryData: (props, moment, _) => {
    return {
      pageNo: props.pageNo,
      pageSize: props.pageSize,
      sortOrder: props.sortOrder,
      filters: props.filters,
      searchKey: props.searchText,
    };
  },
  //
  getExpandedRows: (props, moment, _) => {
    const childrenColumnName = props.childrenColumnName || "children";
    const rows = props.filteredTableData || props.processedTableData || [];
    const expandedKeys = props.expandedKeys;
    if (!expandedKeys || expandedKeys.length === 0) {
      return [];
    }

    const findExpandedRows = (data, keys, result = []) => {
      if (!data || !Array.isArray(data)) {
        return result;
      }

      data.forEach((item) => {
        if (keys.includes(item[props.primaryColumnId])) {
          result.push(item);
        }

        if (
          item[childrenColumnName] &&
          Array.isArray(item[childrenColumnName])
        ) {
          findExpandedRows(item[childrenColumnName], keys, result);
        }
      });

      return result;
    };
    const expandedRows = findExpandedRows(rows, expandedKeys) || [];

    return expandedRows;
  },
  //
  getTriggeredRow: (props, moment, _) => {
    const childrenColumnName = props.childrenColumnName || "children";
    const rows = props.filteredTableData || props.processedTableData || [];
    const triggeredRowKey = props.triggeredRowKey;
    if (!triggeredRowKey) {
      return undefined;
    }

    const findRow = (data, key) => {
      if (!data || !Array.isArray(data)) {
        return undefined;
      }

      for (const item of data) {
        if (item[props.primaryColumnId] === key) {
          return item;
        }
        if (
          item[childrenColumnName] &&
          Array.isArray(item[childrenColumnName])
        ) {
          const foundInChildren = findRow(item[childrenColumnName], key);
          if (foundInChildren) {
            return foundInChildren;
          }
        }
      }

      return undefined;
    };
    const targetRow = findRow(rows, triggeredRowKey);

    return targetRow;
  },

  //
  getPageSize: (props, moment, _) => {
    const TABLE_SIZES = {
      DEFAULT: {
        COLUMN_HEADER_HEIGHT: 32,
        TABLE_HEADER_HEIGHT: 38,
        ROW_HEIGHT: 40,
        ROW_FONT_SIZE: 14,
        VERTICAL_PADDING: 6,
        EDIT_ICON_TOP: 10,
      },
      SHORT: {
        COLUMN_HEADER_HEIGHT: 32,
        TABLE_HEADER_HEIGHT: 38,
        ROW_HEIGHT: 30,
        ROW_FONT_SIZE: 12,
        VERTICAL_PADDING: 0,
        EDIT_ICON_TOP: 5,
      },
      TALL: {
        COLUMN_HEADER_HEIGHT: 32,
        TABLE_HEADER_HEIGHT: 38,
        ROW_HEIGHT: 60,
        ROW_FONT_SIZE: 18,
        VERTICAL_PADDING: 16,
        EDIT_ICON_TOP: 21,
      },
    };
    const compactMode = props.compactMode || "DEFAULT";
    const componentHeight =
      (props.appPositioningType === "AUTO" && props.isMobile
        ? props.mobileBottomRow - props.mobileTopRow
        : props.bottomRow - props.topRow) *
        props.parentRowSpace -
      10;
    const tableSizes = TABLE_SIZES[compactMode];

    const pageSize =
      (componentHeight -
        tableSizes.TABLE_HEADER_HEIGHT -
        tableSizes.COLUMN_HEADER_HEIGHT) /
      tableSizes.ROW_HEIGHT;
    return pageSize;
    return pageSize % 1 > 0.3 ? Math.ceil(pageSize) : Math.floor(pageSize);
  },
  //
  getProcessedTableData: (props, moment, _) => {
    const processRow = (row, index, indexPath = []) => {
      const childrenColumnName = props.childrenColumnName || "children";
      const currentIndexPath = [...indexPath, index];

      const processedRow = {
        ...row,
        __originalIndex__: index,
        __originalIndexPath__: currentIndexPath.join("."),
        __primaryKey__: props.primaryColumnId
          ? row[props.primaryColumnId]
          : undefined,
        ...props.transientTableData[index],
      };

      if (Array.isArray(row[childrenColumnName])) {
        processedRow[childrenColumnName] = row[childrenColumnName].map(
          (childRow, childIndex) =>
            processRow(childRow, childIndex, currentIndexPath),
        );
      }

      return processedRow;
    };

    let data;

    if (Array.isArray(props.tableData)) {
      data = props.tableData.map((row, index) => processRow(row, index));
    } else {
      data = [];
    }

    return data;
  },
  //
  getProcessedTableData1: (props, moment, _) => {
    const processRow = (row, index) => {
      const childrenColumnName = props.childrenColumnName || "children";
      const processedRow = {
        ...row,
        __originalIndex__: index,
        __primaryKey__: props.primaryColumnId
          ? row[props.primaryColumnId]
          : undefined,
        ...props.transientTableData[index],
      };

      if (_.isArray(row[childrenColumnName])) {
        processedRow[childrenColumnName] = row[childrenColumnName].map(
          (childRow, childIndex) => processRow(childRow, childIndex),
        );
      }

      return processedRow;
    };

    let data;

    if (_.isArray(props.tableData)) {
      /* Populate meta keys (__originalIndex__, __primaryKey__) and transient values */
      data = props.tableData.map((row, index) => processRow(row, index));
    } else {
      data = [];
    }

    return data;
  },

  //
  getOrderedTableColumns: (props, moment, _) => {
    const columns = [];
    let existingColumns = props.primaryColumns || {};
    /*
     * Assign index based on the columnOrder
     */
    if (
      _.isArray(props.columnOrder) &&
      props.columnOrder.length > 0 &&
      Object.keys(existingColumns).length > 0
    ) {
      const newColumnsInOrder = {};
      let index = 0;

      _.uniq(props.columnOrder).forEach((columnId) => {
        if (existingColumns[columnId]) {
          newColumnsInOrder[columnId] = Object.assign(
            {},
            existingColumns[columnId],
            {
              index,
            },
          );

          index++;
        }
      });

      existingColumns = newColumnsInOrder;
    }

    const sortByColumn = props.sortOrder && props.sortOrder.column;
    const isAscOrder = props.sortOrder && props.sortOrder.order === "asc";
    /* set sorting flags and convert the existing columns into an array */
    Object.values(existingColumns).forEach((column) => {
      /* guard to not allow columns without id */
      if (column.id) {
        column.isAscOrder = column.id === sortByColumn ? isAscOrder : undefined;
        columns.push(column);
      }
    });

    return columns;
  },
  //
  getFilteredTableData: (props, moment, _) => {
    /* Make a shallow copy */
    const primaryColumns = props.primaryColumns || {};
    const processedTableData = [...props.processedTableData];
    const derivedColumns = {};

    Object.keys(primaryColumns).forEach((id) => {
      if (primaryColumns[id] && primaryColumns[id].isDerived) {
        derivedColumns[id] = primaryColumns[id];
      }
    });

    if (!processedTableData || !processedTableData.length) {
      return [];
    }

    /* extend processedTableData with values from
     *  - computedValues, in case of normal column
     *  - empty values, in case of derived column
     */
    if (primaryColumns && _.isPlainObject(primaryColumns)) {
      Object.entries(primaryColumns).forEach(([id, column]) => {
        let computedValues = [];

        if (column && column.computedValue) {
          if (_.isString(column.computedValue)) {
            try {
              computedValues = JSON.parse(column.computedValue);
            } catch (e) {
              /* do nothing */
            }
          } else if (_.isArray(column.computedValue)) {
            computedValues = column.computedValue;
          }
        }

        /* for derived columns inject empty strings */
        if (
          computedValues.length === 0 &&
          derivedColumns &&
          derivedColumns[id]
        ) {
          computedValues = Array(processedTableData.length).fill("");
        }

        computedValues.forEach((computedValue, index) => {
          processedTableData[index] = {
            ...processedTableData[index],
            [column.alias]: computedValue,
          };
        });
      });
    }

    const columns = props.orderedTableColumns;
    const sortByColumnId = props.sortOrder.column;

    let sortedTableData;

    if (sortByColumnId) {
      const sortBycolumn = columns.find(
        (column) => column.id === sortByColumnId,
      );
      const sortByColumnOriginalId = sortBycolumn.alias;

      const columnType =
        sortBycolumn && sortBycolumn.columnType
          ? sortBycolumn.columnType
          : "text";
      const inputFormat = sortBycolumn.inputFormat;
      const isEmptyOrNil = (value) => {
        return _.isNil(value) || value === "";
      };
      const isAscOrder = props.sortOrder.order === "asc";
      const sortByOrder = (isAGreaterThanB) => {
        if (isAGreaterThanB) {
          return isAscOrder ? 1 : -1;
        } else {
          return isAscOrder ? -1 : 1;
        }
      };

      sortedTableData = processedTableData.sort((a, b) => {
        if (_.isPlainObject(a) && _.isPlainObject(b)) {
          if (
            isEmptyOrNil(a[sortByColumnOriginalId]) ||
            isEmptyOrNil(b[sortByColumnOriginalId])
          ) {
            /* push null, undefined and "" values to the bottom. */
            return isEmptyOrNil(a[sortByColumnOriginalId]) ? 1 : -1;
          } else {
            switch (columnType) {
              case "number":
                return sortByOrder(
                  Number(a[sortByColumnOriginalId]) >
                    Number(b[sortByColumnOriginalId]),
                );
              case "date":
                try {
                  return sortByOrder(
                    moment(a[sortByColumnOriginalId], inputFormat).isAfter(
                      moment(b[sortByColumnOriginalId], inputFormat),
                    ),
                  );
                } catch (e) {
                  return -1;
                }
              case "url":
                const column = primaryColumns[sortByColumnOriginalId];
                if (column && column.displayText) {
                  if (_.isString(column.displayText)) {
                    return sortByOrder(false);
                  } else if (_.isArray(column.displayText)) {
                    return sortByOrder(
                      column.displayText[a.__originalIndex__]
                        .toString()
                        .toLowerCase() >
                        column.displayText[b.__originalIndex__]
                          .toString()
                          .toLowerCase(),
                    );
                  }
                }
              default:
                return sortByOrder(
                  a[sortByColumnOriginalId].toString().toLowerCase() >
                    b[sortByColumnOriginalId].toString().toLowerCase(),
                );
            }
          }
        } else {
          return isAscOrder ? 1 : 0;
        }
      });
    } else {
      sortedTableData = [...processedTableData];
    }

    const ConditionFunctions = {
      isExactly: (a, b) => {
        return a.toString() === b.toString();
      },
      empty: (a) => {
        return _.isNil(a) || _.isEmpty(a.toString());
      },
      notEmpty: (a) => {
        return !_.isNil(a) && !_.isEmpty(a.toString());
      },
      notEqualTo: (a, b) => {
        return a.toString() !== b.toString();
      },
      /* Note: Duplicate of isExactly */
      isEqualTo: (a, b) => {
        return a.toString() === b.toString();
      },
      lessThan: (a, b) => {
        return Number(a) < Number(b);
      },
      lessThanEqualTo: (a, b) => {
        return Number(a) <= Number(b);
      },
      greaterThan: (a, b) => {
        return Number(a) > Number(b);
      },
      greaterThanEqualTo: (a, b) => {
        return Number(a) >= Number(b);
      },
      contains: (a, b) => {
        try {
          return a
            .toString()
            .toLowerCase()
            .includes(b.toString().toLowerCase());
        } catch (e) {
          return false;
        }
      },
      doesNotContain: (a, b) => {
        try {
          return !a
            .toString()
            .toLowerCase()
            .includes(b.toString().toLowerCase());
        } catch (e) {
          return false;
        }
      },
      startsWith: (a, b) => {
        try {
          return (
            a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) === 0
          );
        } catch (e) {
          return false;
        }
      },
      endsWith: (a, b) => {
        try {
          const _a = a.toString().toLowerCase();
          const _b = b.toString().toLowerCase();
          return (
            _a.lastIndexOf(_b) >= 0 &&
            _a.length === _a.lastIndexOf(_b) + _b.length
          );
        } catch (e) {
          return false;
        }
      },
      is: (a, b) => {
        return moment(a).isSame(moment(b), "minute");
      },
      isNot: (a, b) => {
        return !moment(a).isSame(moment(b), "minute");
      },
      isAfter: (a, b) => {
        return moment(a).isAfter(moment(b), "minute");
      },
      isBefore: (a, b) => {
        return moment(a).isBefore(moment(b), "minute");
      },
      isChecked: (a) => {
        return a === true;
      },
      isUnChecked: (a) => {
        return a === false;
      },
    };
    let searchKey;

    /* skipping search when client side search is turned off */
    if (
      props.searchText &&
      (!props.onSearchTextChanged || props.enableClientSideSearch)
    ) {
      searchKey = props.searchText.toLowerCase();
    } else {
      searchKey = "";
    }

    /*
     * We need to omit hidden column values from being included
     * in the search
     */
    const hiddenColumns = Object.values(props.primaryColumns)
      .filter((column) => !column.isVisible)
      .map((column) => column.alias);

    const finalTableData = sortedTableData.filter((row) => {
      let isSearchKeyFound = true;
      const columnWithDisplayText = Object.values(props.primaryColumns).filter(
        (column) => column.columnType === "url" && column.displayText,
      );
      const displayedRow = {
        ...row,
        ...columnWithDisplayText.reduce((acc, column) => {
          let displayText;
          if (_.isArray(column.displayText)) {
            displayText = column.displayText[row.__originalIndex__];
          } else {
            displayText = column.displayText;
          }
          acc[column.alias] = displayText;
          return acc;
        }, {}),
      };
      if (searchKey) {
        isSearchKeyFound = Object.values(_.omit(displayedRow, hiddenColumns))
          .join(", ")
          .toLowerCase()
          .includes(searchKey);
      }
      if (!isSearchKeyFound) {
        return false;
      }

      /* when there is no filter defined */
      if (!props.filters || props.filters.length === 0) {
        return true;
      }

      const filterOperator =
        props.filters.length >= 2 ? props.filters[1].operator : "OR";
      let isSatisfyingFilters = filterOperator === "AND";
      for (let i = 0; i < props.filters.length; i++) {
        let filterResult = true;
        try {
          const conditionFunction =
            ConditionFunctions[props.filters[i].condition];
          if (conditionFunction) {
            filterResult = conditionFunction(
              displayedRow[props.filters[i].column],
              props.filters[i].value,
            );
          }
        } catch (e) {
          filterResult = false;
        }

        /* if one filter condition is not satisfied and filter operator is AND, bailout early */
        if (!filterResult && filterOperator === "AND") {
          isSatisfyingFilters = false;
          break;
        } else if (filterResult && filterOperator === "OR") {
          /* if one filter condition is satisfied and filter operator is OR, bailout early */
          isSatisfyingFilters = true;
          break;
        }

        isSatisfyingFilters =
          filterOperator === "AND"
            ? isSatisfyingFilters && filterResult
            : isSatisfyingFilters || filterResult;
      }

      return isSatisfyingFilters;
    });
    return finalTableData;
  },
  //
  getUpdatedRow: (props, moment, _) => {
    const primaryColumns = props.primaryColumns;
    const updatedRow = props.updatedRow || props.updatedRows[0];

    const nonDataColumnTypes = [
      "editActions",
      "button",
      "iconButton",
      "menuButton",
    ];
    const nonDataColumnAliases = primaryColumns
      ? Object.values(primaryColumns)
          .filter((column) => nonDataColumnTypes.includes(column.columnType))
          .map((column) => column.alias)
      : [];

    const keysToBeOmitted = [
      "__originalIndex__",
      "__primaryKey__",
      ...nonDataColumnAliases,
    ];
    return _.omit(updatedRow, keysToBeOmitted);
  },
  //
  getUpdatedRows: (props, moment, _) => {
    const primaryColumns = props.primaryColumns;
    const nonDataColumnTypes = [
      "editActions",
      "button",
      "iconButton",
      "menuButton",
    ];
    const nonDataColumnAliases = primaryColumns
      ? Object.values(primaryColumns)
          .filter((column) => nonDataColumnTypes.includes(column.columnType))
          .map((column) => column.alias)
      : [];
    const keysToBeOmitted = [
      "__originalIndex__",
      "__primaryKey__",
      ...nonDataColumnAliases,
    ];

    const childrenColumnName = props.childrenColumnName || "children";
    const rows = props.filteredTableData || props.processedTableData || [];
    const targetRowKeys = props.updatedRowKeys;
    if (!targetRowKeys || targetRowKeys.length === 0) {
      return [];
    }

    const findTargetRows = (data, keys, result = []) => {
      if (!data || !Array.isArray(data)) {
        return result;
      }

      data.forEach((item) => {
        if (keys.includes(item[props.primaryColumnId])) {
          result.push(item);
        }

        if (
          item[childrenColumnName] &&
          Array.isArray(item[childrenColumnName])
        ) {
          findTargetRows(item[childrenColumnName], keys, result);
        }
      });

      return result;
    };
    const targetRows = findTargetRows(rows, targetRowKeys) || [];
    return targetRows;
  },
  //
  getPageOffset: (props, moment, _) => {
    const pageSize =
      props.serverSidePaginationEnabled && props.tableData
        ? props.tableData?.length
        : props.pageSize;

    if (
      Number.isFinite(props.pageNo) &&
      Number.isFinite(pageSize) &&
      props.pageNo >= 0 &&
      pageSize >= 0
    ) {
      /* Math.max fixes the value of (pageNo - 1) to a minimum of 0 as negative values are not valid */
      return Math.max(props.pageNo - 1, 0) * pageSize;
    }
    return 0;
  },

  //
  getTableHeaders: (props, moment, _) => {
    const columns = props.primaryColumns
      ? Object.values(props.primaryColumns)
      : [];

    return columns
      .sort((a, b) => a.index - b.index)
      .map((column) => ({
        id: column?.id,
        label: column?.label,
        isVisible: column?.isVisible,
      }));
  },
  //
};
