<script setup lang="ts">
import { ref } from "vue";
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();

const dialog = ref(false);
</script>
<template>
  <v-row justify="end">
    <v-dialog v-model="dialog" persistent width="1024">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-chat-plus"
          color="primary"
          v-bind="props"
          size="small"
        ></v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Create Channel</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Channel Name*"
                  color="primary"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Avatar (Optional)"
                  color="primary"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Password (Optional)"
                  type="password"
                  color="primary"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="['Public', 'Private']"
                  label="Type*"
                  color="primary"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  :items="store.friends"
                  label="Members"
									color="primary"
                  multiple
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
            Close
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<style scoped lang="scss"></style>
