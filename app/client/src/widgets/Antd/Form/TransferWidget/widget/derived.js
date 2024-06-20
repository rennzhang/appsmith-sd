/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getIsValid: (props, moment, _) => {
    return props.isRequired
      ? !_.isNil(props.selectedOptionValue) && props.selectedOptionValue !== ""
      : true;
  },
  //
  getSelectedOptionValue: (props, moment, _) => {
    const options = props.flattenedOptions ?? [];
    let value = props.selectedOption;

    const valueIndex = _.findIndex(options, (option) => option.value === value);
    if (valueIndex === -1) {
      value = "";
    }

    // console.log("级联选择 getSelectedOptionValue", props, value, valueIndex);
    return value;
  },
  getSelectedOption: (props, moment, _) => {
    return props.selectedOption;
  },
  getTargetValues: (props, moment, _) => {
    return props.targetValues || [];
  },
  //
};
