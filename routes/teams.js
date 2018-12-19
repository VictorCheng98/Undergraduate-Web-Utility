const express = require('express');
const Users = require('../models/Users');
const Teams = require('../models/Teams');
const Groups = require('../models/Groups');
const sanitizer = require('sanitizer');

const router = express.Router();

/**
 * Creates a new team
 * @name POST/api/teams/
 */
router.post('/', async (req, res) => {
  const teamName = req.body.teamName;
  const groupID = req.body.groupID;
  const quota = req.body.quota;
  const userID = req.session.userID;
  const teamLeadName = req.body.teamLead;
  const teamLead = await Users.findUserByUsername(teamLeadName);
  if (teamLead == undefined){
    res.status(400).json(`User: ${teamLeadName} does not exist.`).end();
  } else{
    const isInGroup = await Users.isMember(teamLead.userID, groupID);
    if (!isInGroup){
      res.status(400).json(`${teamLeadName} is not a member of this group.`).end();
    } else{
      const nameTaken = await Teams.isInUse(teamName);
      if (nameTaken){
        res.status(400).json(`The Team Name: ${teamName} is already taken.`).end();
      }else{
        const team = await Teams.addTeam(groupID, teamName, quota, teamLeadName); 
        res.status(200).json(team).end();
      }
    }
  }
});


/**
 * Delete a team
 * @name DELETE/api/teams/
 */
router.delete('/:id', async (req, res) => {
  let teamID = req.params.id;
  let userID = req.session.userID;
  let team = await Teams.findTeamByID(teamID);
  if (team === undefined) {
    res.status(404).json(`Team with team ID ${teamID} doesn't exist.`).end();
  } else {
    const isUserGroupAdmin = await Users.isExecByGroupID(userID, team.teamgroupID);
    if (isUserGroupAdmin) {
      const del = Teams.deleteTeam(teamID);
      res.status(200).end();
    } else {
      res.status(401).json(`Only group admins can delete team`);
    }
  }
});

router.put('/:id', async(req, res) => {
  // const bodyContent = {name: this.name, lead: this.lead, quota: this.quota};
  // editTeam(teamID, teamName, quota, teamLead)
  const teamID = req.params.id;
  const teamName = req.body.name;
  const teamLead = req.body.lead;
  const teamQuota = req.body.quota;
  const editTeam = await Teams.editTeam(teamID, teamName, teamQuota, teamLead);
  res.send();
})


/**
 * Get all members assigned to a team
 * @name GET/api/teams/:id/members
 * @return {Members[]} - list of members
 */
router.get('/:id/members', async (req, res) => {
  const members = await Teams.getTeamMembers(req.params.id);
  res.status(200).json(members).end();
});


/**
* Assign a member to a team
* @name POST/api/teams/:id/members
* @params{username} username of user to be assigned to the team
* :id ID of the team the user will be assigned to
*/
router.post('/:id/members/', async (req, res) => {
  const username = sanitizer.sanitize(req.body.username);
  const teamID = sanitizer.sanitize(req.params.id);
  console.log(req.body.username);
  const addMember = await Teams.addTeamMember(teamID, username);
  res.status(200).json(addMember);
})

router.delete('/:id/members/:membername', async(req, res) => {
  const membername = sanitizer.sanitize(req.params.membername);
  const teamID = sanitizer.sanitize(req.params.id);
  const removeMember = await Teams.removeTeamMember(teamID, membername);
  res.send();
})


/**
 * Get all teams user is in
 * @name GET/api/teams/getTeamsIn
 * @return {Teams[]} - list of teams
 */
router.get('/teamsIn', async (req, res) => {
  const userID = req.session.userID;
  const teams = await Teams.teamsIn(userID);
  res.status(200).json(teams).end();
});

/**
 * Get all teams user owns
 * @name GET/api/teams/:id/members
 * @return {Teams[]} - list of teams
 */
