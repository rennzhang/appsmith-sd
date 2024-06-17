/* eslint-disable @typescript-eslint/no-unused-vars*/
export default {
  getFilelist: (props, moment, _) => {
    console.log("上传组件 getFilelist", props.fileList);
    return props.fileList;
  },
};
