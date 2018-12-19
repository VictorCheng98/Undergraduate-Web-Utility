<template>
  <div class="team">
    <h1>{{ team.teamName }}</h1>
    <div v-if="isLead">
      <PostAnnouncement v-bind:team="team" />
      <h2>Roster</h2>
      <div v-if="noMembers">
        No members to display.
      </div>
      <div v-else>
        <div v-for="member in members" v-bind:key="member.id" class="member">
          {{ member.username }}
          <i class="fas fa-trash" v-on:click="deleteMember(member.username)"></i>
        </div>
      </div>

      <h2>Add member</h2>
      <input v-model.trim='addUsername' type='text' placeholder="Username of user to add" class="add-username" />
      <button type='submit' v-on:click="addMember">Add Member</button>
    </div>
    <h2>Announcements</h2>
    <div v-if="noAnnouncements">
      No announcements to display.
    </div>
    <div v-else>
      <Announcement
        v-for="announcement in announcements"
        v-bind:key="announcement.id"
        v-bind:announcement="announcement"
        v-bind:user="user"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

import PostAnnouncement from "./PostAnnouncement.vue";
import Announcement from "../Announcements/Announcement.vue";

export default {
  name: "Team",

  props: {
    team: Object,
    user: Object,
  },

  components: {
    PostAnnouncement,
    Announcement
  },

  data() {
    return {
      announcements: null,
      members: null,
      addUsername: ''
    };
  },

  computed: {
    noAnnouncements: function () {
      return this.announcements == null || this.announcements.length == 0;
    },
    noMembers: function () {
      return this.members == null || this.members.length == 0;
    },
    isLead: function () {
      return this.team.username == this.user.username;
    }
  },

  created: function() {
    this.getAnnouncements();
    this.getMembers();
    eventBus.$on("reload-announcements", () => {
      this.getAnnouncements();
    });
    eventBus.$on("reload-members", () => {
      this.getMembers();
    });
  },

  methods: {
    getAnnouncements: function() {
      // get the announcements for this team
      axios
        .get('api/teams/' + this.team.teamID + '/announcements')
        .then((announcements) => {
          this.announcements = announcements.data;
        })
     
    },
    getMembers: function() {
      // get the members of this team
      axios
        .get('api/teams/' + this.team.teamID + '/members')
        .then((members) => {
          this.members = members.data;
        })
    },
    addMember: function() {
      // add the user with username this.addUsername to the team  
      const body = {username: this.addUsername};
      const teamID = this.team.teamID;
      axios
        .post('api/teams/' + teamID + '/members', body)
        .then(() => {
          eventBus.$emit('reload-members');
          this.addUsername = '';
        })
    },
    deleteMember: function(username) {
      // delete the given username to the team
      // use deleteTeamMember(..) in Teams.js
      const teamID = this.team.teamID;
      axios
        .delete('/api/teams/' + teamID + '/members/' + username)
        .then(() => {
          eventBus.$emit('reload-members');
        })
    }
  }
};
</script>
<style scoped>
h2 {
  margin-top: 20px;
  clear: both;
}
.add-username {
  width: 100%;
  border: none;
  font-size: 0.9em;
  padding: 10px 16px;
  resize: none;
  border-radius: 6px;
}
button, button:hover {
  background-color: var(--success);
  color: white;
  float: right;
}
.member {
  background-color: white;
  padding: 10px 16px;
  margin: 5px;
  width: 250px;
  border-radius: 5px;
  position: relative;
  display: inline-block;
}
.member i {
  position: absolute;
  margin-top: 2px;
  right: 12px;
  color: lightgray;
}
.member i:hover {
  color: darkgray;
}
</style>
