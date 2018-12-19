<template>
  <form id="change-password" v-on:submit.prevent="changePassword">
    <h2>Change Password</h2>
    <input required v-model='password' type='password' name='password' autocomplete="new-password" placeholder="New Password">
    <button type='submit' value='Change Password'>Change Password</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "ChangePassword",

  data() {
    return {
      password: ""
    }
  },

  methods: {
    changePassword: function() {
      const bodyContent = { password: this.password };
        axios
          .put("/api/users/", bodyContent)
          .then(() => {
            eventBus.$emit('new-message', {text: 'Changed password successfully.', type: 'success'});
          })
          .catch(err => {
            eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
          })
          .then(() => {
            this.resetForm();
          });
    },

    resetForm: function() {
      this.password = ""
    }
  }
}
</script>

<style scoped>
form {
  margin-bottom: 25px;
}
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
  background-color: var(--primary);
  width: 100%;
  color: white;
  margin-top: 0;
}
</style>