<template>
  <form id='post-announcement' v-on:submit.prevent='postAnnouncement' method='post'>
    <h2>Post Announcement</h2>
    <textarea v-model.trim='announcement' type='text' name='announcement' placeholder="Enter a new announcement"></textarea>
    <span class='tags-label'>Tags:</span>
    <input v-model.trim='rawTags' type='text' placeholder="Enter comma separated tags" class="tags"/>
    <button type='submit' value='Create Announcement'>Create Announcement</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "CreateAnnouncement",

  props: {
    group: Object,
    team: Object,
  },

  data() {
    return {
      announcement: "",
      rawTags: ''
    };
  },

  methods: {
    postAnnouncement: function() {
      const tags = this.rawTags.split(',').map(tag => tag.trim());
      const timestamp = (new Date()).toISOString();
      const bodyContent = { content: this.announcement, timestamp, tags: tags };
      if (this.team != null) {
        axios
          .post('api/teams/' + this.team.teamID + '/announcements', bodyContent)
          .then(() => {
            eventBus.$emit('reload-announcements');
          })
          .catch(err => {
            eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
            this.resetForm();
          })
      } else {
        axios
          .post('api/groups/' + this.group.groupID + '/announcements', bodyContent)
          .then(() => {
            eventBus.$emit('reload-announcements');
          })
          .catch(err => {
            eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
            this.resetForm();
          })
      } 
    },

    resetForm: function() {
      this.announcement = "";
    }
  }
};
</script>

<style scoped>
#post-announcement {
  margin-bottom: 12px;
  overflow: hidden;
}
textarea {
  width: 100%;
  border: none;
  font-size: 0.9em;
  padding: 10px 16px;
  margin: 0px;
  height: 65px;
  resize: none;
  border-radius: 6px;
}
.tags {
  width: calc(100% - 50px);
  border: none;
  font-size: 0.9em;
  padding: 10px 16px;
  resize: none;
  border-radius: 6px;
  margin-top: 10px;
  margin-left: 5px;
}
.tags-label {
  width: 45px;
  display: inline-block;
}
button, button:hover {
  background-color: var(--success);
  color: white;
  float: right;
}
</style>
