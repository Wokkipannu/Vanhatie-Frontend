<template>
  <b-container class="mt-5">
    <UsersTable/>
  </b-container>
</template>

<script>
import UsersTable from '@/components/UsersTable.vue'

export default {
  name: 'users',
  components: {
    UsersTable
  }
}
</script>