<script setup lang="ts"></script>
<template>
  <div class="messageWriteBox">
    <v-text-field label="Write..." color="primary"></v-text-field>
    <v-btn
      icon="mdi-send"
      class="sendMessageButton"
      @click="$emit('scrollMessages')"
      color="primary"
    ></v-btn>
  </div>
</template>
<style scoped lang="scss"></style>
