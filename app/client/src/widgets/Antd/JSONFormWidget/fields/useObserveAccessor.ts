import { useContext, useEffect, useRef } from "react";

import FormContext from "../FormContext";

type UseUpdateAccessorProps = {
  accessor: string;
};

/**
 * This hook observes changes in the accessor and triggers a re-computation
 * of the formData values.
 */

function useUpdateAccessor({ accessor }: UseUpdateAccessorProps) {
  const accessorRef = useRef(accessor);
  const { formRef, updateFormData } = useContext(FormContext);

  useEffect(() => {
    console.log("useUpdateAccessor", {
      accessor,
      accessorRef: accessorRef.current,
    });

    if (accessorRef.current !== accessor) {
      // accessorRef.current = accessor;
      // formRef?.current?.setFieldValue(
      //   accessor,
      //   formRef?.current?.getFieldValue(accessor),
      // );
    }
  }, [accessor]);
}

export default useUpdateAccessor;
