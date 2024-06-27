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
    it("return true when isRequired false and selectedOptionValue is empty string", () => {
      const isValid = derivedProperty.getIsValid(
        {
          isRequired: false,
          selectedOptionValue: "",
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return true when isRequired true and selectedOptionValue is not empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedOptionValue: "GREEN",
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return true when isRequired true and selectedOptionValue is not empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedOptionValue: 0,
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeTruthy();
    });

    it("return false when isRequired true and selectedOptionValue is empty", () => {
      const isValid = derivedProperty.getIsValid(
        {
          selectedOptionValue: "",
          isRequired: true,
        },
        null,
        _,
      );

      expect(isValid).toBeFalsy();
    });
  });

  describe("#getSelectedOptionValue", () => {
    it("selectedOptionValue should have a value if defaultValue(String) is in option", () => {
      const selectedOptionValue = derivedProperty.getSelectedOptionValue(
        {
          checkedKeys: "GREEN",
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionValue).toBe("GREEN");
    });
    it("selectedOptionValue should have a value if defaultValue(Number) is in option", () => {
      const selectedOptionValue = derivedProperty.getSelectedOptionValue(
        {
          checkedKeys: 1,
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionValue).toBe(1);
    });

    it("selectedOptionValue should not have a value if defaultValue(string) is not in option ", () => {
      const selectedOptionValue = derivedProperty.getSelectedOptionValue(
        {
          value: "YELLOW",
          flattenedOptions,
        },
        null,
        _,
      );

      expect(selectedOptionValue).toBe("");
    });
  });

  describe("#getCheckedLabels", () => {
    it("selectedOptionLabel should have a value if defaultValue(String) is in option", () => {
      const selectedOptionLabel = derivedProperty.getCheckedLabels(
        {
          selectedOptionValue: "GREEN",

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
          selectedOptionValue: 0,

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
          selectedOptionValue: "",

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
