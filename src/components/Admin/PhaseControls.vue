<template>
  <div id="phase-controls">
    <h2>Phase</h2>
    <p>Current Phase: {{ formatPhase }}</p>
    <div v-if="inSignupPhase">
      <button v-on:click="showConfirm = true">Advance Phase</button>
      <div v-if="showConfirm" class="confirm">
        <span>Are you sure?</span>
        <span class="yes" v-on:click="advancePhase">yes</span>
        <span class="no" v-on:click="showConfirm = false">no</span>
      </div>
    </div>
    <div v-else>
      <button disabled>Advance Phase</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "PhaseControls",

  props: {
    group: Object,
  },

  data() {
    return {
      showConfirm: false, 
    }
  },

  computed: {
    inSignupPhase: function () {
      return this.group.inSignupPhase
    },
    formatPhase: function () {
      return this.inSignupPhase ? 'Sign Up Phase' : 'Sign Ups Done'
    },
  },

  methods: {
    advancePhase: function() {
      const groupID = this.group.groupID;
      axios
        .get(`/api/groups/${groupID}/assignment`)
        .then((response) => {
          eventBus.$emit('reload-admin');
      });
    }
  }
}
</script>
<style scoped>
#phase-controls {
  margin-top: 25px;
}
button, button:hover {
  background-color: var(--success);
  width: 250px;
  color: white;
}
button:disabled {
  background-color: lightgray;
}
.confirm {
  font-size: 0.8em;
  text-align: right;
}
.yes, .no {
  margin-left: 5px;
  cursor: hand;
  cursor: pointer;
  font-weight: 700;
}
.yes {
  color: var(--success);
}
</style>
