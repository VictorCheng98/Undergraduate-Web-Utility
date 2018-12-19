const database = require('../database');

const Teams = require('./Teams');
const Groups = require('./Groups'); 
const sqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @class Users
 * Stores all Users.
 */
class Users {


/**
 * Hash a plain text password
 * @param {string} password 
 */
 static async hashPassword(password){
  const hashedPswrd= await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if(err) reject(err)
      resolve(hash)
    });
  })
  return hashedPswrd;
}

  /**
   * Add a User.
   * @param {string} username - username of the user
   * @param {string} password - password of the user
   */
  static async addUser(username, password) {
    try {
      const hashedPswrd = await Users.hashPassword(password)
      const sql = sqlString.format(`INSERT INTO users (username, password) VALUES (?, ?);`,[username, hashedPswrd]);
      const response = await database.query(sql);
      return response;
    } catch (error) { throw error; }
  }

  /**
   * Find a User by ID.
   * @param {number} userID - ID of User to find
   * @return {User | undefined} - found User
   */
  static async findUserByID(userID) {
    try {
      const sql = sqlString.format(`SELECT * FROM users WHERE userID=?;`, [userID]);
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }

  /**
   * Find a User by username.
   * @param {string} username - username of User to find
   * @return {User | undefined} - found User
   */
  static async findUserByUsername(username) {
    try {
      const sql = sqlString.format(`SELECT * FROM users WHERE username=?;`, [username]);
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }

  /**
   * Check if username and password match
   * @param {string} username - username of User to check
   * @param {string} password - password of User to check
   * @return {User | undefined} - the user if credentials are correct
   */
  static async authenticate(username, password) {
    const user = await Users.findUserByUsername(username);
    if (user !== undefined) {
      const pswrdsMatch = await bcrypt.compare(password, user.password);
      if (pswrdsMatch){return user;}
    }
  }

  /**
   * Change username
   * @param {number} userID - ID of user to change username of
   * @param {string} username - new username
   */
  static async changeUsername(userID, username) {
    try {
      const sql = sqlString.format(`UPDATE users SET username=? WHERE userID=?;`, [username, userID]);
      const response = await database.query(sql);
      return response;
    } catch (error) { throw error; }
  }

  /**
   * Change password
   * @param {number} userID - ID of user to change password of
   * @param {string} newPassword - new password
   */
  static async changePassword(userID, password) {
    try {
      const hashedPswrd = await Users.hashPassword(password); 
      const sql = sqlString.format(`UPDATE users SET password=? WHERE userID=?;`,[hashedPswrd, userID]);
      const response = await database.query(sql);
      return response;
    } catch (error) { throw error; }
  }

  /**
   * Delete a User
   * @param {number} userID - ID of user to delete
   */
  static async deleteUser(userID) {
    try {
      const sqlUser = sqlString.format(`DELETE FROM users WHERE userID=?;`, [userID]);
      await database.query(sqlUser);
    } catch (error) { throw error; }
  }

  /**
   * assign a User's ranking to Teams
   * @param {number} userID - ID of the user requesting to rank teams
   * @param {number} groupID - ID of the group the user is in
   * @param {string[]]} userPrefs- an ordered list of teams a user prefers 
  */
  static async prefTeams(userID, groupID, userPrefs) {
    try {
      const isGroupMember = await Users.isMember(userID, groupID);
      if(isGroupMember){
        var teamRank = 1;
        for (var i=0; i<userPrefs.length; i++){
            const team = await Teams.findTeamByName(userPrefs[i]);            
            const isInGroup = await Teams.isInGroup(team.teamID, groupID);
            if (isInGroup){
                const sqlRank = sqlString.format(`SELECT * FROM rankings WHERE teamID=? AND userID= ?;`, [team.teamID, userID]); 
                const resp1 = await database.query(sqlRank);
                if (resp1.length != 0) { //the entry already exists
                    const updateRank = sqlString.format(`UPDATE rankings SET teamRankingByUser = ? WHERE teamID=? AND userID= ?;`, [teamRank, team.teamID, userID]);
                    await database.query(updateRank);
                }
                else{
                    const insertRank = sqlString.format(`INSERT INTO rankings (teamID, userID, teamRankingByUser) VALUES (?,?,?);`, [team.teamID, userID, teamRank]);
                    await database.query(insertRank);
                }
            }
            teamRank++;
          }
      }
    } catch (error) { throw error; }
  }

   /**
   * Check if a User has already ranked the Teams in a particular Group
   * @param {number} userID - ID of the user 
   * @param {number} groupID - ID of the group the user is in
   * @returns {boolean} - True if the user has already ranked the teams
  */
 static async hasRankedTeams(userID, groupID){
   try{
    const sqlRank = sqlString.format(`SELECT * FROM rankings 
                                WHERE userID = ? 
                                AND teamRankingByUser IS NOT NULL 
                                AND teamID IN (SELECT teamID FROM teams WHERE teamgroupID = ?)`, [userID, groupID]);
    const response = await database.query(sqlRank);
    return response;
   } catch (error) {throw error; }
 }
 

  /**
  * Get all the Groups a User is in
  * @param {number} - userID
  * @return {Group[]} - a list of Group objects
  */
 static async groupsIn(userID) {
  try {
    
    const sql = sqlString.format(`SELECT groups.*
    FROM groups 
    INNER JOIN groupMembers ON groups.groupID = groupMembers.groupID
    INNER JOIN users ON groups.groupID = groupMembers.groupID AND groupMembers.memberID = users.userID
    WHERE users.userID =? ;`, [userID]);
    const response = await database.query(sql);
    for (var i=0; i< response.length; i++){
      const group= response[i];
      const groupAdmin = await database.query (sqlString.format(`SELECT username FROM users 
                        WHERE userID IN (SELECT adminID from groupAdmins WHERE groupID =?)`,[group.groupID]));
      group['groupAdminName'] = groupAdmin[0].username;
    }
    console.log('GROUPS IN', response);
    return response;
  } catch (error) { throw error; }
}

  /** 
   * Get information about the Groups a User is an admin of
   * @param {number} userID - ID of the user
   * @returns {Group[]} - a list of Group Objects. Keys are groupID, groupName, groupShort, signup, teams(a list of Team Objects)
   */
  static async getGroupInfo(userID) {
    try {
      console.log('USERID', userID);
      const sqlGroups = sqlString.format(`SELECT groups.*, users.username AS groupAdminName
                      FROM groups 
                      INNER JOIN groupAdmins ON groupAdmins.groupID = groups.groupID
                      INNER JOIN users ON groups.groupID= groupAdmins.groupID AND groupAdmins.adminID = users.userID
                      WHERE groups.groupID IN (SELECT groupID FROM groupAdmins WHERE adminID = ?)`, [userID]);
      const response = await database.query(sqlGroups);
      console.log(response);
      for (var i=0; i<response.length; i++){
        const group = response[i];
        const sqlTeams= sqlString.format(`SELECT teams.teamID, teams.teamName, teams.teamquota AS quota, teamLeads.leadID AS teamLeadID, users.username AS teamLeadUsername
                        FROM teams
                        INNER JOIN teamLeads ON teams.teamID = teamLeads.teamID
                        INNER JOIN users ON teams.teamID = teamLeads.teamID AND users.userID = teamLeads.leadID
                        WHERE teams.teamgroupID = ?`, [group.groupID]);
        const groupTeams = await database.query(sqlTeams);
        group['teams']= groupTeams;
      }
      console.log('GROUP INFO', response);
      return response;
    } catch (error) { throw error; }
  }

  /**	  
   * display all Announcemnts from the Groups/Teams a particular User is in	
   * @param {number} userID - ID of the user	
   * @return {Announcement[]} - a list of all the Announcement objects
   */	    
  
   static async displayAllAnnouncements(userID) {
   try {
    const sqlGroup = sqlString.format(`SELECT DISTINCT groupAnnouncements.*, users.username, groups.groupName
    FROM groupAnnouncements
    INNER JOIN users ON groupAnnouncements.announcerID = users.userID
    INNER JOIN groups ON groupAnnouncements.groupID = groups.groupID
    INNER JOIN groupMembers ON groupAnnouncements.groupID = groupMembers.groupID AND groupMembers.memberID = ?;`, [userID]);

    const groupResponse = await database.query(sqlGroup);
    for (var i=0; i < groupResponse.length; i++){
      const announcement = groupResponse[i];
      const sqlTags = sqlString.format(`SELECT announcementTag FROM groupAnnouncementsTags WHERE announcementID = ?`,[announcement.announcementID]);
      const tags = await database.query(sqlTags);
      const tagList =[];
      tags.forEach(elt => tagList.push(elt.tag));
      announcement['tags'] = tagList;
    }

    const sqlTeam = sqlString.format(`SELECT DISTINCT teamAnnouncements.*, users.username, teams.teamName, teams.teamgroupID, groups.groupName
    FROM teamAnnouncements
    INNER JOIN users ON teamAnnouncements.announcerID = users.userID
    INNER JOIN teams ON teamAnnouncements.teamID = teams.teamID
    INNER JOIN groups ON teamAnnouncements.teamID = teams.teamID AND teams.teamgroupID = groups.groupID
    INNER JOIN teamMembers ON teamAnnouncements.teamID = teamMembers.teamID AND teamMembers.memberID = ?;`, [userID]);

    const teamResponse = await database.query(sqlTeam);
    for (var i=0; i < teamResponse.length; i++){
      const announcement = teamResponse[i];
      const sqlTags = sqlString.format(`SELECT announcementTag FROM teamAnnouncementsTags WHERE announcementID = ?`,[announcement.announcementID]);
      const tags = await database.query(sqlTags);
      const tagList =[];
      tags.forEach(elt => tagList.push(elt.tag));
      announcement['tags'] = tagList;
    }

    return groupResponse.concat(teamResponse);
   } catch (error) {throw error;}
  }

   /**
   * Check if a User is a GroupExec of a given Group
   * @param {number} userID - ID of user to check
   * @param {number} groupID - ID of the group in question
   * @return {boolean} - True if the user is the Group's Exec 
   */
  static async isExecByGroupID(userID, groupID) {
    try {
      const sqlUser = sqlString.format(`SELECT * FROM groupAdmins WHERE adminID=? AND groupID=?;`,[userID, groupID]);
      const response = await database.query(sqlUser);
      return response.length != 0;
    } catch (error) { throw error; }
  }

  /**
   * Check if a User is a groupExec of the particular Group teamID is in
   * @param {number} userID - ID of user to check
   * @param {number} teamID - ID of the team
   * @return {boolean} - True if the user is the exec
   */
  static async isExecByTeamID(userID, teamID) {
    try {
      const sqlUser = sqlString.format(`SELECT * FROM groupAdmins 
                      WHERE adminID=? AND 
                      groupID IN (SELECT teamgroupID FROM teams WHERE teamID=?);`,[userID, teamID]);
      const response = await database.query(sqlUser);
      return response.length != 0;
    } catch (error) { throw error; }
  }

  /**
   * Check if a User is a GroupExec of any Group
   * @param {number} userID - ID of user to check
   * @return {boolean} - True if the user is an exec of ANY group
   */
  static async isExecOfAnyGroup(userID) {
    try {
      const sqlUser = sqlString.format(`SELECT * FROM groupAdmins WHERE adminID=?;`,[userID]);
      const response = await database.query(sqlUser);
      return response.length != 0;
    } catch (error) { throw error; }
  }

   /**
   * Check if a User is a member of a given Group
   * @param {string} userID - ID of user to check
   * @param {number} groupID - ID of the group in question
   * @return {boolean} - True if the user is a memeber of the Group 
   */
  static async isMember(userID, groupID) {
    try {
      const sqlUser = sqlString.format(`SELECT * FROM groupMembers WHERE memberID=? AND groupID=?;`, [userID, groupID]);
      const response = await database.query(sqlUser);
      return response.length != 0;
    } catch (error) { throw error; }
  }


}

module.exports = Users;
