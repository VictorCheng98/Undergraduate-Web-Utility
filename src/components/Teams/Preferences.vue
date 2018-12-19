<template>
  <div class="preferences-container right-toggle-parent">
    <div class="right-toggle" v-on:click="toggleShowOptions">{{ showOptions ? 'Hide' : 'Show' }}</div>
    <div v-if="showSubmittedMessage">These preferences have already been submitted. Click show to edit.</div>
    <div class="preferences" v-if="showOptions">
      <draggable v-model="options" @start="drag=true" @end="drag=false">
        <div v-for="(element, index) in options" :key="element" class="pref-item">
          <span class="pref-rank">{{index+1}}</span>
          <div class="pref-name">
            {{element}}
            <i class="fas fa-bars"></i>
          </div>
        </div>
      </draggable>
      <button type='submit' value='Submit Preferences' v-on:click="submitPreferences">Submit</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";
import draggable from 'vuedraggable'

export default {
  name: "Preferences",

  props: {
    user: Object,
    group: Object,
    team: Object,
  },

  components: {
    draggable,
  },

  data() {
    return {
      options: [],
      isTeamPrefs: true,
      showSubmittedMessage: false,
      showOptions: true,
    };
  },

  created: function() {
    this.loadPreferences();
    eventBus.$on("reload-preferences", () => {
      this.loadPreferences();
    });
  },

  methods: {
    loadPreferences: function() {
      if (this.team) {
        this.getMembers();
        this.isTeamPrefs = false;
      } else if (this.group) {
        this.getTeams();
      } else {
        eventBus.$emit('new-message', {text: "Cannot display preferences.", type: 'error'});
      }
    },
    submitPreferences: function() {
    
      if (this.isTeamPrefs) {
        const route = `/api/users/${this.group.groupID}/preferences`;
        eventBus.$emit('reload-preferences');
        axios
        .post(route, {groupID: this.group.groupID, preferences: this.options})
        .then(() => {
          eventBus.$emit('new-message', {text: 'User preferences submitted successfully.', type: 'success'});
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: "There was an error submitting preferences.", type: 'error'});
        })
        .then(() => {
          eventBus.$emit('reload-preferences');
        });
      }

      else{
        const route = `/api/teams/${this.team.teamID}/preferences`;
      eventBus.$emit('reload-preferences');
        axios
        .post(route, {preferences: this.options})
        .then(() => {
          eventBus.$emit('new-message', {text: 'User preferences submitted successfully.', type: 'success'});
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: "There was an error submitting preferences.", type: 'error'});
        })
        .then(() => {
          eventBus.$emit('reload-preferences');
        });
      }

    
    },
    getTeams: function() {

      axios
        .get(`/api/users/${this.group.groupID}/hasRankedTeams`)
        .then(response => {
          if (response.data.length > 0) {
            this.showSubmittedMessage = true;
            this.showOptions = false;
          }
      });
        
      axios.get(`/api/groups/${this.group.groupID}/teams`).then(response => {
        this.options = response.data;
        // this.options = response.data.map(elt => elt.team[1]); //[list of teamnames]
      });
    },
    getMembers: function() {
      const groupID = this.team.groupID;
      const teamID = this.team.teamID;

      axios
        .get(`/api/teams/${teamID}/hasRankedUsers`)
        .then(response => {
          if (response.data.length > 0) {
            this.showSubmittedMessage = true;
            this.showOptions = false;
          }
      });


      axios.get(`/api/groups/${groupID}/members`).then(response => {
        this.options = response.data;
      });
    },
    toggleShowOptions: function() {
      this.showSubmittedMessage = false;
      this.showOptions = !this.showOptions;
    }
  }
};
</script>

<style scoped>
.preferences {
  width: 300px;
}
.pref-item {
  font-size: 0.9em;
}
.pref-rank {
  font-weight: 700;
  margin-right: 15px;
  margin-left: 15px;
}
.pref-name {
  width: 250px;
  padding: 9px 9px;
  border: none;
  border-radius: 3px;
  margin: 5px 0;
  display: inline-block;
  background-color: white;
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  position: relative;
}
.fa-bars {
  position: absolute;
  right: 10px;
  color: var(--gray);
  margin-top: 2px;
}
button, button:hover {
  width: 250px;
  background-color: var(--primary);
  color: white;
  margin-top: 5px;
  margin-left: 39px;
}
</style>