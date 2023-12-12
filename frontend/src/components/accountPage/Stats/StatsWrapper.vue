<template>
  <div>
    <h2>Stats</h2>
    <div class="d-flex flex-column w-50">
      <v-card
        width="100%"
        height="60px"
        class="d-flex flex-column align-center justify-center ml-2"
      >
        <v-card-title class="text-overline mb-n5">Rank</v-card-title>
        <v-card-item class="text-body-2">{{ ranking }}</v-card-item>
      </v-card>
      <div class="friends d-flex justify-space-between ml-2 mr-n2">
        <v-card
          v-for="(stat, i) in stats"
          :key="i"
          width="30%"
          class="my-2 text-center"
          height="60px"
        >
          <v-card-title class="text-overline mb-n5 mt-n2">{{ stat.name }}</v-card-title>
          <v-card-item>{{ stat.value }}</v-card-item>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps(["stats", "ranking"]);
</script>
