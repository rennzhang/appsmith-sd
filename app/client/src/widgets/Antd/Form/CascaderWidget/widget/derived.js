/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getIsValid: (props, moment, _) => {
    return props.isRequired
      ? !_.isNil(props.selectedOptionValue) && props.selectedOptionValue !== ""
      : true;
  },
  //
  getSelectedOptionLabel: (props, moment, _) => {
    const options = props.flattenedOptions ?? [];
    const selectedOptionLabels = props.selectedOption.map((value) => {
      return options.find((option) => option.value === value).label;
    });
    return selectedOptionLabels;
  },
  //
  getFlattenedOptions: (props, moment, _) => {
    const flat = (array) => {
      let result = [];
      array.forEach((a) => {
        result.push({ value: a.value, label: a.label });
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    };
    return flat(props.options);
  },
  //
};
