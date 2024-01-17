<template>
  <div>
    <v-banner v-for="(alert, i) in alerts" :key="i" stacked
      ><v-banner-text class="text-left"
        >{{ alert.sender }} {{ alert.message }}</v-banner-text
      ><v-spacer />
      <v-banner-actions v-if="alert.action">
        <v-btn
          color="success"
          @click="respondFriend(alert.senderId, 'accept', alert)"
          >accept</v-btn
        >
        <v-btn
          color="error"
          @click="respondFriend(alert.senderId, 'reject', alert)"
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
import { apiURI } from "@/utils";
import { useRouter } from "vue-router";

defineProps(["alerts"]);
const emit = defineEmits(["notificationResolve"]);
const router = useRouter();

type Alert = {
  id: string;
  senderId: string;
  message: string;
  sender: string;
  action: boolean;
};

console.log();
const respondFriend = async (id: string, action: string, alert: Alert) => {
  try {
    const result = await fetch(
      `${apiURI}/users/friend-response/${id}/${action}`,
      {
        method: "post",
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
    await dismissAlert(alert);
    router.go(0);
  } catch (error) {
    if (error instanceof Error) console.error(error);
  }
};

const dismissAlert = async (alert: Alert) => {
  const { id } = alert;
  try {
    const result = await fetch(
      `${apiURI}/users/dismiss-alert/alert?id=${id}`,
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