router.get('/teamsOwned', async (req, res) => {
  const userID = req.session.userID;
  const teams = await Teams.teamsOwned(userID);
  res.status(200).json(teams).end();
});



/**
 * Get all team announcements
 * @name GET/api/teams/:teamID/announcement
 * @return {Announcments[]} - list of announcement objects
 */
router.get('/:teamID/announcements', async(req, res) => {
  const teamID = req.params.teamID;
  const team = await Teams.findTeamByID(teamID);
  if (team === undefined) {
    res.status(404).json(`Team with team name ${teamID} doesn't exist.`).end();
  } else {
    const announcements = await Teams.displayAllTeamAnnouncements(teamID);
    res.status(200).json(announcements);
  }
});


/**
 * Check if team has already ranked users
 * @name GET/api/teams/:teamID/hasRankedUsers
 */
 router.get('/:teamID/hasRankedUsers', async(req, res) => {
  const teamID = req.params.teamID;
  const team = await Teams.findTeamByID(teamID);
  if (team === undefined) {
    res.status(404).json(`Team with team name ${teamID} doesn't exist.`).end();
  } else {
    const hasRanked = await Teams.hasRankedMembers(teamID);
    res.status(200).json(hasRanked);
  }
 });


/**
 * Create team announcements
 * @name POST/api/teams/:teamID/announcement
 */
router.post('/:teamID/announcements', async(req, res) => {
  const teamID = req.params.teamID;
  const announcementText = req.body.content;   // Split this into title and body.
  const announcementTags = req.body.tags;
  const userID = req.session.userID; 
  const team = await Teams.findTeamByID(teamID);
  const timestamp = req.body.timestamp;

  if (team === undefined) {
    res.status(404).json(`Team with team ID ${teamID} doesn't exist.`).end();
  } else {
    const isUserAdmin = await Teams.isTeamLead(userID, teamID);
    if (isUserAdmin) {
      await Teams.addTeamAnnouncement(userID, teamID, announcementText, announcementTags, timestamp);
      res.status(200).end();
    } else {
      res.status(401).json(`Only group admins can post announcements group`).end();
    }
  }
})


/**
 * Edit a team announcement
 * @name PUT/api/teams/:teamID/announcement/:announcementID
 */
router.put('/:teamID/announcements/:announcementID', async(req, res) => {
  const teamID = req.params.teamID;
  const announcementText = req.body.content;
  const announcementID = req.body.announcementID;
  const isLead = await Teams.isTeamLead(req.session.userID, teamID);
  if (!isLead) {
    res.status(401).json(`Only team leads can edit team announcements.`).end();
  } else {
    const announcements = await Teams.editTeamAnnouncement(req.session.userID, teamID, announcementID, announcementText);
    res.status(200).json(announcements).end();
  }
})


/**
 * Delete team announcement
 * @name DELETE/api/teams/:teamID/announcement
 */
router.delete('/:teamID/announcements/:announcementID', async(req, res) => {
  const teamID = sanitizer.sanitize(req.params.teamID);
  const announcementID = sanitizer.sanitize(req.params.announcementID);
  const userID = req.session.userID;
  const team = await Teams.findTeamByID(teamID);
  if (team === undefined) {
    res.status(404).json(`Team with team ID ${teamID} doesn't exist.`).end();
    } else {
    const isUserLead = await Teams.isTeamLead(userID, teamID);
    if (isUserLead) {
      await Teams.deleteTeamAnnouncement(teamID, userID, announcementID);
      res.status(200).end();
    } else {
      res.status(401).json(`Only group admins can delete announcements.`).end();
    }
  }
})


/**
 * Assign a team's preference for users
 * @name POST/api/teams/:teamID/preferences
 */
router.post('/:teamID/preferences', async(req, res) => {
  const teamID = req.params.teamID;
  const preferences = req.body.preferences;
  const groupID = req.body.groupID;
  const userID = req.session.userID;
  await Teams.prefMembers(userID, groupID, teamID, preferences);
  res.status(200).end();
});

module.exports = router;
