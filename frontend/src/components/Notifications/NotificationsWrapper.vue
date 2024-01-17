<template>
  <div>
    <v-banner v-for="(alert, i) in alerts" :key="i" stacked
      ><v-banner-text class="text-left"
        >{{ alert.sender }} {{ alert.message }}</v-banner-text
      ><v-spacer />
      <v-banner-actions v-if="alert.action">
        <v-btn color="success" @click="response(alert, 'accept')">accept</v-btn>
        <v-btn color="error" @click="response(alert, 'reject')">reject</v-btn>
      </v-banner-actions>
      <v-banner-actions v-else>
        <v-btn color="info" @click="dismissAlert(alert)">OK</v-btn>
      </v-banner-actions>
    </v-banner>
    <v-banner v-if="!alerts.length"
      ><v-banner-text>No notifications</v-banner-text></v-banner
    >
  </div>
</template>

<script lang="ts" setup>
import { apiURI } from "@/utils";
import { useGameStore } from "@/store/game";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { useRoute, useRouter } from "vue-router";

defineProps(["alerts"]);
const emit = defineEmits(["notificationResolve"]);
const router = useRouter();
const game = useGameStore();
const cookies = inject<VueCookies>("$cookies");

type Alert = {
  id: string;
  senderId: string;
  message: string;
  sender: string;
  action: boolean;
};

const response = (alert: Alert, action: string) => {
  if (alert.message.includes("friend")) {
    respondFriend(alert.senderId, action, alert);
  } else {
    respondGame(alert.id, action, alert);
  }
};

const respondGame = async (id: string, action: string, alert: Alert) => {
  if (action === "accept") {
    game.connectSocket(cookies?.get("access_token"));
    setTimeout(() => {
      game.joinRoom(alert.id);
    }, 200);
  } else {
    rejectGame(alert);
  }
  dismissAlert(alert);
};

const rejectGame = async (alert: Alert) => {
  try {
    const result = await fetch(
      `http://localhost:3000/users/game-reject/${alert.senderId}`,
      {
        method: "post",
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
};

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
