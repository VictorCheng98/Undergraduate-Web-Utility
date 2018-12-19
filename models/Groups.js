const database = require('../database');

const sqlString = require('sqlstring');


/**
 * @class Groups
 * Contains methods that operate on the Group set
 */
class Groups {

   /**
   * Find a group by groupName.
   * @param {String} groupName - name of the group
   * @return {group | undefined} - found Group
   */
  static async findGroupByName(groupName) {
    try {
      const sql = sqlString.format(`SELECT * FROM groups WHERE groupName=?;`, [groupName]);
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }

  /**
   * Find a group by ID.
   * @param {number} groupID - ID of group to find
   * @return {group | undefined} - found Group
   */
  static async findGroupByID(groupID) {
    try {
      const sql = sqlString.format(`SELECT * FROM groups WHERE groupID=?;`,  [groupID]);
      const response = await database.query(sql);
      return response[0];
    } catch (error) { throw error; }
  }


   /**
   * Add a Group.
   * @param {number} userID - ID of User to requesting the add
   * @param {string} groupName - name of the group to be added
   * @param {string} groupShort - a group's short name
   * TO DO: insert phase here
   */
  static async addGroup(userID, groupName, groupShort) {
    console.log(groupShort);
    try {
      const sqlGroup = groupShort == undefined ? 
                      sqlString.format(`INSERT INTO groups (groupName) VALUES (?);`, [groupName]) :
                      sqlString.format(`INSERT INTO groups (groupName, groupShort) VALUES (?);`, [groupName, groupShort]);
      const response = await database.query(sqlGroup);
      const groupId = response.insertId;
      const sqlAdmin = sqlString.format(`INSERT INTO groupAdmins (groupID, adminID) VALUES (?, ?);`, [groupId, userID]);
      await database.query(sqlAdmin);
      const sqlMember = sqlString.format(`INSERT INTO groupMembers (groupID, memberID) VALUES (?, ?);`, [groupId, userID]);
      await database.query(sqlMember);

      return response;
    } catch (error) { throw error; }
  }

  /**
  * Delete a group
  * @param {name} groupID - ID of group to be deleted
  */
 static async deleteGroup(groupID) {
  try {
    const sqlDeleteGroup = sqlString.format(`DELETE * from groups WHERE groupID = ?;`, [groupID]);
    const response = await database.query(sqlDeleteGroup);
    return response;
  } catch (error) { throw error;}
}

/**
 * Join a Group.
 * @param {number} userID - ID of User to requesting to join
 * @param {string} groupName - name of the group to join
 */
static async joinGroup(userID, groupName) {
  try {
    const sqlGroup = sqlString.format(`SELECT groupID FROM groups WHERE groupName=?;`, [groupName]);
    const response = await database.query(sqlGroup);
    if (response.length != 0){
      const groupID = response[0].groupID;
      const memberExists = await database.query(sqlString.format(`SELECT * FROM groupMembers WHERE groupID=? AND memberID=?;`, [groupID, userID]));
      if (!memberExists.length){
          const sqlMember = sqlString.format(`INSERT INTO groupMembers (groupID, memberID) VALUES (?, ?);`, [groupID, userID]);
          await database.query(sqlMember);
      }
    } 
  } catch (error) { throw error; }
}


/**
* Adds a user to a Group
* @param {userID} - ID of the user to be added
* @param {groupID} - ID of the group the user is to be added to
*/
static async addMember(groupID, userID) {
  try {
    const sql = sqlString.format(`INSERT INTO groupMembers (groupID, memberID) VALUES (?, ?);`, [groupID], [userID]);
    const response = await database.query(sql);
    return response;
  } catch (error) {
    throw error;
  }
}
/**
* Find all the members in a Group
* @param {groupID} - ID of the group in question
* @returns {string[]} list of group member names
*/
static async getMembers(groupID) {
  try{
    const sqlMembers = sqlString.format(`SELECT username FROM users WHERE userID IN
    (SELECT memberID from groupMembers WHERE groupID= ?);`, [groupID]);
    const response = await database.query(sqlMembers);
    return response.map(elt => elt.username);
  }catch (error) {
    throw error;
  }
}

/**
* Find all the teams in a Group
* @param {groupID} - ID of the group in question
* @returns {string[]} list of teamnames in a group
*/
static async getTeams(groupID) {
  try{
    const sqlMembers = sqlString.format(`SELECT teamname FROM teams WHERE teamgroupID IN
    (SELECT groupID from groups WHERE groupID= ?);`, [groupID]);
    const response = await database.query(sqlMembers);
    return response.map(elt => elt.teamname);
  }catch (error) {
    throw error;
  }
}


/**
* Remove a User from a Group
* @param {memberID} - ID of the group member to be removed
* @param {groupID} - ID of the group
*/
static async removeMember(memberID, groupID) {
  try{
    const sqlMember = sqlString.format(`DELETE from groupMembers WHERE groupID= ? AND memberID= ?;`, [groupID, memberID]);
    await database.query(sqlMember);
  }catch (error) {
    throw error;
  }
}


  /**
   * Advance a Group from signUpPhase to matchingPhase .
   * @param {number} groupID - ID the group to be advanced
   */
  static async advanceGroup(groupID) {
    try {
      const inSignupPhase = sqlString.format(`UPDATE groups SET inSignupPhase = ? WHERE groupID= ?;`, [0, groupID]) ;
      const response = await database.query(inSignupPhase);
      return response; 
    } catch (error) { throw error; }
  }

    /**
   * Get a Group's phase
   * @param {number} groupID - ID the group
   * @return {boolean} - True if the Group is in signUp phase
   */
  static async getPhase(groupID) {
    try {
      const inSignupPhase = sqlString.format(`SELECT inSignupPhase FROM groups WHERE groupID= ?;`, [groupID]) ;
      const response = await database.query(inSignupPhase);
      //console.log(groupID, response[0]);
      return response[0].inSignupPhase == 0;
    } catch (error) { throw error; }
  }


  /**
   * Add a Group Announcement
   * @param {number} userID - ID of User adding the group announcement
   * @param {number} groupID - ID of the group
   * @param {string} timestamp - time of post
   * @param {string} announcement - the announcement 
   * @param {string[]} tags - a list of tags associated with the announcement
   */
  static async addGroupAnnouncement(userID, groupID, announcement, timestamp, tags) {
    try {
      const sqlAnnouncement = sqlString.format(`INSERT INTO groupAnnouncements (announcerID, text, groupID, timestamp) 
      VALUES (?, ?, ?, ?);`, [userID, announcement, groupID, timestamp]);
      const response = await database.query(sqlAnnouncement);
      const announcementID = response.insertId;
      for (var i= 0; i < tags.length; i++){
          const tag = tags[i];
          const sqlTag = sqlString.format(`INSERT INTO groupAnnouncementsTags (groupID, announcementID, announcementTag) 
          VALUES (?, ?, ?);`, [groupID ,announcementID ,tag]);
          await database.query(sqlTag);
      }  
    } catch (error) { throw error; }
  }

  
   /**
   * Edit a Group Announcement
   * @param {number} announcementID - ID of the announcement to edit
   * @param {string} announcement - the new announcement 
   */
  static async editGroupAnnouncement(announcementID, announcement) {
    try {
      const sqlAnnouncement = sqlString.format(`UPDATE groupAnnouncements SET text = ? WHERE announcementID=?;`, [announcement, announcementID]) ;
      const response = await database.query(sqlAnnouncement);
      return response
    } catch (error) { throw error; }
  }

  /**
   * Delete a Group Announcement
   * @param {number} announcementID - the announcement ID
   */
  static async deleteGroupAnnouncement(announcementID) {
    try {
      const sqlAnnouncement = sqlString.format(`DELETE FROM groupAnnouncements WHERE announcementID =?;`, [announcementID]);
      await database.query(sqlAnnouncement); 
    } catch (error) { throw error; }
  }


  /**
   * filter Group Announcemnts by Tags
   * @param {number} groupID - ID of the Group
   * @param {string[]} tags - a list of tags to search for
   * @return {GroupAnnouncement set()} - a set of GroupAnnouncement objects that have any of the tags in tags[]
   */
  static async filterGroupAnnouncementsByTag(groupID, tags) {
    try {
      const announcements = new Set();
      for (var i=0; i < tags.length; i++){
          const tag = tags[i];
          const sqlAnnouncement = sqlString.format(`SELECT * FROM groupAnnouncements WHERE announcementID IN 
          (SELECT announcementID FROM groupAnnouncementsTags WHERE announcementTag=? AND groupID=?);`, [tag, groupID]);
          const response = await database.query(sqlAnnouncement); //Team Announcement []
          if (response.length != 0){
            response.forEach(elt => announcements.add(elt));
          }  
      }
      return announcements;
    } catch (error) { throw error; }
  }


  /**
   * display all Group Announcemnts from the Group
   * @param {number} groupID - ID of the group
   * @return {GroupAnnouncement[]} - a list of all the GroupAnnouncement objects
   */
  static async displayAllGroupAnnouncements(groupID) {
    try {
      // const sqlAnnouncement = sqlString.format(`SELECT * from groupAnnouncements WHERE groupID = ?;`, [groupID]);
      const sqlAnnouncement = sqlString.format(`SELECT groupAnnouncements.* , users.username, groups.groupName
      FROM  groupAnnouncements 
      INNER JOIN  users ON groupAnnouncements.announcerID = users.userID
      INNER JOIN  groups ON groupAnnouncements.groupID = groups.groupID
      WHERE groups.groupID = ?
      ;`, [groupID]);
      const response = await database.query(sqlAnnouncement);
      // console.log('The response from database is: ');
      // console.log(response);
      for (var i=0; i < response.length; i++){
        const announcement = response[i];
        const sqlTags = sqlString.format(`SELECT announcementTag FROM groupAnnouncementsTags WHERE announcementID = ?`,[announcement.announcementID]);
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
   * Get each User's preference for Teams in a given Group 
   * @param {number} groupID - ID of the Group
   * @return {UserPrefs{}} -  UserPrefs Object {username: [list of teamNames in ascending order by ranking]} 
   */
  static async getUserPrefs(groupID) {
    try {
      const preferences = {}
      const sqlGroupMembers = sqlString.format(`SELECT * FROM groupMembers WHERE groupID = ?;`, [groupID]);
      const response = await database.query(sqlGroupMembers);

      for (var i=0; i < response.length; i++) {
         const member = response[i];
         const sqlPref = sqlString.format(`SELECT rankings.teamID, teams.teamName 
                          FROM rankings 
                          INNER JOIN teams ON rankings.teamID = teams.teamID
                          WHERE userID = ? AND rankings.teamID in (SELECT teamID FROM teams WHERE teamgroupID = ?)
                          ORDER BY teamRankingByUser;`, [member.memberID, groupID]);
         const userPref = await database.query(sqlPref);
         const memberIDToNameSql =  await database.query(sqlString.format(`SELECT username FROM users WHERE userID = ?;`, [member.memberID]));
         const memberName =memberIDToNameSql[0].username;
         preferences[memberName] = userPref.map(elt => elt.teamName);
      }
      console.log('USER PREFS:', preferences);
      return preferences;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Get each Team's preference for members in a given Group 
   * @param {number} groupID - ID of the Group
   * @return {TeamPrefs{}} -  TeamPrefs Object {teamName: [list of membernames in ascending order by ranking]} 
   */
  static async getTeamPrefs(groupID) {
    try {
      const preferences = {}
      const sqlGroupTeams = `SELECT * FROM teams WHERE teamgroupID = ${groupID};`;
      const response = await database.query(sqlGroupTeams);

      for (var i=0; i < response.length; i++) {
        const team = response[i];
        const sqlPref = sqlString.format(`SELECT rankings.teamID, users.userName 
                                     FROM rankings 
                                     INNER JOIN users ON rankings.userID = users.userID
                                     WHERE rankings.teamID = ?
                                     ORDER BY userRankingByTeam;`, [team.teamID]);
         const teamPref = await database.query(sqlPref);

         preferences[team.teamName] = teamPref.map(elt => elt.userName);
      }
      console.log('TEAM PREFS:', preferences);
      return preferences;
    } catch (error) {
      throw error;
    }
  }

/***
 * @param {Matches{}} matches - a matches dictionary with key=teamName and value= list of users assigned to the team
 */
  static async assignToTeams(matches) {
    try {
      console.log('MATCHES', matches);
      for (var teamName in matches) {
        if(!matches.hasOwnProperty(teamName)) continue;

        const sqlTeam = await database.query(sqlString.format(`SELECT teamID from teams WHERE teamName = ?;`, [teamName]));
        const teamID = sqlTeam[0].teamID;
        let assignedUsers = matches[teamName];

        for (var i =0; i < assignedUsers.length; i++) {
          const username = assignedUsers[i];
          const sqlUser = await database.query(sqlString.format(`SELECT userID FROM users WHERE username = ?;`, [username]));
          const userID = sqlUser[0].userID;
          console.log('USER', userID, 'TEAM', teamID);
          const addMemberSql = sqlString.format(`INSERT INTO teamMembers (teamID, memberID) VALUES (?, ?);`, [teamID, userID]);
          await database.query(addMemberSql);
        }
      }
      console.log('DONE')
    } catch (error) {
      throw error;
    }
  }

}
module.exports = Groups;