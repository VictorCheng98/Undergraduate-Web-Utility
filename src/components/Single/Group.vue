<template>
  <div class="group">
    <h1>{{ group.groupName }}</h1>
    <div v-if="isAdmin">
      <PostAnnouncement v-bind:group="group" />
      <h2>Roster</h2>
      <div v-if="noMembers">
        No members to display.
      </div>
      <div v-else>
        <p>Removing a member will remove them from all teams in this group.</p>
        <div v-for="member in members" v-bind:key="member.id" class="member">
          {{ member }}
          <i class="fas fa-trash" v-on:click="deleteMember(member)"></i>
        </div>
      </div>
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
  name: "Group",

  props: {
    group: Object,
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
    };
  },

  computed: {
    noAnnouncements: function () {
      return this.announcements == null || this.announcements.length == 0;
    },
    noMembers: function () {
      return this.members == null || this.members.length == 0;
    },
    isAdmin: function () {
      //return true;
      return this.group.groupAdminName == this.user.username;
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
      // get the announcements for this group
      const groupID = this.group.groupID;
      axios
        .get('/api/groups/' + groupID + '/announcements')
        .then((announcements) => {
          this.announcements = announcements.data;
        })
    },
    getMembers: function() {
      const groupID = this.group.groupID;
      axios
        .get("/api/groups/" + groupID + "/members")
        .then((members) => {
          // eventBus.$emit('check-login');
          // eventBus.$emit('clear-messages');
          this.members = members.data;
        })
    },
    deleteMember: function(username) {
      // delete the given username from the group
      const groupID = this.group.groupID;
      axios
        .delete('/api/groups/' + groupID + '/members/' + username)
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
