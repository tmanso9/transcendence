<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs";

const { height } = useDisplay();
</script>
<template>
  <div class="messageWriteBox">
    <v-text-field
      label="Write..."
      color="secondary"
      variant="outlined"
      clearable
    >
      <template v-slot:append-inner
        ><v-icon icon="mdi-send" @click="$emit('scrollMessages')"> </v-icon
      ></template>
    </v-text-field>
  </div>
</template>
<style scoped lang="scss"></style>
