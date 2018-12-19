<template>
  <form id="sign-in" v-on:submit.prevent="signIn">
    <input required v-model.trim='username' type='text' name='username' autocomplete="username" placeholder="Username">
    <input required v-model='password' type='password' name='password' autocomplete="current-password" placeholder="Password">
    <button type='submit' value='Sign In'>Sign In</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "SignIn",

  data() {
    return {
      username: '',
      password: ''
    }
  },

  methods: {
    signIn: function() {
        axios
          .post("/api/users/signin", { username: this.username, password: this.password })
          .then(() => {
            eventBus.$emit('check-login');
            eventBus.$emit('clear-messages');
          })
          .catch(err => {
            eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
            this.resetForm();
          });
    },

    resetForm: function() {
      this.username = "";
      this.password = "";
    }
  }
}
</script>

<style scoped>
input {
  width: 250px;
  font-size: 0.9em;
  padding: 9px 9px;
  border: none;
  border-radius: 3px;
  margin: 10px 0;
  display: block;
}
button, button:hover {
  background-color: var(--success);
  width: 100%;
  color: white;
}
</style>