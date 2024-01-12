<template>
  <v-expansion-panel title="Stats">
    <v-expansion-panel-text>
      <div class="d-flex flex-column w-50">
        <div class="friends d-flex justify-space-between ml-2 mr-n2">
          <v-card
            v-for="(stat, i) in stats"
            :key="i"
            width="30%"
            class="my-2 text-center friends__card"
            height="60px"
          >
            <v-card-title class="text-overline mb-n5 mt-n2">{{
              stat.name
            }}</v-card-title>
            <v-card-item>{{ stat.value }}</v-card-item>
          </v-card>
        </div>
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
defineProps(["stats", "rank"]);
</script>
