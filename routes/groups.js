const express = require('express');

const Groups = require('../models/Groups');
const Teams = require('../models/Teams');
const Users = require('../models/Users');
let sanitizer = require('sanitizer');


const {
  doMatching
} = require('./StableMatchingUtils');


const router = express.Router();

/**
 * Create group
 * @name POST/api/groups/
 * @param {String} groupID - Name of group to be created
 * @param {Int} userID - ID of the user creating the group. Requires user logged in
 */
router.post('/', async (req, res) => {
  let groupName = sanitizer.sanitize(req.body.name);
  let groupadmin = req.session.userID;
  let group = await Groups.findGroupByName(groupName);
  if (group !== undefined) {
    res.status(400).json(`Group with group name ${groupName} already exists.`).end();
  } else {
    group = await Groups.addGroup(groupadmin, groupName);
    res.status(200).json(group);
  } 
});


/**
 * Lists all groups
 * @name GET/api/groups/:adminID
 * @param {String} groupID - Name of group to be created
 * Returns {group[]} all groups
 */
router.get('/:adminID', async (req, res) => {
  const adminGroups = await Users.getGroupInfo(req.params.adminID);
  res.status(200).json(adminGroups);
});

/**
 * Advances a Group form sign up to match phase
 * @name PUT/api/groups/:groupID/phase
 */
router.put('/:groupID/phase', async (req, res) => {
  const groupID  = sanitizer.sanitize(req.params.groupID);
  await Groups.advanceGroup(groupID);
  res.status(200).json().end();
});

/**
 * Gets a Group's phase
 * @name GET/api/groups/:groupID/phase
 */
router.get('/:groupID/phase', async (req, res) => {
  const groupID  = sanitizer.sanitize(req.params.groupID);
  const phase = await Groups.getPhase(groupID);
  res.status(200).json(phase).end();
});

/**
 * Delete group
 * @name DELETE/api/groups/:groupID
 * :groupID - Name of group to be deleted
 * @param {Int} userID - ID of user deleting group. Requires user to be admin of group
 */
router.delete('/:groupID', async (req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const userID = req.session.userID;
  const group = await Groups.findGroupById(groupID);
  if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
  } else {
    const isUserAdmin = await Users.isExecByGroupID(userID, groupID);
    if (isUserAdmin) {
      const del = Groups.deleteGroup(groupID);
      res.status(200).end;
    } else {
      res.status(401).json(`Only group admins can delete group`);
    }
  }
});


/**
 * Get teams in a group
 * @name GET/api/groups/:groupID/teams
 * : groupID - ID of group whose teams will be returned
 * @Return {Team[]} teams belonging to group with ID groupID
 */
router.get('/:groupID/teams', async (req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const group = await Groups.findGroupByID(groupID);
  if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
  } else {
    const teams = await Groups.getTeams(groupID);
    res.status(200).json(teams);
  }
});


/**
 * Assigns users to teams in a group
 * @name GET/api/groups/:groupID/assignment
 * : groupID - Name of group to perform stable matching on.
 * @param {Int} userID - ID of user performing the action. Requires user to be admin of group
 * 
 */
router.get('/:groupID/assignment', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const group = await Groups.findGroupByID(groupID);
  const userID = req.session.userID;
  if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
  } else {
      const isUserAdmin = await Users.isExecByGroupID(userID, groupID);
      if (isUserAdmin) {
        const userPrefs = await Groups.getUserPrefs(groupID);
        const teamQuota = await Teams.getQuotas(groupID);
        const teamPrefs = await Groups.getTeamPrefs(groupID);
        matches = doMatching(teamPrefs, userPrefs, teamQuota);
        const saveAssignement = await Groups.assignToTeams(matches);
        await Groups.advanceGroup(groupID); //signUpPhase complete
        res.send(matches);
    } else {
      res.status(401).json(`Only a group admin can perform this action`);
    }
  }
});

/**
* Lists members of a given group
* @name GET/api/groups/:groupID/members
* :groupID - ID of group whose members are to be listed
*/
router.get('/:groupID/members', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const group = await Groups.findGroupByID(groupID);
   if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
  } else {
    const members = await Groups.getMembers(groupID)
    res.status(200).json(members);
  }
});

