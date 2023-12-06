import { Ref } from "vue";

const encodeFormData = (values: Ref<string>[], propertyNames: string[]) => {
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

export default encodeFormData