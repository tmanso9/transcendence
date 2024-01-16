<template>
  <v-expansion-panel title="Match history" @click="handleClick">
    <v-expansion-panel-text width="50%">
      <v-data-table
        :hide-headers="true"
        :headers="headers"
        :items="parsedMatches()"
        item-key="id"
        :loading="loadingData"
        :cell-props="getCellProps"
        class="match-history"
        :items-per-page="5"
      >
      </v-data-table>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
<!-- search="search" -->

<script lang="ts" setup>
import { onMounted } from "vue";
import { ref } from "vue";
import type { VDataTable } from "vuetify/components";

const props = defineProps(["account"]);

type ReadOnlyHeaders = VDataTable["headers"];
const headers: ReadOnlyHeaders = [
  { title: "firstUser", align: "center", key: "firstUser" },
  { title: "result", align: "center", key: "result" },
  { title: "seconduser", align: "center", key: "secondUser" },
  { title: "day", align: "center", key: "day" },
  { title: "winner", align: "center", key: "winnerUsername" },
  { title: "time", align: "center", key: "time" },
];

const items = ref<string[]>();
const loadingData = ref(true);

onMounted(() => {
  getHistory();
});

type Match = {
  username: string;
  points: number;
};

type ParsedMatch = {
  winnerUsername: string;
  loserUsername: string;
  firstUser: string;
  secondUser: string;
  result: string;
  day: string;
  time: string;
};

const parsedMatches = (): ParsedMatch[] => {
  return (
    items.value?.map((val: any) => {
      console.log(val);
      const accountIsWinner = val.winnerUsername === props.account.username;
      const result = accountIsWinner
        ? `10 - ${val.loserScore}`
        : `${val.loserScore} - 10`;
      const secondUser = accountIsWinner
        ? val.loserUsername
        : val.winnerUsername;
      const [day, time] = val.playedAt.split("T");
      return {
        firstUser: props.account.username,
        secondUser,
        winnerUsername: val.winnerUsername,
        loserUsername: val.loserUsername,
        result,
        day,
        time: time.split(".")[0],
      };
    }) || []
  );
};

const getHistory = async () => {
  try {
    const result = await fetch(
      `http://localhost:3000/game-backend/games/${props.account.id}`,
    );
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    items.value = data;
    loadingData.value = false;
    console.log(items.value);
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

  getHistory();
};

const getCellProps = (item: any) => {
  if (item.column.key !== "winnerUsername") return;
  // console.log(item);
  return item.value === props.account.username
    ? { class: "win-item" }
    : { class: "loss-item" };
};
</script>

<style lang="scss">
.row-green {
  background-color: green;
}

.match-history {
  & th {
    display: none;
  }
  & tr {
    & td:first-child {
      border-radius: 10px 0 0 10px;
    }
    & td:last-child {
      border-radius: 0 10px 10px 0;
    }
    & td.win-item,
    & td.loss-item {
      display: none;
    }
  }
  & tr:has(.win-item) {
    background-color: rgba(0, 128, 0, 0.5);
  }
  & tr:has(.loss-item) {
    background-color: rgba(128, 0, 0, 0.5);
  }
}
</style>
