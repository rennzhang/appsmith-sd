/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getIsValid: (props, moment, _) => {
    return props.isRequired
      ? !_.isNil(props.selectedOptionValue) && props.selectedOptionValue !== ""
      : true;
  },
  //

  //
  getFlattenedOptions: (props, moment, _) => {
    const valueName = props.valueKey ?? "key";
    const labelName = props.titleKey ?? "title";

    const flat = (array) => {
      let result = [];
      array.forEach((a) => {
        result.push({ [valueName]: a[valueName], [labelName]: a[labelName] });
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    };
    return flat(props.options);
  },
};
