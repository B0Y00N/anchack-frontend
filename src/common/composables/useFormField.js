// react-hook-form 없이 동작하는 간단한 폼 컨텍스트.
// 실전에서 스키마 검증 등이 필요하면 VeeValidate 도입을 권장합니다.
import { inject, computed } from "vue";

export function useFormField() {
  const field = inject("formField", { name: "", error: computed(() => null) });
  const item = inject("formItem", { id: "field" });

  return {
    id: item.id,
    name: field.name,
    formItemId: `${item.id}-form-item`,
    formDescriptionId: `${item.id}-form-item-description`,
    formMessageId: `${item.id}-form-item-message`,
    error: field.error,
  };
}
