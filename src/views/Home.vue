<template>
  <div>
    <b-container class="mt-5" v-if="!isLogged">
      <Players/>
    </b-container>

    <b-container fluid class="mt-5" v-if="isLogged">
      <Players/>
    </b-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Players from '@/components/Players.vue'

export default {
  name: 'home',
  components: {
    Players
  },
  computed: {
    isLogged() {
      if (localStorage.token) return true;
      else return false;
    }
  }
}
</script>
