<template>
  <div id="messages">
    <p
      v-for="message in messageList"
      v-bind:key="message.key"
      v-bind:class="{ 
        'error-message': message.type == 'error',
        'success-message': message.type == 'success' }">
      {{ message.text }}
      <i class="fas fa-times close-button" v-on:click="clearMessage(message.key)"></i>
    </p>
  </div>
</template>

<script>
import { eventBus } from "../main";

export default {
  name: "Messages",

  data() {
    return {
      messageList: [],
      index: 0,
    }
  },

  created: function() {
    eventBus.$on("new-message", message => {
      message.key = this.index;
      this.messageList.push(message);
      this.index++;
    });
    eventBus.$on("clear-messages", () => {
      this.messageList = [];
    });
  },

  methods: {
    clearMessage: function(key) {
      this.messageList = this.messageList.filter(message => message.key != key);
    }
  }
}
</script>

<style scoped>
p {
  text-align: center;
  margin: 20px auto;
  padding: 10px;
  border-radius: 2px;
  position: relative;
}

.success-message {
  background-color: #EAFAF6;
  border: 1px solid var(--success);
}

.error-message {
  background-color: #FFF0F0;
  border: 1px solid var(--error);
} 

.close-button {
  cursor: hand;
  cursor: pointer;
  font-size: 0.8em;
  opacity: 0.8;
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>