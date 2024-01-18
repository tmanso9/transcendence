<script setup lang="ts">
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CreateChannel from "./CreateChannel.vue";
import { chatAppStore } from "@/store/chat";
import { User } from "../../store/chat";

const { height } = useDisplay();

const password = ref("");

const store = chatAppStore();
</script>
<template>
  <div class="chatBar">
    <div class="chatTopBar">
      <h3>Chat</h3>
      <v-icon
        v-if="!store.createChannelPopUp"
        @click="
          () => {
            store.createChannelPopUp = true;
          }
        "
        icon="mdi-chat-plus"
        :size="height > 700 ? 'large' : 'medium'"
      ></v-icon>
    </div>
    <div class="chatConversations">
      <v-virtual-scroll
        v-if="store.currentUser && store.currentUser?.channels?.length != 0"
        :items="store.currentUser.channels"
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item
            :key="item.id"
            @click="store.selectChannel(item.id)"
            class="contactElement"
          >
            <template v-slot:prepend>
              <v-icon
                :icon="item.avatar"
                :size="height > 700 ? 'small' : 'x-small'"
              ></v-icon>
            </template>
            <template v-slot:append>
              <v-chip
                v-if="item.unreadMsgs"
                :size="height > 700 ? 'small' : 'x-small'"
                color="purple"
                >{{ item.unreadMsgs }}</v-chip
              >
            </template>
            <v-list-item-title v-text="item.channelName"></v-list-item-title>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      <v-virtual-scroll
        v-else
        :items="['No Conversations']"
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }"
          ><div class="contactsScroller-noChatsMessage">
            {{ item }}
          </div></template
        >
      </v-virtual-scroll>
    </div>
    <div class="chatTopBar">
      <h4>Public Channels</h4>
    </div>
    <div class="chatConversations">
      <v-virtual-scroll
        v-if="store.publicChannelsUserIsNotIn?.length != 0"
        :items="store.publicChannelsUserIsNotIn"
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item :key="item.id" class="contactElement">
            <div class="contactElement-publicChan">
              <div class="contactElement-publicChan-pofile">
                <v-icon
                  :icon="item.avatar"
                  class="contactElement-publicChan-pofile-avatar"
                  :size="height > 700 ? 'small' : 'x-small'"
                ></v-icon>
                <v-list-item-title
                  v-text="item.channelName"
                ></v-list-item-title>
              </div>
              <v-dialog width="500" class="included">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-if="item.password != ''"
                    v-bind="props"
                    append-icon="mdi-lock"
                    :size="height > 700 ? 'small' : 'x-small'"
                    >Join</v-btn
                  >
                </template>

                <template v-slot:default="{ isActive }">
                  <v-card>
                    <v-card-title>{{ item.channelName }}</v-card-title>
                    <v-card-text
                      ><v-text-field
                        v-model="password"
                        label="Pasword*"
                        required
                      ></v-text-field
                    ></v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        text="Cancel"
                        @click="isActive.value = false"
                      ></v-btn>
                      <v-btn
                        variant="text"
                        @click="
                          () => {
                            store.joinChannel(item.id, password);
                          }
                        "
                      >
                        Join Channel
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
              <v-btn
                v-if="item.type == 'personal'"
                :size="height > 700 ? 'small' : 'x-small'"
                @click="
                  async () => {
                    const friend = store.currentUser?.friends.find(
                      (friend: User) => {
                        if (friend.username == item.channelName) return true;
                        return false;
                      },
                    );
                    if (friend) {
                      store.createChannel('personal', '', '', [friend]);
                    }
                  }
                "
                >Talk</v-btn
              >
              <v-btn
                v-else-if="item.password == ''"
                :size="height > 700 ? 'small' : 'x-small'"
                @click="
                  () => {
                    store.joinChannel(item.id, '');
                  }
                "
                >Join</v-btn
              >
            </div>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      <v-virtual-scroll
        v-else
        :items="['No Conversations']"
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }"
          ><div class="contactsScroller-noChatsMessage">
            {{ item }}
          </div></template
        >
      </v-virtual-scroll>
    </div>
    <create-channel v-if="store.createChannelPopUp"></create-channel>
  </div>
</template>
<style scoped lang="scss"></style>
