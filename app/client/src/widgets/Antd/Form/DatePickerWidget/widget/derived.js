/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getIsValid: (props, moment, _) => {
    return props.isRequired
      ? !_.isNil(props.selectedOptionValue) && props.selectedOptionValue !== ""
      : true;
  },
  //
};
