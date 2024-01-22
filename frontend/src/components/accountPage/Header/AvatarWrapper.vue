<template>
  <div class="avatar d-flex flex-column align-center">
    <div
      class="avatar__image d-flex align-start mx-auto"
      :class="editAvatar && mdAndUp ? 'avatar__image__change' : ''"
    >
      <v-avatar
        :size="imageHeight"
        class="avatar__image__component"
        :class="editAvatar && mdAndUp ? 'avatar__image__component__change' : ''"
      >
        <v-img
          :src="avatar"
          @error="avatar = defaultPicture"
          alt="user profile picture"
          cover
          :class="editAvatar ? 'gradient' : ''"
        />
      </v-avatar>
      <change-profile-picture v-if="editAvatar && mdAndUp" source="avatar" />
    </div>
    <v-tooltip
      location="right"
      text="Change avatar"
      content-class="avatar__tooltip"
      :attach="true"
      v-if="isSelf"
    >
      <template v-slot:activator="{ props }">
        <v-icon
          class="my-n2"
          :class="editAvatar && mdAndUp ? 'avatar__edit__on' : 'avatar__edit'"
          v-bind="props"
          @click="$emit('edit')"
          :color="editAvatar ? 'error' : ''"
        >
          mdi-camera-flip-outline
        </v-icon>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import ChangeProfilePicture from "./ChangeProfilePicture.vue";
import { ref, onMounted } from "vue";
import { useDisplay } from "vuetify";
const avatar = ref("");
const props = defineProps(["account", "editAvatar", "isSelf"]);
defineEmits(["edit"]);

const { smAndUp, mdAndUp } = useDisplay();

const defaultPicture =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

onMounted(() => {
  avatar.value = props.account.avatar || defaultPicture;
});

const imageHeight = computed(() => {
  return smAndUp.value ? "150px" : "120px";
});
</script>

<style scoped lang="scss">
.avatar {
  &__image {
    &__change {
      width: 350px;
    }
    &__component {
      display: block;
      margin: 0 auto 20px;
      &__change {
        margin-left: -50px;
      }
    }
  }
  &__edit__on {
    margin-right: 140px;
  }
}
.avatar__tooltip {
  padding: 2px 10px !important;
}

.gradient::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
}
</style>
