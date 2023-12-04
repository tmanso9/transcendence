<script setup lang="ts">
const props = defineProps({
  updateScroll: () => {},
});
</script>
<template>
  <div class="messageWriteBox">
    <v-text-field label="Write..."></v-text-field>
    <v-btn
      icon="mdi-send"
      class="sendMessageButton"
      @click="
        () => {
          updateScroll('scrollMessages');
        }
      "
    ></v-btn>
  </div>
</template>
<style scoped lang="scss"></style>
