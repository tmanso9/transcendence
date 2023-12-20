<script setup lang="ts"></script>
<template>
  <div class="messageWriteBox">
    <v-text-field
      label="Write..."
      color="primary"
      variant="outlined"
    ></v-text-field>
    <v-icon
      icon="mdi-send"
      @click="$emit('scrollMessages')"
      color="primary"
      size="large"
      class="sendMessageButton"
    ></v-icon>
  </div>
</template>
<style scoped lang="scss"></style>
