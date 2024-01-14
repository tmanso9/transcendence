<template>
  <v-expansion-panel title="Match history">
    <v-expansion-panel-text width="50%">
      <v-data-table
        :hide-headers="true"
        :headers="headers"
        :items="parsedMatches()"
        item-key="id"
        pagination.sync="pagination"
        select-all
        :loading="loadingData"
        :cell-props="getCellProps"
        class="match-history"
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

type ReadOnlyHeaders = VDataTable["headers"];
const headers: ReadOnlyHeaders = [
  { title: "firstUser", align: "start", key: "firstUser" },
  { title: "result", align: "start", key: "result" },
  { title: "seconduser", align: "start", key: "secondUser" },
  { title: "result", align: "start", key: "outcome" },
  { title: "date", align: "start", key: "date" },
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
  firstUser: string;
  secondUser: string;
  result: string;
  outcome: string;
  date: string;
};

const parsedMatches = (): ParsedMatch[] => {
  return (
    items.value?.map((val: any) => {
      console.log(val);
      const result =
        val.outcome === "win" ? `10 - ${val.points}` : `${val.points} - 10`;
      return {
        firstUser: "touteiro",
        secondUser: val.username,
        result,
        outcome: val.outcome,
        date: val.date,
      };
    }) || []
  );
};

const getHistory = async () => {
  try {
    const result = await fetch("/mock-data/games.json");
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    items.value = data;
    loadingData.value = false;
    console.log(items.value);
  } catch (error) {
    error instanceof Error && console.error(error.message);
  }
};

const getCellProps = (item: any) => {
  console.log(item);
  return item.value === "win"
    ? { class: "win-item" }
    : item.value === "loss"
      ? { class: "loss-item" }
      : {};
  // return 'text-green'
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
