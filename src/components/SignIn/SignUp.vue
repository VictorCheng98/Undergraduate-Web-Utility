<template>
  <form id="sign-up" v-on:submit.prevent="signUp">
    <input required v-model.trim='username' type='text' name='username' autocomplete="username" placeholder="Username">
    <input required v-model='password' type='password' name='password' autocomplete="new-password" placeholder="Password">
    <button type='submit' value='Sign Up'>Sign Up</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "SignUp",

  data() {
    return {
      username: "",
      password: ""
    }
  },

  methods: {
    signUp: function() {
      const bodyContent = { username: this.username, password: this.password };
        axios
          .post("/api/users/", bodyContent)
          .then(() => {
            return axios.post("/api/users/signin", bodyContent);
          })
          .then(() => {
            eventBus.$emit('check-login');
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