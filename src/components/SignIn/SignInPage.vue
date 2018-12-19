<template>
  <div id="sign-in-page">
    <div class="tab-buttons">
      <button v-bind:class="{ active: showSignUp }" v-on:click="setShowSignUp(true)">Sign Up</button>
      <button v-bind:class="{ active: !showSignUp }" v-on:click="setShowSignUp(false)">Sign In</button>
    </div>
    <SignUp v-if="showSignUp"/>
    <SignIn v-else/>
  </div>
</template>

<script>
import SignUp from "./SignUp.vue";
import SignIn from "./SignIn.vue";

export default {
  name: "SignInPage",

  components: {
    SignUp,
    SignIn,
  },

  data() {
    return {
      showSignUp: false,
    };
  },

  methods: {
    setShowSignUp: function(value) {
      this.showSignUp = value
    },
  }
};
</script>

<style scoped>
#sign-in-page {
  margin: 0 auto;
  width: fit-content;
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
}

.tab-buttons button.active {
  background-color: rgba(110,110,110);
  color: white;
}
</style>