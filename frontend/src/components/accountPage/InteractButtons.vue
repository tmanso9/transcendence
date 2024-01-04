<template>
  <div
    v-if="!isSelf"
    class="d-flex flex-column flex-sm-row justify-space-evenly mx-auto my-10 account__header__buttons"
    :width="mdAndUp ? '80%' : '100%'"
  >
    <v-btn
      v-for="button in headerButtons"
      :key="button.text"
      :width="buttonSize"
      class="mx-auto my-2 my-sm-0 account__header__buttons__button py-3 d-flex align-center"
      :color="button.color"
	  @click="button.action"
    >
      <v-icon>{{ button.icon }}</v-icon>
      <span class="ml-2">{{ button.text }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps(["account", "isSelf"]);
const { sm, mdAndUp } = useDisplay();

const addFriend = async () => {
	// console.log(props.account)
	try {
		console.log('oi')
		const url = `http://localhost:3000/users/friend-request/${props.account.id}`
		const result = await fetch(url, {
			method: 'post',
			credentials: 'include'
		})
		if (!result.ok) throw new Error(await result.text())
		const data = await result.text()
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}
}

const headerButtons = [
  { text: "Chat", icon: "mdi-chat-outline", action: addFriend },
  { text: "Add friend", icon: "mdi-account-plus-outline", action: addFriend },
  { text: "Play pong", icon: "mdi-sword-cross", color: "deep-purple-darken-3", action: addFriend },
];

const buttonSize = computed(() => {
  return sm.value || mdAndUp.value ? "145px" : "75%";
});

</script>
