const mysql = require('mysql');

const config = {
  host: 'sql.mit.edu',
  user: 'lesian',
  password: 'kon00jen',
  database: 'lesian+final-project-ham',
  multipleStatements: 'true'
};

class Database {
  constructor(dbConfig) {
    this.connection = mysql.createPool(dbConfig);
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, rows) => {
        if (err) { return reject(err); }
        resolve(rows);
      });
    });
  }

  // This is a helper function to close a connection to the database.
  // The connection also closes when the program stops running.
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) { return reject( err ); }
        resolve();
      });
    });
  }

  async createTables() {
    /* Add code here, and uncomment the appropriate lines in bin/www, 
     * to create database tables when starting the application 
     * 
     * Hint: use CREATE TABLE IF NOT EXISTS
     */

    
    await this.query(`
      CREATE TABLE IF NOT EXISTS users(
        userID INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(30) NOT NULL UNIQUE, 
        password TEXT NOT NULL
      );`
    ).catch(err => console.log(err));

    // TODO FINAL
    // i commented out cuz i get an error when i run this .-.
    
    await this.query(`
      CREATE TABLE IF NOT EXISTS groups(
        groupID INT PRIMARY KEY AUTO_INCREMENT,
        groupName VARCHAR(30) NOT NULL UNIQUE,
        groupShort VARCHAR(30),
        inSignupPhase TINYINT(1) DEFAULT 1
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS teams(
        teamID INT PRIMARY KEY AUTO_INCREMENT,
        teamName VARCHAR(30) NOT NULL,
        teamquota INT,
        teamgroupID INT,
        FOREIGN KEY (teamgroupID) REFERENCES groups(groupID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS groupAdmins(
      groupID INT,
      adminID INT,
      FOREIGN KEY (groupID) REFERENCES groups(groupID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY (adminID) REFERENCES users(userID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      PRIMARY KEY (groupID, adminID)
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS groupMembers(
      groupID INT,
      memberID INT,
      FOREIGN KEY (groupID) REFERENCES groups(groupID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY (memberID) REFERENCES users(userID)
         ON UPDATE CASCADE
         ON DELETE CASCADE,
      PRIMARY KEY (groupID, memberID)
      );`
    ).catch(err => console.log(err));

    await this.query(`
    CREATE TABLE IF NOT EXISTS teamLeads(
     leadID INT,
     teamID INT,
     FOREIGN KEY (leadID) REFERENCES users(userID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
     FOREIGN KEY (teamID) REFERENCES teams(teamID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
     PRIMARY KEY (teamID, leadID)
     );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS teamMembers(
        teamID INT,
        memberID INT,
      FOREIGN KEY (memberID) REFERENCES users(userID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY (teamID) REFERENCES teams(teamID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      PRIMARY KEY (teamID, memberID)
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS teamAnnouncements(
        announcementID INT AUTO_INCREMENT PRIMARY KEY, 
        announcerID INT,
        text TEXT NOT NULL,
        teamID INT,
        timestamp VARCHAR(50),
      FOREIGN KEY (teamID, announcerID) REFERENCES teamLeads(teamID, leadID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS groupAnnouncements(
        announcementID INT AUTO_INCREMENT PRIMARY KEY, 
        announcerID INT,
        text TEXT NOT NULL,
        groupID INT,
        timestamp VARCHAR(50),
        FOREIGN KEY (groupID, announcerID) REFERENCES groupAdmins(groupID, adminID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS rankings(
        teamID INT,
        userID INT,
        userRankingByTeam INT,
        teamRankingByUser INT,
        FOREIGN KEY (teamID) REFERENCES teams(teamID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
        FOREIGN KEY (userID) REFERENCES users(userID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS groupAnnouncementsTags(
        groupID INT,
        announcementID INT,
        announcementTag VARCHAR(30),
        FOREIGN KEY (announcementID) REFERENCES groupAnnouncements(announcementID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));

    await this.query(`
      CREATE TABLE IF NOT EXISTS teamAnnouncementsTags(
        teamID INT,
        announcementID INT,
        announcementTag VARCHAR(30),
        FOREIGN KEY (announcementID) REFERENCES teamAnnouncements(announcementID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
      );`
    ).catch(err => console.log(err));
    
  }
}

const database = new Database(config);

module.exports = database;
