<template>
  <v-expansion-panel title="Stats" @click="handleClick">
    <v-expansion-panel-text>
      <div class="d-flex flex-column w-50">
        <div
          class="friends d-flex justify-space-between flex-wrap flex-sm-nowrap ml-2 mr-n2"
        >
          <v-card
            v-for="(stat, i) in stats"
            :key="i"
            width="30%"
            class="my-2 mx-2 text-center stats__card"
            height="60px"
          >
            <v-card-title class="text-overline text-deep-purple mb-n5 mt-n2">{{
              stat.key
            }}</v-card-title>
            <v-card-item>{{ stat.value }}</v-card-item>
          </v-card>
        </div>
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { apiURI } from "@/utils";

type Stat = {
  key: string;
  value: string;
};

enum desirableStats {
  wins,
  losses,
  points,
  win_ratio,
  streak,
}
const props = defineProps(["account"]);
const stats = ref<Stat[]>([]);

const fetchData = async () => {
  try {
    const result = await fetch(
      `${apiURI}/users/gamestats/${props.account.username}`,
      {
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    stats.value.length = 0;
    for (let key in data) {
      if (Object.values(desirableStats).includes(key) && data[key] !== null) {
        let value = data[key];
        switch (key) {
          case "win_ratio":
            key = "win ratio";
            value = `${(value * 100).toFixed(0)}%`;
            break;
          case "streak":
            key = "win streak";
        }
        stats.value.push({ key, value });
      }
    }
  } catch (error) {
    error instanceof Error && console.error(error.message);
  }
};

const handleClick = (event: any) => {
  if (
    !event.srcElement.offsetParent.classList.contains(
      "v-expansion-panel-title--active",
    )
  )
    return;

  fetchData();
};

onMounted(() => fetchData);
</script>
