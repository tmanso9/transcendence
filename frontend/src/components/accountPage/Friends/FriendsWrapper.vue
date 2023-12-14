<template>
  <v-expansion-panel title="Friends">
    <v-expansion-panel-text class="friends">
      <div class="friends d-flex">
        <v-card
          v-for="(friend, i) in friends"
          :key="i"
          class="ma-2 w-25 d-flex flex-column flex-sm-row align-center friends__card"
          :height="smAndUp ? '60px' : '75%'"
          target="_"
          :href="`/users/${friend.username}`"
        >
          <v-avatar size="45px" class="mx-2">
            <v-img :src="friend.avatar" alt="friend avatar" cover />
          </v-avatar>
          {{ friend.username }}
        </v-card>
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { useDisplay } from "vuetify";
const props = defineProps(["user"]);
const { smAndUp } = useDisplay();

const friends = props.user?.friends || [];
</script>

<style lang="scss">
.friends {
  &__card {
    max-width: 200px !important;
    min-width: fit-content !important;
    background-color: rgb(var(--v-theme-code));
  }
}
</style>
