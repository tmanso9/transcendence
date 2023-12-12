<template>
  <div class="avatar mx-auto d-flex flex-column align-center">
    <div class="avatar__image d-flex align-start mx-auto">
		<v-avatar size="150px" class="avatar__image__component">
			<v-img
			:src="avatar"
			@error="avatar = defaultPicture"
			alt="user profile picture"
			cover
			/>
		</v-avatar>
		<change-profile-picture v-if="editAvatar" />
    </div>
    <v-tooltip
      location="right"
      text="Change avatar"
      content-class="avatar__tooltip"
      :attach="true"
    >
      <template v-slot:activator="{ props }">
        <v-icon class="my-n2" v-bind="props" @click="editAvatar = !editAvatar">
          mdi-camera-flip-outline
        </v-icon>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
import ChangeProfilePicture from "./ChangeProfilePicture.vue";
import { ref, onMounted } from "vue";
const avatar = ref("");
const editAvatar = ref(false);
const props = defineProps(["user"]);

const defaultPicture =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

onMounted(() => {
  console.log(props.user);
  avatar.value = props.user.avatar || defaultPicture;
});
</script>

<style scoped lang="scss">
.avatar {
  &__image {
    width: 450px;
    &__component {
      display: block;
      margin: 0 auto 20px;
    }
  }
}
.avatar__tooltip {
  padding: 2px 10px !important;
  //   background-color: inherit !important;
  //   color: var(--v-primary) !important;
  //   margin-left: -25px;
  //   font-size: .75rem;
}
</style>
