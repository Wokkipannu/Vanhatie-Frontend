<template>
  <b-container class="mt-5">
    <Players/>
  </b-container>
</template>

<script>
// @ is an alias to /src
import Players from '@/components/Players.vue'

export default {
  name: 'home',
  components: {
    Players
  }
}
</script>
