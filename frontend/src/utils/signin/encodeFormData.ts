import { Ref } from "vue";

export const encodeFormData = (values: Ref<string>[], propertyNames: string[]) => {
  const formData: String[] = [];
  values.forEach((value, index) => {
    formData.push(
      encodeURIComponent(propertyNames[index]) +
        "=" +
        encodeURIComponent(value.value)
    );
  });

  return formData.join("&");
};
