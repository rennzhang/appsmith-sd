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
    const valueName = props.fieldNames?.title ?? "title";
    const labelName = props.fieldNames?.value ?? "value";

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
    // return flat(props.options);

    return [];
  },

  getCheckedLabels: (props, moment, _) => {
    const valueName = props.fieldNames?.title ?? "title";
    const labelName = props.fieldNames?.value ?? "value";
    const options = props.flattenedOptions || [];
    // const options = this.getFlattenedOptions();
    if (Array.isArray(keys) && keys.length) {
      const labels = keys?.map((value) => {
        return options?.find((option) => option[valueName] === value)?.[
          labelName
        ];
      });
      return labels;
    }
    return [];
  },
  //
};
