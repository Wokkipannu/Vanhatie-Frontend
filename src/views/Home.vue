<template>
  <div>
    <Players/>
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
