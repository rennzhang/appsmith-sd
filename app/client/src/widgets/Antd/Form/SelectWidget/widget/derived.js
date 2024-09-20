/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getIsValid: (props, moment, _) => {
    return props.isRequired
      ? !_.isNil(props.selectedValue) && props.selectedValue !== ""
      : true;
  },
  //

  //
  getFlattenedOptions: (props, moment, _) => {
    const valueName = props.valueKey ?? "value";
    const labelName = props.labelKey ?? "label";

    const flat = (array) => {
      let result = [];
      array.forEach((a) => {
        result.push({
          [valueName]: a[valueName],
          [labelName]: a[labelName],
          label: a[labelName],
          value: a[valueName],
        });
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    };
    // return flat(props.options);

    return [];
  },
};
