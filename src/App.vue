<template>
  <div id="app">
    <header>
      <div class="header-item home-logo" v-on:click="setView('home')">uwu</div>
      <div class="header-item" v-on:click="setView('signin')" v-if="!loggedIn">Sign In</div>
      <div class="header-item" v-on:click="setView('announcements')" v-if="loggedIn">Announcements</div>
      <div class="header-item" v-on:click="setView('teams')" v-if="loggedIn">Teams</div>
      <div class="header-item" v-on:click="setView('admin')" v-if="loggedIn && isAdmin">Admin</div>
      <div class="header-item" v-on:click="setView('settings')" v-if="loggedIn">Settings</div>
      <div class="header-item" v-on:click="signOut()" v-if="loggedIn">Sign Out</div>
    </header>
    <section class="messages-section" >
      <Messages />
    </section>
    <section v-if="showView('home')" >
      <HomePage />
    </section>
    <section v-if="showView('signin')" >
      <SignInPage />
    </section>
    <section v-if="showView('announcements')" >
      <AnnouncementsPage v-bind:user="user" />
    </section>
    <section v-if="showView('teams')" >
      <TeamsPage v-bind:user="user" />
    </section>
    <section v-if="showView('admin')" >
      <AdminPage v-bind:user="user" />
    </section>
    <section v-if="showView('settings')" >
      <SettingsPage v-bind:user="user" />
    </section>
    <section v-if="showView('team')" >
      <Team v-bind:user="user" v-bind:team="team" />
    </section>
    <section v-if="showView('group')" >
      <Group v-bind:user="user" v-bind:group="group" />
    </section>
    <section v-if="showView('new')" >
      <NewGroup />
    </section>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "./main";

import Messages from "./components/Messages.vue";
import HomePage from "./components/HomePage.vue";
import SignInPage from "./components/SignIn/SignInPage.vue";
import AnnouncementsPage from "./components/Announcements/AnnouncementsPage.vue";
import TeamsPage from "./components/Teams/TeamsPage.vue";
import AdminPage from "./components/Admin/AdminPage.vue";
import SettingsPage from "./components/Settings/SettingsPage.vue";
import Team from "./components/Single/Team.vue";
import Group from "./components/Single/Group.vue";
import NewGroup from "./components/Single/NewGroup.vue";

export default {
  name: "app",

  components: {
    Messages,
    HomePage,
    SignInPage,
    AnnouncementsPage,
    TeamsPage,
    AdminPage,
    SettingsPage,
    Team,
    Group,
    NewGroup
  },

  data() {
    return {
      user: null,
      isAdmin: false,
      view: "home",
      group: null,
      team: null,
    };
  },

  computed: {
    loggedIn: function () {
      return this.user != null;
    },
  },

  created: function() {
    this.checkLogin();

    eventBus.$on("check-login", () => {
      this.checkLogin();
    });
    eventBus.$on("view-team", (team) => {
      this.setView("team");
      this.team = team;
    });
    eventBus.$on("view-group", (group) => {
      this.setView("group");
      this.group = group;
    });
    eventBus.$on("new-group", () => {
      this.setView("new");
    });
    eventBus.$on("view-teams-page", () => {
      this.setView("teams");
    });
  },

  methods: {
    checkLogin: function() {
      axios.get("/api/users/loggedin").then(response => {
        this.user = response.data;
        this.view = this.loggedIn ? 'announcements' : 'home';
        this.checkIsAdmin();
      });
    },
    checkIsAdmin: function() {
        // TODO FINAL
        // route to check if the user is an admin of any groups and set this.isAdmin to true or false 
        axios.get("/api/users/checkAdmin").then(response => {
          this.isAdmin = response.data
        });
    },
    
    setView: function(view) {
      eventBus.$emit('clear-messages');
      this.view = view;
    },
    showView: function(view) {
      return this.view == view;
    },
    signOut: function() {
      axios.post("api/users/signout").then(response => {
        eventBus.$emit('check-login');
        eventBus.$emit('clear-messages');
      });
    }
  }
};
</script>

<style>
body {
  margin: 0;
}
h1,h2,h3,h4,p,ol,ul {
  margin:0;
  padding:0
}
main,li {
  display:block
}
h1,h2,h3,h4 {
  font-size:inherit
}
strong {
  font-weight:700
}
a,button {
  color:inherit;
  -webkit-transition:.3s;
  transition:.3s
}
button {
  overflow:visible;
  border:0;
  font:inherit;
  -webkit-font-smoothing:inherit;
  letter-spacing:inherit;
  background:none;
  cursor:pointer
}
:focus {
  outline:0
}
img {
  max-width:100%;
  height:auto;
  border:0
}
a {
  margin:0;
  padding:0;
  font-size:100%;
  vertical-align:baseline;
  background:transparent;
  text-decoration:none;
}
li {
  list-style:none
}
* {
  box-sizing: border-box
}
html,body {
  width:100%;
  height:100%;
  background:rgb(242,242,242);
  font-family: 'Muli', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
input {
  font-family: inherit;
}
body {
  --blue: #1E90FF;
  --gray: #95a5a6;
  --primary: #1E90FF;
  --success: #1dd1a1;
  --error: #ff6b6b;
}
h1 {
  color: var(--primary);
  font-weight: 800;
  letter-spacing: 0.7px;
  font-size: 1.5em;
  margin-bottom: 10px;
}
h2 {
  color: var(--primary);
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.7px;
  font-size: 1.2em;
  margin-bottom: 10px;
}
button {
  padding: 7px 13px;
  border-radius: 3px;
  margin: 10px 0;
}
button:hover {
  background-color: lightgray;
}
a {
  color: var(--blue);
  font-weight: 600;
}
.right-toggle-parent {
  position: relative;
}
.right-toggle {
  position: absolute;
  text-transform: uppercase;
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 700;
  cursor: hand;
  cursor: pointer;
  bottom: 100%;
  margin-bottom: 12px;
  right: 0;
}
</style>

<style scoped>
header {
  background-color: var(--primary);
  color: white;
  display: flex;
  padding: 15px 27px;
  font-size: 1.2em;
  align-items: center;
}
.header-item {
  cursor: hand;
  cursor: pointer;
  margin-left: 25px;
}
.home-logo {
  font-weight: 700;
  letter-spacing: 0.8px;
  font-size: 1.35em;
  font-family: 'Chewy', 'Muli', Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  margin-right: auto;
  margin-left: 0;
}
section {
  padding: 15px 27px;
}
section.messages-section {
  padding: 0 27px;
}
</style>