/**
* Adds a user to a group
* @name POST/api/groups/:groupID/members/
* :groupID - Name of group which user with username will be added to
* @param{userID} - ID of the user performing the action. Requires user not a member of the group
*/
router.post('/:groupID/members', async(req, res) => {
  // TODO
  const userID = req.session.userID;
  const groupID = sanitizer.sanitize(req.params.groupID)
  const isMember = await Users.isMember(userID, groupID);
  if (isMember){
    res.status(401).json(`User already a member of the group`);
  } else{
    const addMember = await Groups.addMember(groupID, userID);
    res.end();
  }
});


/**
* Deletes a user from a group
* @name DELETE/api/groups/:groupID/:membername
* :groupID - Name of group which user with username will be deleted from
* :membername - Name of member to be removed from the group
*/
router.delete('/:groupID/members/:membername', async(req, res) => {
  // TODO
  const groupID = sanitizer.sanitize(req.params.groupID);
  console.log(req.params.membername);
  const member = await Users.findUserByUsername(sanitizer.sanitize(req.params.membername));
  const isMember = await Users.isMember(member.userID, groupID);
  const isAdmin = await Users.isExecByGroupID( req.session.userID, groupID);

  if(isAdmin){
    if (isMember){
      await Groups.removeMember(member.userID, groupID);
      res.status(200).json();
    } else{
      res.status(404).json(`${member.username} is not a member of this group.`).end();
    }
  } else{
    res.status(401).json(`Only a group admin can perform this action`);
  }
});


/**
 * Displays all group announcements
 * @name GET/api/groups/:groupID/announcements
 */
router.get('/:groupID/announcements', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const group = await Groups.findGroupByID(groupID);
  if (group === undefined) {
    res.status(404).json(`Group with group name ${groupID} doesn't exist.`).end();
  } else {
    console.log("The group ID");
    console.log(groupID);
    const announcements = await Groups.displayAllGroupAnnouncements(groupID);
    console.log(announcements);
    res.status(200).json(announcements)
  }
})


/** TODO: display group announcements by tags
 * Creates a new group announcement
 * @name POST/api/groups/:groupID/announcements
 */
router.post('/:groupID/announcements', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const announcementText = sanitizer.sanitize(req.body.content);   // Split this into title and body.
  const announcementTags = sanitizer.sanitize(req.body.tags);
  const timestamp = req.body.timestamp;
  const userID = req.session.userID; 
  console.log(groupID);
  console.log(announcementText);
  console.log(announcementTags);
  console.log(timestamp);
  console.log(userID);
  const group = await Groups.findGroupByID(groupID);

  if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
  } else {
    const isUserAdmin = await Users.isExecByGroupID(userID, groupID);
    if (isUserAdmin) {
      await Groups.addGroupAnnouncement(userID, groupID, announcementText, timestamp, announcementTags);
      res.status(200).end();
    } else {
      res.status(401).json(`Only group admins can post announcements.`);
    }
  }
})

/**
 * Edit group announcements
 * @name PUT/api/groups/:groupID/announcements/:announcementID
 */
router.put('/:groupID/announcements/:announcementID', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const announcementID = sanitizer.sanitize(req.params.announcementID);
  const announcementText = sanitizer.sanitize(req.body.text);
  const isAdmin = await Users.isExecByGroupID( req.session.userID, groupID);
  if (!isAdmin) {
    res.status(401).json(`Only group admins can edit group announcements.`).end();
  } else {
    const announcements = await Groups.editGroupAnnouncement(announcementID, announcementText);
    res.status(200).json(announcements).end();
  }
})

/**
 * Delete group announcements
 * @name DELETE/api/groups/:groupID/announcements/:announcementID
 */
router.delete('/:groupID/announcements/:announcementID', async(req, res) => {
  const groupID = sanitizer.sanitize(req.params.groupID);
  const announcementID = sanitizer.sanitize(req.params.announcementID);
  const userID = req.session.userID;
  const group = await Groups.findGroupByID(groupID);
  if (group === undefined) {
    res.status(404).json(`Group with group ID ${groupID} doesn't exist.`).end();
    } else {
    const isUserAdmin = await Users.isExecByGroupID(userID, groupID);
    if (isUserAdmin) {
      const deleteAnnouncement = await Groups.deleteGroupAnnouncement(announcementID);
      res.status(200).json(deleteAnnouncement);
    } else {
      res.status(401).json(`Only group admins can delete announcements.`).end();
    }
  }
})

module.exports = router;