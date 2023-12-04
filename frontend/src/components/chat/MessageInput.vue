<script setup lang="ts">
defineEmits(["scrollMessages"]);
</script>
<template>
  <div class="messageWriteBox">
    <v-text-field label="Write..."></v-text-field>
    <v-btn
      icon="mdi-send"
      class="sendMessageButton"
      @click="$emit('scrollMessages')"
    ></v-btn>
  </div>
</template>
<style scoped lang="scss"></style>
