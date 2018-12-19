const database = require('../database');

const group = require('./Groups');
const Users = require('./Users');
const sqlString = require('sqlstring');

/**
 * @class Teams
 * Contains methods that operate on the Teams set
 */
class Teams {

   /**
   * Check if a User is a Team Leader of a given Team
   * @param {number} userID - ID of user to check
   * @param {number} teamID - ID of the team in question
   * @return {boolean} - True if the user is the Team's Leader 
   */
  static async isTeamLead(userID, teamID) {
    try {
      const sqlUser = sqlString.format(`SELECT * FROM teamLeads WHERE leadID=? AND teamID=?;`, [userID, teamID]);
      const response = await database.query(sqlUser);
      return response.length != 0;
    } catch (error) { throw error; }
  }


   /**
   * Check if a team name is already in use
   * @param {string} teamName - groupName to check
   * @return {boolean} - True if the teamName is already in use
   */
  static async isInUse(teamName) {
    try {
      const sqlTeam = sqlString.format(`SELECT * FROM teams WHERE teamName=?;`, [teamName]);
      const response = await database.query(sqlTeam);
      return response.length != 0;
    } catch (error) { throw error; }
  }
  
  
  /**
   * Check if a team  is in a Group
   * @param {number} teamID - teamID to check
   * @param {number} groupID - ID of the group the team could be in
   * @return {boolean} - True if the team is in the group
   */
  static async isInGroup(teamID, groupID) {
    try {
      const sqlTeam = sqlString.format(`SELECT * FROM teams WHERE teamgroupID= ? AND teamID= ?;`, [groupID, teamID]);
      const response = await database.query(sqlTeam);
      return response.length != 0;
    } catch (error) { throw error; }
  }

  /**
   * Get the quotas of all the teams in a Group
   * @param {number} groupID - ID of the Group
   * @return {Quota{}} - Quota objects = {teamName: quota}
   */
  static async getQuotas(groupID) {
    try {
      const sqlQuotas = sqlString.format(`SELECT teamName, teamquota FROM teams WHERE teamgroupID=?;`, [groupID]);
      const response = await database.query(sqlQuotas);
      const quotas ={};
      response.forEach(elt => quotas[elt.teamName] = elt.teamquota);
      return quotas;
    } catch (error) { throw error; }
  }

  /**
   * Remove the member with the specified username from the Team
   * @param {number} teamID - teamID 
   * @param {string} username - user to remove 
   * @return {Leads[]} - a list of Leads object = {username: Str leadName}
   */
  static async removeTeamMember(teamID, username) {
    try {
      const sql = sqlString.format(`SELECT * FROM users WHERE username= ?;`, [username]);
      const user = await database.query(sql);
      await database.query(sqlString.format(`DELETE FROM teamMembers WHERE memberID=? AND teamID =?;`, [user[0].userID, teamID]));
    } catch (error) { throw error; }
  }

    /**
   * Add the member with the specified username to the Team
   * @param {number} teamID - teamID 
   * @param {string} username - user to add 
   * @return {Leads[]} - a list of Leads object = {username: Str leadName}
   */
  static async addTeamMember(teamID, username) {
    try {
      const sql = sqlString.format(`SELECT * FROM users WHERE username= ?;`, [username]);
      const user = await database.query(sql);
      const response = await database.query(sqlString.format(`INSERT INTO teamMembers (teamID, memberID) VALUES (?,?);`, [teamID, user[0].userID]));
      return response;
    } catch (error) { throw error; }
  }

  /**
   * Find all members of a Team
   * @param {number} teamID - teamID to check
   * @return {teamMembers[]} - a list of teamMembers object {'username': memebername}
   */
  static async getTeamMembers(teamID) {
    try {
      const sqlMembers = sqlString.format(`SELECT username FROM users WHERE userID IN (SELECT memberID from teamMembers WHERE teamID= ?);`, [teamID]);
      const response = await database.query(sqlMembers);
      return response;
    } catch (error) { throw error; }
  }


