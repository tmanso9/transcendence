<template>
  <div>
    <v-banner v-for="(alert, i) in alerts" :key="i" lines="one"
      ><v-banner-text class="text-left"
        >{{ alert.sender }} {{ alert.message }}</v-banner-text
      ><v-spacer /><v-banner-actions>
        <v-btn color="success" @click="acceptFriend(alert.id, 'accept')">accept</v-btn>
        <v-btn color="error">reject</v-btn>
      </v-banner-actions>
    </v-banner>
    <v-banner v-if="!alerts.length"
      ><v-banner-text>No notifications</v-banner-text></v-banner
    >
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

defineProps(["alerts"]);
const emit = defineEmits(["notificationResolve"])
const router = useRouter();

console.log();
const acceptFriend = async (id: string, action: string) => {
	console.log(id)
	try {
		const result = await fetch(`http://localhost:3000/users/friend-response/${id}/${action}`, {
			method: 'post',
			credentials: 'include'
		})
		if (!result.ok) throw new Error(await result.text())
		router.go(0)
		// emit("notificationResolve")
	} catch (error) {
		
	}
}
</script>
