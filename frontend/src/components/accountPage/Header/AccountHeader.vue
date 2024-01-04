<template>
  <div class="account__header d-flex flex-column align-center mx-auto">
    <div
      class="account__header__name-and-avatar d-flex align-center justify-space-around w-100 mx-auto"
    >
      <div
        class="account__header__name-and-avatar__name d-flex flex-column align-center mt-n2"
      >
        <h2
          class="text-center text-h5 text-sm-h4 mb-1 text-deep-purple-lighten-3"
        >
          {{ account.username }}
        </h2>
        <v-badge
          class="mb-4 mt-n2"
          :dot="true"
          location="start center"
          offset-x="-13"
          :color="mapColor"
        >
          <p class="text-subtitle-1 text-sm-h6">{{ account.status }}</p>
        </v-badge>
        <p class="text-overline text-sm-button text-deep-purple-lighten-3">
          Rank: <span class="text-white">{{ account.rank }}</span>
        </p>
      </div>
      <v-divider vertical class=""></v-divider>
      <avatar-wrapper
        :account="account"
        :editAvatar="editAvatar"
        @edit="toggleEditAvatar"
        :isSelf="isSelf"
      />
    </div>
    <div class="acount__header__change-avatar w-100 mt-4">
      <change-profile-picture v-if="editAvatar && !mdAndUp" source="header" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";
import AvatarWrapper from "./AvatarWrapper.vue";
import ChangeProfilePicture from "./ChangeProfilePicture.vue";

const props = defineProps(["account", "isSelf"]);
const { sm, mdAndUp } = useDisplay();
const editAvatar = ref(false);

const mapColor = computed(() => {
  switch (props.account.status) {
    case "ONLINE":
      return "success";
    case "OFFLINE":
      return "gray";
    default:
      return "deep-purple";
  }
});

const toggleEditAvatar = () => {
  editAvatar.value = !editAvatar.value;
};
</script>
