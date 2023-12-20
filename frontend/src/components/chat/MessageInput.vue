<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs";

const { height } = useDisplay();
</script>
<template>
  <div class="messageWriteBox">
    <v-text-field
      label="Write..."
      color="primary"
      variant="outlined"
      size="x-small"
      clearable
    >
      <template v-slot:append-inner><v-icon></v-icon></template>
    </v-text-field>
    <v-icon
      icon="mdi-send"
      @click="$emit('scrollMessages')"
      color="primary"
      :size="height > 700 ? 'large' : 'medium'"
      class="sendMessageButton"
    ></v-icon>
  </div>
</template>
<style scoped lang="scss"></style>