  /**
   * Finds all the Teams a User is in
   * @param {number} userID - ID of USer
   * @return {string[]} - a list of teams
   */
  static async teamsIn(userID) {
    try {
      const sqlTeams = sqlString.format(`SELECT teams.teamID, teams.teamName, users.username, groups.groupID, groups.groupName 
                    FROM teams
                    INNER JOIN teamLeads ON teams.teamID = teamLeads.teamID
                    INNER JOIN groups ON groups.groupID = teams.teamgroupID
                    INNER JOIN users ON teams.teamID = teamLeads.teamID AND users.userID=teamLeads.leadID
                    WHERE teams.teamID IN (SELECT teamID FROM teamMembers WHERE memberID=?);`, [userID]);
      const response = await database.query(sqlTeams);
      return response;
    } catch (error) { throw error; }
  }

  /**
   * Get all teams a user owns
   * @param {number} userID - ID of User
   * @return {Teams[]} - a list of teams
   */
  static async teamsOwned(userID) {
    try {
      const ownedTeams = sqlString.format(`SELECT teams.teamID, teams.teamName, users.username, groups.groupID, groups.groupName
                      FROM teams
                      INNER JOIN teamLeads ON teams.teamID = teamLeads.teamID
                      INNER JOIN groups ON groups.groupID = teams.teamgroupID
                      INNER JOIN users ON teams.teamID = teamLeads.teamID AND users.userID=teamLeads.leadID 
                      WHERE teams.teamID IN (SELECT teamID from teamLeads WHERE leadID = ?);`, [userID]);
      const response = await database.query(ownedTeams);
      return response;
    } catch (error) { throw error; }
  }


  /**
   * Add a Team.
   * @param {number} groupID - ID of the group
   * @param {number} quota - the number of members the team requires 
   * @param {string} teamName - name of the team to be added
   * @param {string} teamLead - name of the team leader
   */
  static async addTeam(groupID, teamName, quota, teamLead) {
    try {
      const inUse = await Teams.isInUse(teamName);
      if (!inUse){
        const sql = sqlString.format(`INSERT INTO teams (teamName, teamquota, teamgroupID) VALUES (?,?,?);`, [teamName, quota, groupID]);
        const response = await database.query(sql);
        const teamID = response.insertId;
        const lead = await database.query(sqlString.format(`SELECT * FROM users WHERE username=?`, [teamLead]));
        await database.query(sqlString.format(`INSERT INTO teamLeads (leadID, teamID) VALUES (?, ?);`, [lead[0].userID, teamID])); 
        return response;
      }  
    } catch (error) { throw error; }
  }

    /**
   * Edit a Team. TODO: check if the teamName is in use and newteamLead is a member of the group in the routes
   * @param {number} teamID - Id of the team to be edited
   * @param {number} quota - the number of members the team requires 
   * @param {string} teamName - name of the team 
   * @param {string} teamLead - name of the team leader
   */
  static async editTeam(teamID, teamName, quota, teamLead) {//
    try {
      const inUse = false;
      const prevName = await database.query(sqlString.format(`SELECT teamName FROM teams WHERE teamID =?;`, [teamID]));
      if (prevName[0].teamName != teamName){
          inUse = await Teams.isInUse(teamName);
      }
      if (!inUse){
        const prevLead = await database.query(sqlString.format(`SELECT leadID FROM teamLeads WHERE teamID =?;`, [teamID]));
        const newLead = await database.query(sqlString.format(`SELECT * FROM users WHERE username = ?;`, [teamLead])); //what to do if there are ppl with the same name??
        
        const updateTeam = sqlString.format(`UPDATE teams SET teamName = ?, teamquota= ? WHERE teamID = ?;`, [teamName, quota, teamID]);
        await database.query(updateTeam);
        await database.query(sqlString.format(`DELETE FROM teamLeads WHERE leadID =?;`, [prevLead[0].leadID]));
        await database.query(sqlString.format(`INSERT INTO teamLeads (leadID, teamID) VALUES (?, ?);`, [newLead[0].userID, teamID])); 
      }  
    } catch (error) { throw error; }
  }

