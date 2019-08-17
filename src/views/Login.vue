<template>
  <b-container class="mt-5">
    <LoginForm/>
  </b-container>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'

export default {
  name: 'login',
  components: {
    LoginForm
  }
}
</script>