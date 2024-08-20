import _ from "lodash";
import { flat } from "widgets/WidgetUtils";
import derivedProperty from "./derived";

const options = [
  {
    label: "Blue",
    value: "BLUE",
    children: [
      {
        label: "Dark Blue",
        value: "DARK BLUE",
      },
      {
        label: "Light Blue",
        value: "LIGHT BLUE",
      },
    ],
  },
  {
    label: "Green",
    value: "GREEN",
  },
  {
    label: "Red",
    value: "RED",
  },
  {
    label: "0",
    value: 0,
  },
  {
    label: "1",
    value: 1,
  },
];
const flattenedOptions = flat(options);

describe("Derived property - TreeSelect Widget", () => {
  describe("#getIsValid", () => {
    it("return true when isRequired false and selectedValue is empty string", () => {
      const isValid = derivedProperty.getIsValid(
        {
          isRequired: false,
          selectedValue: "",
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return true when isRequired true and selectedValue is not empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedValue: "GREEN",
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return true when isRequired true and selectedValue is not empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedValue: 0,
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return false when isRequired true and selectedValue is empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedValue: "",
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeFalsy();
    });
  });

  // describe("#getselectedValue", () => {
  //   it("selectedValue should have a value if defaultValue(String) is in option", () => {
  //     const selectedValue = derivedProperty.getselectedValue(
  //       {
  //         checkedKeys: "GREEN",
  //         flattenedOptions,
  //       },
  //       null,
  //       _,
  //     );

  //     expect(selectedValue).toBe("GREEN");
  //   });
  //   it("selectedValue should have a value if defaultValue(Number) is in option", () => {
  //     const selectedValue = derivedProperty.getselectedValue(
  //       {
  //         checkedKeys: 1,
  //         flattenedOptions,
  //       },
  //       null,
  //       _,
  //     );

  //     expect(selectedValue).toBe(1);
  //   });

  //   it("selectedValue should not have a value if defaultValue(string) is not in option ", () => {
  //     const selectedValue = derivedProperty.getselectedValue(
  //       {
  //         value: "YELLOW",
  //         flattenedOptions,
  //       },
  //       null,
  //       _,
  //     );

  //     expect(selectedValue).toBe("");
  //   });
  // });

  describe("#getCheckedLabels", () => {
    it("selectedOptionLabel should have a value if defaultValue(String) is in option", () => {
      const selectedOptionLabel = derivedProperty.getCheckedLabels(
        {
          selectedValue: "GREEN",

          checkedLabels: "GREEN",
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionLabel).toBe("Green");
    });
    it("selectedOptionLabel should have a value if defaultValue(Number) is in option", () => {
      const selectedOptionLabel = derivedProperty.getCheckedLabels(
        {
          selectedValue: 0,

          checkedLabels: 0,
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionLabel).toBe("0");
    });

    it("selectedOptionLabel should not have a value if defaultValue(string) is not in option", () => {
      const selectedOptionLabel = derivedProperty.getCheckedLabels(
        {
          selectedValue: "",

          checkedLabels: "YELLOW",
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionLabel).toBe("");
    });
  });
});