  /**
   * Delete a Team. 
   * @param {number} teamID - ID of the team to be deleted
   */
  static async deleteTeam(teamID) {
    try { 
      const sql = sqlString.format(`DELETE from teams WHERE teamID = ?;`, [teamID]);
      await database.query(sql);  
    } catch (error) { throw error; }
  }


  /**
   * Find a team by ID.
   * @param {number} teamID - ID of team to find
   * @return {Team | undefined} - found Group
   */
  static async findTeamByID(teamID) {
    try {
      const sql = `SELECT * FROM teams WHERE teamID=${teamID};`;
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }


    /**
   * Find a team by name.
   * @param {string} teamName - name of team to find
   * @return {Team | undefined} - found Team
   */
  static async findTeamByName(teamName) {
    try {
      const sql = sqlString.format(`SELECT * FROM teams WHERE teamName= ?;`, [teamName]);
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }


  
  /**
   * Add a Team Announcement
   * @param {number} userID - ID of User to adding the team announcement
   * @param {number} teamID - ID of the Team
   * @param {string} announcement - the announcement 
   * @param {string[]} tags - a list of tags associated with the announcement
   */
  static async addTeamAnnouncement(userID, teamID, announcement, tags, timestamp) {
    try {
      const isTeamLead = await Teams.isTeamLead(userID, teamID);
      if (isTeamLead){
        const sqlAnnouncement = sqlString.format(`INSERT INTO teamAnnouncements (announcerID, text, teamID, timestamp) 
        VALUES (?, ?, ?, ?);`, [userID, announcement, teamID, timestamp]);
        const response = await database.query(sqlAnnouncement);
        const announcementID = response.insertId;
        for (var i =0; i < tags.length; i++){
            const tag = tags[i];
            const sqlTag = sqlString.format(`INSERT INTO teamAnnouncementsTags (teamID, announcementID, announcementTag) 
            VALUES (?, ?, ?);`, [teamID, announcementID, tag]);
            await database.query(sqlTag);
        }
      }  
    } catch (error) { throw error; }
  }

    /**
   * Edit a Team Announcement
   * @param {number} userID - ID of User to editing the team announcement
   * @param {number} teamID - ID of the Team
   * @param {number} announcementID - ID of the announcement to edit
   * @param {string} announcement - the new announcement 
   */
  static async editTeamAnnouncement(userID, teamID, announcementID, announcement) {
    try {
      const isTeamLead = await Teams.isTeamLead(userID, teamID);
      if (isTeamLead){
          const sqlAnnouncement = sqlString.format(`UPDATE teamAnnouncements SET text = ? WHERE announcementID=?;`, [announcement, announcementID]) ;
          const response = await database.query(sqlAnnouncement);
          return response
      }  
    } catch (error) { throw error; }
  }


    /**
   * Delete a Team Announcement
   * @param {number} userID - ID of User to deleting the team announcement
   * @param {number} teamID - ID of the Team
   * @param {number} announcementID - the announcement ID
   */
  static async deleteTeamAnnouncement(userID, teamID, announcementID) {
    try {
      const isTeamLead = await Teams.isTeamLead(userID, teamID);
      if (isTeamLead){
          const sqlAnnouncement = sqlString.format(`DELETE FROM teamAnnouncements WHERE announcementID =?;`, [announcementID]);
          await database.query(sqlAnnouncement);
      }  
    } catch (error) { throw error; }
  }


  /**
   * filter Team Announcemnts by Tags
   * @param {number} teamID - ID of the Team
   * @param {string[]} tags - a list of tags to search for
   * @return {TeamAnnouncement set()} - a set of TeamAnnouncement objects that have any of the tags in tags[]
   */
  static async filterTeamAnnouncementsByTag(teamID, tags) {
    try {
      const announcements = new Set();
      for (var i = 0; i < tags.length; i++){
          const tag = tags[i];
          const sqlAnnouncement = sqlString.format(`SELECT * FROM teamAnnouncements WHERE announcementID IN 
          (SELECT announcementID FROM teamAnnouncementsTags WHERE announcementTag=? AND teamID=?);`, [tag, teamID]);
          const response = await database.query(sqlAnnouncement); //Team Announcement []
          if (response.length != 0){
            response.forEach(elt => announcements.add(elt));
          }  
      }
      return announcements;
    } catch (error) { throw error; }
  }


  /**
   * display all the Team Announcemnts from the Team
   * @param {number} teamID - ID of the team
   * @return {TeamAnnouncement[]} - a list of all the TeamAnnouncement objects 
   */
  static async displayAllTeamAnnouncements(teamID) {
    try {
      const sqlAnnouncement = sqlString.format(`SELECT teamAnnouncements.* , users.username, teams.teamName, teams.teamgroupID, groups.groupName
      FROM  teamAnnouncements 
      INNER JOIN  users ON teamAnnouncements.announcerID = users.userID
      INNER JOIN  teams ON teamAnnouncements.teamID = teams.teamID
      INNER JOIN  groups ON teamAnnouncements.teamID = teams.teamID AND teams.teamgroupID = groups.groupID
      WHERE teams.teamID = ?;`, [teamID]);

      const response = await database.query(sqlAnnouncement);
      let announcement = "";
      for (var i=0; i < response.length; i++){
        announcement = response[i];
        const sqlTags = sqlString.format(`SELECT announcementTag FROM teamAnnouncementsTags WHERE announcementID = ?`,[announcement.announcementID]);
        const tags = await database.query(sqlTags);
        const tagList =[];
        tags.forEach(elt => tagList.push(elt.tag));
        announcement['tags'] = tagList;
      }
      //console.log('ANNOUNCEMENTS:', response);
      return response;
    } catch (error) { throw error; }
  }


  /**
   * assign the Team's ranking to users 
   * @param {number} leadID - ID of the teamleader requesting to rank users
   * @param {number} teamID - ID of the team
   * @param {number} groupID - ID of the group the team is in
   * @param {string[]} teamPrefs - an order list of usernames a Team prefers 
   */
  static async prefMembers(leadID, groupID, teamID, teamPrefs) {
    try {
      const isTeamLead = await Teams.isTeamLead(leadID, teamID);
      if(isTeamLead){
        var userRank = 1;
        for (var i = 0; i <teamPrefs.length; i++){
          const sql = sqlString.format(`SELECT * FROM users WHERE username=?;`, [teamPrefs[i]]);
          const resp = await database.query(sql);
          const user = resp[0];
          const sqlUser = sqlString.format(`SELECT * FROM groupMembers WHERE memberID=? AND groupID=?;`, [user.userID, groupID]);
          const isGroupMember = await database.query(sqlUser);
          if (isGroupMember){
            const sqlRank = sqlString.format(`SELECT * FROM rankings WHERE teamID=? AND userID= ?;`, [teamID, user.userID]); 
            const resp1 = await database.query(sqlRank);
            if (resp1.length != 0) { //the entry already exists
                const updateRank = sqlString.format(`UPDATE rankings SET userRankingByTeam = ? WHERE teamID=? AND userID= ?;`, [userRank, teamID, user.userID]) ;
                await database.query(updateRank);
            }
            else{
                const insertRank = sqlString.format(`INSERT INTO rankings (teamID, userID, userRankingByTeam) VALUES (?,?,?);`, [teamID, user.userID, userRank]) ;
                await database.query(insertRank);
            }
          }
          userRank++;
        }
      }
    } catch (error) { throw error; }
  }

  /**
   * Check if a particular Team has already ranked the group's members
   * @param {number} teamID - ID of the team
   * @returns {boolean} - True if the team has already ranked its members
  */
 static async hasRankedMembers(teamID){
  try{
   const sqlRank = sqlString.format(`SELECT * FROM rankings WHERE teamID = ?
                              AND userRankingByTeam IS NOT NULL `, [teamID]);
   const response = await database.query(sqlRank);
   return response;
  } catch (error) { throw error; }
}

}
module.exports = Teams;