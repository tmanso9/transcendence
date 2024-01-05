<template>
  <div>
    <v-banner v-for="(alert, i) in alerts" :key="i" stacked
      ><v-banner-text class="text-left"
        >{{ alert.sender }} {{ alert.message }}</v-banner-text
      ><v-spacer />
      <v-banner-actions v-if="alert.action">
        <v-btn color="success" @click="respondFriend(alert.id, 'accept')"
          >accept</v-btn
        >
        <v-btn color="error" @click="respondFriend(alert.id, 'reject')"
          >reject</v-btn
        >
      </v-banner-actions>
      <v-banner-actions v-else>
        <v-btn color="info" @click="dismissAlert(alert)">dismiss</v-btn>
      </v-banner-actions>
    </v-banner>
    <v-banner v-if="!alerts.length"
      ><v-banner-text>No notifications</v-banner-text></v-banner
    >
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

defineProps(["alerts"]);
const emit = defineEmits(["notificationResolve"]);
const router = useRouter();

type Alert = {
  id: string;
  message: string;
  sender: string;
  action: boolean;
};

console.log();
const respondFriend = async (id: string, action: string) => {
  console.log(id);
  try {
    const result = await fetch(
      `http://localhost:3000/users/friend-response/${id}/${action}`,
      {
        method: "post",
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
    router.go(0);
  } catch (error) {
    if (error instanceof Error) console.error(error);
  }
};

const dismissAlert = async (alert: Alert) => {
  const { id, message, sender, action } = alert;
  try {
    const result = await fetch(
      `http://localhost:3000/users/dismiss-alert/alert?id=${id}&message=${message}&sender=${sender}&action=${action}`,
      {
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
    emit("notificationResolve");
  } catch (error) {
    if (error instanceof Error) console.error(error);
  }
};
</script>
