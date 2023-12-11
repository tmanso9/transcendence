<script setup lang="ts">
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
  <v-col cols="auto">
    <v-dialog transition="dialog-top-transition" width="auto">
      <template v-slot:activator="{ props }">
        <v-icon icon="mdi-cog" size="x-small" v-bind="props"></v-icon>
      </template>
      <template v-slot:default="{ isActive }">
        <v-card class="channelSettingsPopUp">
          <v-toolbar
            color="primary"
            :title="store.selectedChannel + ' - Settings'"
          ></v-toolbar>
          <v-card-text>
            <v-text-field
              label="Change Password"
              placeholder="New"
              variant="outlined"
            ></v-text-field>
            <v-autocomplete
              :items="store.getChannelInfo(store.selectedChannel)?.members"
              label="Blocked"
              color="primary"
              multiple
            ></v-autocomplete>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-col>
</template>
<style scoped lang="scss"></style>
