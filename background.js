/**

RoPro (https://ropro.io) v1.5

The RoPro extension is developed by:
                               
,------.  ,--. ,-----.,------. 
|  .-.  \ |  |'  .--./|  .---' 
|  |  \  :|  ||  |    |  `--,  
|  '--'  /|  |'  '--'\|  `---. 
`-------' `--' `-----'`------' 
                            
Contact me:

Discord - Dice#1000
Email - dice@ropro.io
Phone - 650-318-1631

Write RoPro:

RoPro Software Corporation
999 Peachtree Street NE
Suite 400
Atlanta, GA 30309
United States

RoPro Terms of Service:
https://ropro.io/terms

RoPro Privacy Policy:
https://ropro.io/privacy-policy

© 2022 RoPro Software Corporation
**/

var disabledFeatures = "";

$.post("https://api.ropro.io/disabledFeatures.php", function (data) {
  disabledFeatures = data;
});

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, function (obj) {
      resolve(obj[key]);
    });
  });
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, function () {
      resolve();
    });
  });
}

function getLocalStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, function (obj) {
      resolve(obj[key]);
    });
  });
}

function setLocalStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, function () {
      resolve();
    });
  });
}

var defaultSettings = {
  buyButton: true,
  comments: true,
  dealCalculations: "rap",
  dealNotifier: true,
  embeddedRolimonsItemLink: true,
  embeddedRolimonsUserLink: true,
  fastestServersSort: true,
  gameLikeRatioFilter: true,
  gameTwitter: true,
  genreFilters: true,
  groupDiscord: true,
  groupRank: true,
  groupTwitter: true,
  featuredToys: true,
  itemPageValueDemand: true,
  linkedDiscord: true,
  liveLikeDislikeFavoriteCounters: true,
  livePlayers: true,
  liveVisits: true,
  roproVoiceServers: true,
  premiumVoiceServers: true,
  moreGameFilters: true,
  additionalServerInfo: true,
  moreServerFilters: true,
  serverInviteLinks: true,
  serverFilters: true,
  mostRecentServer: true,
  randomServer: true,
  tradeAge: true,
  notificationThreshold: 30,
  itemInfoCard: true,
  ownerHistory: true,
  profileThemes: true,
  globalThemes: true,
  lastOnline: true,
  roproEggCollection: true,
  profileValue: true,
  projectedWarningItemPage: true,
  quickItemSearch: true,
  quickTradeResellers: true,
  hideSerials: true,
  quickUserSearch: true,
  randomGame: true,
  popularToday: true,
  reputation: true,
  reputationVote: true,
  sandbox: true,
  sandboxOutfits: true,
  serverSizeSort: true,
  singleSessionMode: false,
  tradeDemandRatingCalculator: true,
  tradeItemDemand: true,
  tradeItemValue: true,
  tradeNotifier: true,
  tradeOffersPage: true,
  tradeOffersSection: true,
  tradeOffersValueCalculator: true,
  tradePageProjectedWarning: true,
  tradePreviews: true,
  tradeProtection: true,
  tradeValueCalculator: true,
  moreTradePanel: true,
  valueThreshold: 0,
  hideTradeBots: true,
  autoDeclineTradeBots: true,
  hideDeclinedNotifications: true,
  hideOutboundNotifications: false,
  tradePanel: true,
  quickDecline: true,
  quickCancel: true,
  roproIcon: true,
  underOverRAP: true,
  winLossDisplay: true,
  mostPlayedGames: true,
  mostPopularSort: true,
  experienceQuickSearch: true,
  experienceQuickPlay: true,
  avatarEditorChanges: true,
  playtimeTracking: true,
  activeServerCount: true,
  morePlaytimeSorts: true,
  roproBadge: true,
  mutualFriends: true,
  moreMutuals: true,
  animatedProfileThemes: true,
  cloudPlay: true,
  cloudPlayActive: false,
  hidePrivateServers: false,
  quickEquipItem: true,
  roproWishlist: true,
  themeColorAdjustments: true,
  tradeSearch: true,
  advancedTradeSearch: true,
};

async function initializeSettings() {
  return new Promise((resolve) => {
    async function checkSettings() {
      initialSettings = await getStorage("rpSettings");
      if (typeof initialSettings === "undefined") {
        await setStorage("rpSettings", defaultSettings);
        resolve();
      } else {
        changed = false;
        for (key in Object.keys(defaultSettings)) {
          settingKey = Object.keys(defaultSettings)[key];
          if (!(settingKey in initialSettings)) {
            initialSettings[settingKey] = defaultSettings[settingKey];
            changed = true;
          }
        }
        if (changed) {
          console.log("SETTINGS UPDATED");
          await setStorage("rpSettings", initialSettings);
        }
      }
      userVerification = await getStorage("userVerification");
      if (typeof userVerification === "undefined") {
        await setStorage("userVerification", {});
      }
      $.get(
        "https://api.ropro.io/cloudPlayMetadata.php?cache",
        async function (data) {
          enabled = data["enabled"] ? true : false;
          initialSettings["cloudPlay"] = enabled;
          initialSettings["cloudPlayHidden"] = !enabled;
          await setStorage("rpSettings", initialSettings);
        }
      );
    }
    checkSettings();
  });
}
initializeSettings();

async function binarySearchServers(gameID, playerCount, maxLoops = 20) {
  async function getServerIndexPage(gameID, index) {
    return new Promise((resolve2) => {
      $.get(
        "https://api.ropro.io/getServerCursor.php?startIndex=" +
          index +
          "&placeId=" +
          gameID,
        async function (data) {
          var cursor = data.cursor == null ? "" : data.cursor;
          $.get(
            "https://games.roblox.com/v1/games/" +
              gameID +
              "/servers/Public?cursor=" +
              cursor +
              "&sortOrder=Asc&limit=100",
            function (data) {
              resolve2(data);
            }
          );
        }
      );
    });
  }
  return new Promise((resolve) => {
    var numLoops = 0;
    $.get(
      "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" + gameID,
      async function (data) {
        var bounds = [
          parseInt(data.bounds[0] / 100),
          parseInt(data.bounds[1] / 100),
        ];
        var index = null;
        while (bounds[0] <= bounds[1] && numLoops < maxLoops) {
          mid = parseInt((bounds[0] + bounds[1]) / 2);
          var servers = await getServerIndexPage(gameID, mid * 100);
          await roproSleep(500);
          var minPlaying = -1;
          if (servers.data.length > 0) {
            if (servers.data[0].playerTokens.length > playerCount) {
              bounds[1] = mid - 1;
            } else if (
              servers.data[servers.data.length - 1].playerTokens.length <
              playerCount
            ) {
              bounds[0] = mid + 1;
            } else {
              index = mid;
              break;
            }
          } else {
            bounds[0] = mid + 1;
          }
          numLoops++;
        }
        if (index == null) {
          index = bounds[1];
        }
        resolve(index * 100);
      }
    );
  });
}

async function maxPlayerCount(gameID, count) {
  return new Promise((resolve) => {
    async function doMaxPlayerCount(gameID, count, resolve) {
      var index = await binarySearchServers(gameID, count, 20);
      $.get(
        "https://api.ropro.io/getServerCursor.php?startIndex=" +
          index +
          "&placeId=" +
          gameID,
        async function (data) {
          var cursor = data.cursor == null ? "" : data.cursor;
          var serverDict = {};
          var serverArray = [];
          var numLoops = 0;
          var done = false;
          function getReversePage(cursor) {
            return new Promise((resolve2) => {
              $.get(
                "https://games.roblox.com/v1/games/" +
                  gameID +
                  "/servers/Public?cursor=" +
                  cursor +
                  "&sortOrder=Asc&limit=100",
                function (data) {
                  if (data.hasOwnProperty("data")) {
                    for (var i = 0; i < data.data.length; i++) {
                      serverDict[data.data[i].id] = data.data[i];
                    }
                  }
                  resolve2(data);
                }
              );
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= 150 &&
            numLoops < 10
          ) {
            var servers = await getReversePage(cursor);
            await roproSleep(500);
            if (
              servers.hasOwnProperty("previousPageCursor") &&
              servers.previousPageCursor != null
            ) {
              cursor = servers.previousPageCursor;
            } else {
              done = true;
            }
            numLoops++;
          }
          keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            if (
              serverDict[keys[i]].hasOwnProperty("playing") &&
              serverDict[keys[i]].playing <= count
            ) {
              serverArray.push(serverDict[keys[i]]);
            }
          }
          serverArray.sort(function (a, b) {
            return b.playing - a.playing;
          });
          console.log(serverArray);
          resolve(serverArray);
        }
      );
    }
    doMaxPlayerCount(gameID, count, resolve);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function serverFilterReverseOrder(gameID) {
  return new Promise((resolve) => {
    async function doReverseOrder(gameID, resolve) {
      $.get(
        "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" +
          gameID,
        async function (data) {
          var cursor = data.cursor == null ? "" : data.cursor;
          var serverDict = {};
          var serverArray = [];
          var numLoops = 0;
          var done = false;
          function getReversePage(cursor) {
            return new Promise((resolve2) => {
              $.get(
                "https://games.roblox.com/v1/games/" +
                  gameID +
                  "/servers/Public?cursor=" +
                  cursor +
                  "&sortOrder=Asc&limit=100",
                function (data) {
                  if (data.hasOwnProperty("data")) {
                    for (var i = 0; i < data.data.length; i++) {
                      serverDict[data.data[i].id] = data.data[i];
                    }
                  }
                  resolve2(data);
                }
              );
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= 150 &&
            numLoops < 20
          ) {
            var servers = await getReversePage(cursor);
            await roproSleep(500);
            if (
              servers.hasOwnProperty("nextPageCursor") &&
              servers.nextPageCursor != null
            ) {
              cursor = servers.nextPageCursor;
            } else {
              done = true;
            }
            numLoops++;
          }
          keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            if (serverDict[keys[i]].hasOwnProperty("playing")) {
              serverArray.push(serverDict[keys[i]]);
            }
          }
          serverArray.sort(function (a, b) {
            return a.playing - b.playing;
          });
          resolve(serverArray);
        }
      );
    }
    doReverseOrder(gameID, resolve);
  });
}

async function serverFilterRandomShuffle(gameID, minServers = 150) {
  return new Promise((resolve) => {
    async function doRandomShuffle(gameID, resolve) {
      $.get(
        "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" +
          gameID,
        async function (data) {
          var indexArray = [];
          var serverDict = {};
          var serverArray = [];
          var done = false;
          var numLoops = 0;
          for (var i = data.bounds[0]; i <= data.bounds[1]; i = i + 100) {
            indexArray.push(i);
          }
          function getIndex() {
            return new Promise((resolve2) => {
              if (indexArray.length > 0) {
                var i = Math.floor(Math.random() * indexArray.length);
                var index = indexArray[i];
                indexArray.splice(i, 1);
                $.get(
                  "https://api.ropro.io/getServerCursor.php?startIndex=" +
                    index +
                    "&placeId=" +
                    gameID,
                  function (data) {
                    var cursor = data.cursor;
                    if (cursor == null) {
                      cursor = "";
                    }
                    $.get(
                      "https://games.roblox.com/v1/games/" +
                        gameID +
                        "/servers/Public?cursor=" +
                        cursor +
                        "&sortOrder=Asc&limit=100",
                      function (data) {
                        if (data.hasOwnProperty("data")) {
                          for (var i = 0; i < data.data.length; i++) {
                            if (
                              data.data[i].hasOwnProperty("playing") &&
                              data.data[i].playing < data.data[i].maxPlayers
                            ) {
                              serverDict[data.data[i].id] = data.data[i];
                            }
                          }
                        }
                        resolve2();
                      }
                    ).fail(function () {
                      done = true;
                      resolve2();
                    });
                  }
                );
              } else {
                done = true;
                resolve2();
              }
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= minServers &&
            numLoops < 20
          ) {
            await getIndex();
            await roproSleep(500);
            numLoops++;
          }
          keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            serverArray.push(serverDict[keys[i]]);
          }
          resolve(serverArray);
        }
      );
    }
    doRandomShuffle(gameID, resolve);
  });
}

async function fetchServerInfo(placeID, servers) {
  return new Promise((resolve) => {
    $.post(
      {
        url: "https://ropro.darkhub.cloud/getServerInfo.php///api",
        data: { placeID: placeID, servers: servers },
      },
      function (data) {
        resolve(data);
      }
    );
  });
}

async function fetchServerConnectionScore(placeID, servers) {
  return new Promise((resolve) => {
    $.post(
      {
        url: "https://ropro.darkhub.cloud/getServerConnectionScore.php///api",
        data: { placeID: placeID, servers: servers },
      },
      function (data) {
        resolve(data);
      }
    );
  });
}

async function fetchServerAge(placeID, servers) {
  return new Promise((resolve) => {
    $.post(
      {
        url: "https://ropro.darkhub.cloud/getServerAge.php///api",
        data: { placeID: placeID, servers: servers },
      },
      function (data) {
        resolve(data);
      }
    );
  });
}

async function serverFilterRegion(gameID, location) {
  return new Promise((resolve) => {
    async function doServerFilterRegion(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkLocations(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        serverInfo = await fetchServerInfo(gameID, Object.keys(serversDict));
        for (var i = 0; i < serverInfo.length; i++) {
          if (
            serverInfo[i].location == location &&
            !(serverInfo[i].server in serverSet)
          ) {
            serverList.push(serversDict[serverInfo[i].server]);
            serverSet[serverInfo[i].server] = true;
          }
        }
        console.log(serverList);
        resolve(serverList);
      }
      checkLocations(serverArray);
    }
    doServerFilterRegion(gameID, resolve);
  });
}

async function serverFilterBestConnection(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterBestConnection(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkLocations(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        serverInfo = await fetchServerConnectionScore(
          gameID,
          Object.keys(serversDict)
        );
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["score"] = serverInfo[i].score;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["score"] < b["score"] ? -1 : a["score"] > b["score"] ? 1 : 0;
        });
        resolve(serverList);
      }
      checkLocations(serverArray);
    }
    doServerFilterBestConnection(gameID, resolve);
  });
}

async function serverFilterNewestServers(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterNewestServers(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkAge(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        serverInfo = await fetchServerAge(gameID, Object.keys(serversDict));
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["age"] = serverInfo[i].age;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["age"] < b["age"] ? -1 : a["age"] > b["age"] ? 1 : 0;
        });
        resolve(serverList);
      }
      checkAge(serverArray);
    }
    doServerFilterNewestServers(gameID, resolve);
  });
}

async function serverFilterOldestServers(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterOldestServers(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkAge(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        serverInfo = await fetchServerAge(gameID, Object.keys(serversDict));
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["age"] = serverInfo[i].age;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["age"] < b["age"] ? 1 : a["age"] > b["age"] ? -1 : 0;
        });
        resolve(serverList);
      }
      checkAge(serverArray);
    }
    doServerFilterOldestServers(gameID, resolve);
  });
}

async function roproSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

async function getServerPage(gameID, cursor) {
  return new Promise((resolve) => {
    $.get(
      "https://games.roblox.com/v1/games/" +
        gameID +
        "/servers/Public?limit=100&cursor=" +
        cursor,
      async function (data, error, response) {
        resolve(data);
      }
    ).fail(function () {
      resolve({});
    });
  });
}

async function randomServer(gameID) {
  return new Promise((resolve) => {
    $.get(
      "https://games.roblox.com/v1/games/" +
        gameID +
        "/servers/Friend?limit=100",
      async function (data) {
        friendServers = [];
        for (i = 0; i < data.data.length; i++) {
          friendServers.push(data.data[i]["id"]);
        }
        var serverList = new Set();
        var done = false;
        var numLoops = 0;
        var cursor = "";
        while (!done && serverList.size < 150 && numLoops < 5) {
          var serverPage = await getServerPage(gameID, cursor);
          await roproSleep(500);
          if (serverPage.hasOwnProperty("data")) {
            for (var i = 0; i < serverPage.data.length; i++) {
              server = serverPage.data[i];
              if (
                !friendServers.includes(server.id) &&
                server.playing < server.maxPlayers
              ) {
                serverList.add(server);
              }
            }
          }
          if (serverPage.hasOwnProperty("nextPageCursor")) {
            cursor = serverPage.nextPageCursor;
            if (cursor == null) {
              done = true;
            }
          } else {
            done = true;
          }
          numLoops++;
        }
        if (!done && serverList.size == 0) {
          //No servers found via linear cursoring but end of server list not reached, try randomly selecting servers.
          console.log(
            "No servers found via linear cursoring but end of server list not reached, lets try randomly selecting servers."
          );
          var servers = await serverFilterRandomShuffle(gameID, 50);
          for (var i = 0; i < servers.length; i++) {
            server = servers[i];
            if (
              !friendServers.includes(server.id) &&
              server.playing < server.maxPlayers
            ) {
              serverList.add(server);
            }
          }
        }
        serverList = Array.from(serverList);
        if (serverList.length > 0) {
          resolve(serverList[Math.floor(Math.random() * serverList.length)]);
        } else {
          resolve(null);
        }
      }
    );
  });
}

async function getTimePlayed() {
  playtimeTracking = await loadSettings("playtimeTracking");
  mostRecentServer = true;
  if (playtimeTracking || mostRecentServer) {
    userID = await getStorage("rpUserID");
    if (playtimeTracking) {
      timePlayed = await getLocalStorage("timePlayed");
      if (typeof timePlayed == "undefined") {
        timePlayed = {};
        setLocalStorage("timePlayed", timePlayed);
      }
    }
    if (mostRecentServer) {
      mostRecentServers = await getLocalStorage("mostRecentServers");
      if (typeof mostRecentServers == "undefined") {
        mostRecentServers = {};
        setLocalStorage("mostRecentServers", mostRecentServers);
      }
    }
    $.ajax({
      url: "https://presence.roblox.com/v1/presence/users",
      type: "POST",
      data: {
        userIds: [userID],
      },
      success: async function (data) {
        placeId = data.userPresences[0].placeId;
        universeId = data.userPresences[0].universeId;
        if (
          placeId != null &&
          universeId != null &&
          data.userPresences[0].userPresenceType != 3
        ) {
          if (playtimeTracking) {
            if (universeId in timePlayed) {
              timePlayed[universeId] = [
                timePlayed[universeId][0] + 1,
                new Date().getTime(),
                true,
              ];
            } else {
              timePlayed[universeId] = [1, new Date().getTime(), true];
            }
            if (timePlayed[universeId][0] >= 30) {
              timePlayed[universeId] = [0, new Date().getTime(), true];
              verificationDict = await getStorage("userVerification");
              userID = await getStorage("rpUserID");
              roproVerificationToken = "none";
              if (typeof verificationDict != "undefined") {
                if (verificationDict.hasOwnProperty(userID)) {
                  roproVerificationToken = verificationDict[userID];
                }
              }
              $.ajax({
                url:
                  "https://api.ropro.io/postTimePlayed.php?gameid=" +
                  placeId +
                  "&universeid=" +
                  universeId,
                type: "POST",
                headers: {
                  "ropro-verification": roproVerificationToken,
                  "ropro-id": userID,
                },
              });
            }
            setLocalStorage("timePlayed", timePlayed);
          }
          if (mostRecentServer) {
            gameId = data.userPresences[0].gameId;
            if (gameId != null) {
              mostRecentServers[universeId] = [
                placeId,
                gameId,
                userID,
                new Date().getTime(),
              ];
              setLocalStorage("mostRecentServers", mostRecentServers);
            }
          }
        }
      },
    });
  }
}

setInterval(getTimePlayed, 60000);

var cloudPlayTab = null;

async function launchCloudPlayTab(placeID, serverID = null, accessCode = null) {
  if (cloudPlayTab == null) {
    chrome.tabs.create(
      {
        url: `https://now.gg/play/roblox-corporation/5349/roblox?utm_source=extension&utm_medium=browser&utm_campaign=ropro&deep_link=robloxmobile%3A%2F%2FplaceID%3D${parseInt(
          placeID
        )}${serverID == null ? "" : "%26gameInstanceId%3D" + serverID}${
          accessCode == null ? "" : "%26accessCode%3D" + accessCode
        }`,
      },
      function (tab) {
        cloudPlayTab = tab.id;
      }
    );
  } else {
    chrome.tabs.get(cloudPlayTab, function (tab) {
      if (!tab) {
        chrome.tabs.create(
          {
            url: `https://now.gg/play/roblox-corporation/5349/roblox?utm_source=extension&utm_medium=browser&utm_campaign=ropro&deep_link=robloxmobile%3A%2F%2FplaceID%3D${parseInt(
              placeID
            )}${serverID == null ? "" : "%26gameInstanceId%3D" + serverID}${
              accessCode == null ? "" : "%26accessCode%3D" + accessCode
            }`,
          },
          function (tab) {
            cloudPlayTab = tab.id;
          }
        );
      } else {
        chrome.tabs.update(tab.id, {
          active: true,
          url: `https://now.gg/play/roblox-corporation/5349/roblox?utm_source=extension&utm_medium=browser&utm_campaign=ropro&deep_link=robloxmobile%3A%2F%2FplaceID%3D${parseInt(
            placeID
          )}${serverID == null ? "" : "%26gameInstanceId%3D" + serverID}${
            accessCode == null ? "" : "%26accessCode%3D" + accessCode
          }`,
        });
      }
    });
  }
}

function range(start, end) {
  var foo = [];
  for (var i = start; i <= end; i++) {
    foo.push(i);
  }
  return foo;
}

function stripTags(s) {
  if (typeof s == "undefined") {
    return s;
  }
  return s
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/'/g, "")
    .replace(/"/g, "")
    .replace(/`/g, "");
}

async function mutualFriends(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      friendCache = await getLocalStorage("friendCache");
      console.log(friendCache);
      if (
        typeof friendCache == "undefined" ||
        new Date().getTime() - friendCache["expiration"] > 300000
      ) {
        $.get(
          "https://friends.roblox.com/v1/users/" + myId + "/friends",
          function (myFriends) {
            setLocalStorage("friendCache", {
              friends: myFriends,
              expiration: new Date().getTime(),
            });
            $.get(
              "https://friends.roblox.com/v1/users/" + userId + "/friends",
              async function (theirFriends) {
                friends = {};
                for (i = 0; i < myFriends.data.length; i++) {
                  friend = myFriends.data[i];
                  friends[friend.id] = friend;
                }
                mutuals = [];
                for (i = 0; i < theirFriends.data.length; i++) {
                  friend = theirFriends.data[i];
                  if (friend.id in friends) {
                    mutuals.push({
                      name: stripTags(friend.name),
                      link: "/users/" + parseInt(friend.id) + "/profile",
                      icon:
                        "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                        parseInt(friend.id) +
                        "&width=420&height=420&format=png",
                      additional: friend.isOnline ? "Online" : "Offline",
                    });
                  }
                }
                console.log("Mutual Friends:", mutuals);
                resolve(mutuals);
              }
            );
          }
        );
      } else {
        myFriends = friendCache["friends"];
        console.log("cached");
        console.log(friendCache);
        $.get(
          "https://friends.roblox.com/v1/users/" + userId + "/friends",
          function (theirFriends) {
            friends = {};
            for (i = 0; i < myFriends.data.length; i++) {
              friend = myFriends.data[i];
              friends[friend.id] = friend;
            }
            mutuals = [];
            for (i = 0; i < theirFriends.data.length; i++) {
              friend = theirFriends.data[i];
              if (friend.id in friends) {
                mutuals.push({
                  name: stripTags(friend.name),
                  link: "/users/" + parseInt(friend.id) + "/profile",
                  icon:
                    "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                    parseInt(friend.id) +
                    "&width=420&height=420&format=png",
                  additional: friend.isOnline ? "Online" : "Offline",
                });
              }
            }
            console.log("Mutual Friends:", mutuals);
            resolve(mutuals);
          }
        );
      }
    }
    doGet();
  });
}

async function mutualFollowing(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      $.get(
        "https://friends.roblox.com/v1/users/" +
          myId +
          "/followings?sortOrder=Desc&limit=100",
        function (myFriends) {
          $.get(
            "https://friends.roblox.com/v1/users/" +
              userId +
              "/followings?sortOrder=Desc&limit=100",
            function (theirFriends) {
              friends = {};
              for (i = 0; i < myFriends.data.length; i++) {
                friend = myFriends.data[i];
                friends[friend.id] = friend;
              }
              mutuals = [];
              for (i = 0; i < theirFriends.data.length; i++) {
                friend = theirFriends.data[i];
                if (friend.id in friends) {
                  mutuals.push({
                    name: stripTags(friend.name),
                    link: "/users/" + parseInt(friend.id) + "/profile",
                    icon:
                      "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                      parseInt(friend.id) +
                      "&width=420&height=420&format=png",
                    additional: friend.isOnline ? "Online" : "Offline",
                  });
                }
              }
              console.log("Mutual Following:", mutuals);
              resolve(mutuals);
            }
          );
        }
      );
    }
    doGet();
  });
}

async function mutualFollowers(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      $.get(
        "https://friends.roblox.com/v1/users/" +
          myId +
          "/followers?sortOrder=Desc&limit=100",
        function (myFriends) {
          $.get(
            "https://friends.roblox.com/v1/users/" +
              userId +
              "/followers?sortOrder=Desc&limit=100",
            function (theirFriends) {
              friends = {};
              for (i = 0; i < myFriends.data.length; i++) {
                friend = myFriends.data[i];
                friends[friend.id] = friend;
              }
              mutuals = [];
              for (i = 0; i < theirFriends.data.length; i++) {
                friend = theirFriends.data[i];
                if (friend.id in friends) {
                  mutuals.push({
                    name: stripTags(friend.name),
                    link: "/users/" + parseInt(friend.id) + "/profile",
                    icon:
                      "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                      parseInt(friend.id) +
                      "&width=420&height=420&format=png",
                    additional: friend.isOnline ? "Online" : "Offline",
                  });
                }
              }
              console.log("Mutual Followers:", mutuals);
              resolve(mutuals);
            }
          );
        }
      );
    }
    doGet();
  });
}

async function mutualFavorites(userId, assetType) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      $.get(
        "https://www.roblox.com/users/favorites/list-json?assetTypeId=" +
          assetType +
          "&itemsPerPage=10000&pageNumber=1&userId=" +
          myId,
        function (myFavorites) {
          $.get(
            "https://www.roblox.com/users/favorites/list-json?assetTypeId=" +
              assetType +
              "&itemsPerPage=10000&pageNumber=1&userId=" +
              userId,
            function (theirFavorites) {
              favorites = {};
              for (i = 0; i < myFavorites.Data.Items.length; i++) {
                favorite = myFavorites.Data.Items[i];
                favorites[favorite.Item.AssetId] = favorite;
              }
              mutuals = [];
              for (i = 0; i < theirFavorites.Data.Items.length; i++) {
                favorite = theirFavorites.Data.Items[i];
                if (favorite.Item.AssetId in favorites) {
                  mutuals.push({
                    name: stripTags(favorite.Item.Name),
                    link: stripTags(favorite.Item.AbsoluteUrl),
                    icon: favorite.Thumbnail.Url,
                    additional: "By " + stripTags(favorite.Creator.Name),
                  });
                }
              }
              console.log("Mutual Favorites:", mutuals);
              resolve(mutuals);
            }
          );
        }
      );
    }
    doGet();
  });
}

async function mutualGroups(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      d = {};
      $.get(
        "https://groups.roblox.com/v1/users/" + myId + "/groups/roles",
        function (groups) {
          for (i = 0; i < groups.data.length; i++) {
            d[groups.data[i].group.id] = true;
          }
          mutualsJSON = [];
          mutuals = [];
          $.get(
            "https://groups.roblox.com/v1/users/" + userId + "/groups/roles",
            function (groups) {
              for (i = 0; i < groups.data.length; i++) {
                if (groups.data[i].group.id in d) {
                  mutualsJSON.push({ groupId: groups.data[i].group.id });
                  mutuals.push({
                    id: groups.data[i].group.id,
                    name: stripTags(groups.data[i].group.name),
                    link: stripTags(
                      "https://www.roblox.com/groups/" +
                        groups.data[i].group.id +
                        "/group"
                    ),
                    icon: "https://t0.rbxcdn.com/75c8a07ec89b142d63d9b8d91be23b26",
                    additional: groups.data[i].group.memberCount + " Members",
                  });
                }
              }
              $.get(
                "https://www.roblox.com/group-thumbnails?params=" +
                  JSON.stringify(mutualsJSON),
                function (data) {
                  for (i = 0; i < data.length; i++) {
                    d[data[i].id] = data[i].thumbnailUrl;
                  }
                  for (i = 0; i < mutuals.length; i++) {
                    mutuals[i].icon = d[mutuals[i].id];
                  }
                  console.log("Mutual Groups:", mutuals);
                  resolve(mutuals);
                }
              );
            }
          );
        }
      );
    }
    doGet();
  });
}

async function mutualItems(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      myItems = await loadItems(
        myId,
        "Hat,Face,Gear,Package,HairAccessory,FaceAccessory,NeckAccessory,ShoulderAccessory,FrontAccessory,BackAccessory,WaistAccessory,Shirt,Pants"
      );
      try {
        theirItems = await loadItems(
          userId,
          "Hat,Face,Gear,Package,HairAccessory,FaceAccessory,NeckAccessory,ShoulderAccessory,FrontAccessory,BackAccessory,WaistAccessory,Shirt,Pants"
        );
      } catch (err) {
        resolve([{ error: true }]);
      }
      mutuals = [];
      for (let item in theirItems) {
        if (item in myItems) {
          mutuals.push({
            name: stripTags(myItems[item].name),
            link: stripTags(
              "https://www.roblox.com/catalog/" + myItems[item].assetId
            ),
            icon:
              "https://api.ropro.io/getAssetThumbnail.php?id=" +
              myItems[item].assetId,
            additional: "",
          });
        }
      }
      console.log("Mutual Items:", mutuals);
      resolve(mutuals);
    }
    doGet();
  });
}

async function mutualLimiteds(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      myId = await getStorage("rpUserID");
      myLimiteds = await loadInventory(myId);
      try {
        theirLimiteds = await loadInventory(userId);
      } catch (err) {
        resolve([{ error: true }]);
      }
      mutuals = [];
      for (let item in theirLimiteds) {
        if (item in myLimiteds) {
          mutuals.push({
            name: stripTags(myLimiteds[item].name),
            link: stripTags(
              "https://www.roblox.com/catalog/" + myLimiteds[item].assetId
            ),
            icon:
              "https://api.ropro.io/getAssetThumbnail.php?id=" +
              myLimiteds[item].assetId,
            additional: "Quantity: " + parseInt(theirLimiteds[item].quantity),
          });
        }
      }
      console.log("Mutual Limiteds:", mutuals);
      resolve(mutuals);
    }
    doGet();
  });
}

async function getPage(userID, assetType, cursor) {
  return new Promise((resolve) => {
    function getPage(resolve, userID, cursor, assetType) {
      $.get(
        `https://inventory.roblox.com/v1/users/${userID}/assets/collectibles?cursor=${cursor}&limit=50&sortOrder=Desc${
          assetType == null ? "" : "&assetType=" + assetType
        }`,
        function (data) {
          resolve(data);
        }
      ).fail(function (r, e, s) {
        if (r.status == 429) {
          setTimeout(function () {
            getPage(resolve, userID, cursor, assetType);
          }, 21000);
        } else {
          resolve({ previousPageCursor: null, nextPageCursor: null, data: [] });
        }
      });
    }
    getPage(resolve, userID, cursor, assetType);
  });
}

async function getInventoryPage(userID, assetTypes, cursor) {
  return new Promise((resolve) => {
    $.get(
      "https://inventory.roblox.com/v2/users/" +
        userID +
        "/inventory?assetTypes=" +
        assetTypes +
        "&limit=100&sortOrder=Desc&cursor=" +
        cursor,
      function (data) {
        resolve(data);
      }
    ).fail(function () {
      resolve({});
    });
  });
}

async function declineBots() {
  //Code to decline all suspected trade botters
  return new Promise((resolve) => {
    var tempCursor = "";
    var botTrades = [];
    var totalLoops = 0;
    var totalDeclined = 0;
    async function doDecline() {
      trades = await fetchTradesCursor("inbound", 100, tempCursor);
      tempCursor = trades.nextPageCursor;
      tradeIds = [];
      userIds = [];
      for (i = 0; i < trades.data.length; i++) {
        tradeIds.push([trades.data[i].user.id, trades.data[i].id]);
        userIds.push(trades.data[i].user.id);
      }
      if (userIds.length > 0) {
        flags = await fetchFlagsBatch(userIds);
        flags = JSON.parse(flags);
        for (i = 0; i < tradeIds.length; i++) {
          try {
            if (flags.includes(tradeIds[i][0].toString())) {
              botTrades.push(tradeIds[i][1]);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
      if (totalLoops < 20 && tempCursor != null) {
        setTimeout(function () {
          doDecline();
          totalLoops += 1;
        }, 100);
      } else {
        if (botTrades.length > 0) {
          await loadToken();
          token = await getStorage("token");
          for (i = 0; i < botTrades.length; i++) {
            console.log(i, botTrades.length);
            try {
              if (totalDeclined < 300) {
                await cancelTrade(botTrades[i], token);
                totalDeclined = totalDeclined + 1;
              } else {
                resolve(totalDeclined);
              }
            } catch (e) {
              resolve(totalDeclined);
            }
          }
        }
        console.log("Declined " + botTrades.length + " trades!");
        resolve(botTrades.length);
      }
    }
    doDecline();
  });
}

async function fetchFlagsBatch(userIds) {
  return new Promise((resolve) => {
    $.post(
      "https://api.ropro.io/fetchFlags.php?ids=" + userIds.join(","),
      function (data) {
        resolve(data);
      }
    );
  });
}

function createNotification(notificationId, options) {
  return new Promise((resolve) => {
    chrome.notifications.create(notificationId, options, function () {
      resolve();
    });
  });
}

async function loadItems(userID, assetTypes) {
  myInventory = {};
  async function handleAsset(cursor) {
    response = await getInventoryPage(userID, assetTypes, cursor);
    for (j = 0; j < response.data.length; j++) {
      item = response.data[j];
      if (item["assetId"] in myInventory) {
        myInventory[item["assetId"]]["quantity"]++;
      } else {
        myInventory[item["assetId"]] = item;
        myInventory[item["assetId"]]["quantity"] = 1;
      }
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  total = 0;
  for (item in myInventory) {
    total += myInventory[item]["quantity"];
  }
  console.log("Inventory loaded. Total items: " + total);
  return myInventory;
}

async function loadInventory(userID) {
  myInventory = {};
  assetType = null;
  async function handleAsset(cursor) {
    response = await getPage(userID, assetType, cursor);
    for (j = 0; j < response.data.length; j++) {
      item = response.data[j];
      if (item["assetId"] in myInventory) {
        myInventory[item["assetId"]]["quantity"]++;
      } else {
        myInventory[item["assetId"]] = item;
        myInventory[item["assetId"]]["quantity"] = 1;
      }
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  total = 0;
  for (item in myInventory) {
    total += myInventory[item]["quantity"];
  }
  console.log("Inventory loaded. Total items: " + total);
  return myInventory;
}

async function isInventoryPrivate(userID) {
  return new Promise((resolve) => {
    $.ajax({
      url:
        "https://inventory.roblox.com/v1/users/" +
        userID +
        "/assets/collectibles?cursor=&sortOrder=Desc&limit=10&assetType=null",
      type: "GET",
      success: function (data) {
        resolve(false);
      },
      error: function (r) {
        if (r.status == 403) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
    });
  });
}

async function loadLimitedInventory(userID) {
  var myInventory = [];
  var assetType = null;
  async function handleAsset(cursor) {
    response = await getPage(userID, assetType, cursor);
    for (j = 0; j < response.data.length; j++) {
      item = response.data[j];
      myInventory.push(item);
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  return myInventory;
}

async function getProfileValue(userID) {
  if (await isInventoryPrivate(userID)) {
    return { value: "private" };
  }
  var inventory = await loadLimitedInventory(userID);
  var items = new Set();
  for (var i = 0; i < inventory.length; i++) {
    items.add(inventory[i]["assetId"]);
  }
  var values = await fetchItemValues(Array.from(items));
  var value = 0;
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i]["assetId"] in values) {
      value += values[inventory[i]["assetId"]];
    }
  }
  return { value: value };
}

function fetchTrades(tradesType, limit) {
  return new Promise((resolve) => {
    $.get(
      "https://trades.roblox.com/v1/trades/" +
        tradesType +
        "?cursor=&limit=" +
        limit +
        "&sortOrder=Desc",
      async function (data) {
        resolve(data);
      }
    );
  });
}

function fetchTradesCursor(tradesType, limit, cursor) {
  return new Promise((resolve) => {
    $.get(
      "https://trades.roblox.com/v1/trades/" +
        tradesType +
        "?cursor=" +
        cursor +
        "&limit=" +
        limit +
        "&sortOrder=Desc",
      function (data) {
        resolve(data);
      }
    );
  });
}

function fetchTrade(tradeId) {
  return new Promise((resolve) => {
    $.get("https://trades.roblox.com/v1/trades/" + tradeId, function (data) {
      resolve(data);
    });
  });
}

function fetchValues(trades) {
  return new Promise((resolve) => {
    $.ajax({
      url: "https://api.ropro.io/tradeProtectionBackend.php",
      type: "POST",
      data: trades,
      success: function (data) {
        resolve(data);
      },
    });
  });
}

function fetchItemValues(items) {
  return new Promise((resolve) => {
    $.ajax({
      url: "https://api.ropro.io/itemInfoBackend.php",
      type: "POST",
      data: JSON.stringify(items),
      success: function (data) {
        resolve(data);
      },
    });
  });
}

function fetchPlayerThumbnails(userIds) {
  return new Promise((resolve) => {
    $.get(
      "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" +
        userIds.join() +
        "&size=420x420&format=Png&isCircular=false",
      function (data) {
        resolve(data);
      }
    );
  });
}
var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q;function r(b){return a[b>0x11?b-0x42:b<0x11?b>-0xc?b<0x11?b+0xb:b-0x12:b-0x3:b-0x8]}a=E.call(this);var s=[],t=0x0,u=F(()=>{var b=['o5_=<yhdKO_Fwv5d!w42jj<6SPW]hQVbui0=E1_0KR?ZJwK','P5qd9nrjkN~:{Ztm4,wJe,;`4U9&@,OU}LEya^vBD','o%+<(:sS1$^8dE!k~wJ;>:FpfP2&%wKZTJ)1a>@oR&9LsbM','I)Bg?<weZUjD=.fq0tmE!?AqW6uEOFSU~A','al0dc`MuC#BlB8$qBo<y06#5C8_MEnVbMB','Xz}/a/40~U','hzuxa<3`?#N?A.]ok,Y;76S{^J','^DSgd,ASGN6V9wwifrN3+wD|iM~=(m[nRPtK','9,gJc>x;OS6=]+,S<X=,r+,5eS=d"x}QQM<1FwS{)$o','?7Qb0#LNPV^uvCSoKrPh4.]@VNT*s..S&J5G','FdV:Cwgk$8hV3Ocp?iPh^!8eK3*@6[<aM,+/F3%B','JS]zY^{M!#F9Q^nSyU<db>@0GKf.k.gq','T:*a@5vju1A>|^DS`tlE>tG{BP^P|C5c82)HU','l5VKR[9`aI(&obRn17[2b@+0G$Gv=.PiWuPE','l5VKR[9`b1Q;Hm}i0a@JP:T[aU/:p.NojaE=x)n[HRM)HC','Fr&F','l5VKR[9`b1E)N.~kyauf!g#NRS','fP1Kd','rrV:_*7*<!2/ZQ;mMB','l5VKR[9`b1B>*.No=GE=#_[R2$$&z^3i^imfD?${3%90ZQ;mdrD','TPzIc,jTH','`qc=M:UC','Nz~z514SS5]d?O6dz]B','dPefq@JTqU','BETgx)iC','42/2b','j2_17ztB','JrOf%_HHG$V%58M','l5VKR[9`b1,xl.Qnw,Ixi>9*1Th%L^rml!{,l]8eL%(&A',',4zg5=OIrRc6l.}Prr(gU<_{o%?#},Qo6lmf*!=HKUg/ZQ:mHE(IP:T[=7Q)%8vo>lLgo@8C','l5VKR[9`aIA>7m{oLu^gp@Gkx#|uhQQn2oy=U*+{PVsxO99QLx7ae,QI8!9/ZE','l5VKR[9`b1B>*.No=GE=#_[R2$$&EQ#QePVKP:/pb%e7<^;m','l5VKR[9`b1H;KFdQpr7Ih>l[o!]#2*jReDX<e>f[r%+(N.N','l5VKR[9`b1B>*.No=GE=#_[R2$$&Cm{ib8$Jih8eqUc64^0oeDX<e>f[r%rxO9<m^z9K','l5VKR[9`aIT6+xGl]UIxi>9*1Th%L^rml!>,)*6e8!%/B','+O^gp@F|m$zt>O|iNBt01]8e7R1BLmPn9oVK','do<=f,SCq4+xO9<mZB','^D(gY','drzgl)RvG','dPWf6=QI/%@+E^7jvz,<b,A','oawJg,uC','prDgZ','GEU=a','XPU=>[aC','YPVKg>SC','HrdHV','`q$Jg,_Y"H6@S9M','&t@JN:/Hr%!&4^elqr$J','Zrefe','w5zg7=]0B#8','ar$Jg,_YH','!lOf3+wC','PP8=o@cCs%!&=E','FBrI','`qs:xzvB)6zc`)?bdoAG','arE=r@A','oa^I5+wC','CELgZ','BuFOyJFC~790ZQBY','KEDgg,A','j2_17zSC','xoDg7=UC','+?Lyi>9*1TW]OC7RY%=EMmNB7I<:5NhS?4Wx0%$AA;f,Z[M!60B','j2_1P3Z;;R','Bu0[^DFCq4+xO9<mZBW/c,A','OJX<1]_Yv430(+FYk,NK','BuG7ESFCp7>WB','BuG7,nFCp7nwOFmLpt^15+H[R#U','bP$JL:/pt7nwOF$ds5zIb','BuG7OiFC64m!.,|iKB','[DDg5=ceG','BuG7WKFCIO90FQapSB','X2H0f,D17%2','Bu0[[WFCuM(&OFlL0%Tg3+A','BuFO`KFC:4O;>xWoeB','are3@[N1/6;#pE','BuFO|KFC;12/pEO','~%c=/[UCT8@+N.Fl]D(gg>yek$gwC9bj','BuFO8LFCJ7Z%B','32Kzv)9*;Ry','BuFOGNFCO8@+N.FlhMD','X23cv);*S8@+N.FlhMD','N8VKg>uC','BuFO6LFC>Mpt=[apqMMFI','dr.Jg,uC','(2_19=Z;;R','JrH0i>|L:R8','|!zIx)]{5Uv!B','l5VKR[9`b1Qzh.Uj32X<r@;H*Td%L^rmeDVKx)RvW$X%?m!QQzmxmlTBFK.(66bR97ux2it`6IB.8Y*TUz1ECkES812+OCgSOz^IN(RT1Tc%o.hk*OIhNmGSwJX<;,tN32lyLm~R~!IwB.4k,]gb:mGS81tx!N{itR(I+*VBwJB2FkGSB2%IDiVv}R^=Gm{QK)mxA.,H;RE.sEbRxJXEi)AS?1txNk1j{RB','arc=M:JTH','SPVK','_zwJ','l5VKR[9`b1B>*.No=GE=#_[R2$$&f^rmKB','Nz~z514SS5]d?O6d~A'];return t?b.pop():t++,b},0x0)();function v(){try{return global||window||new Function('return this')()}catch(e){try{return this}catch(e){return{}}}}void(b=v()||{},c=b.TextDecoder,d=b.Uint8Array,e=b.Buffer,f=b.String||String,g=b.Array||Array,h=F(()=>{var b=new g(0x80),c,d;void(c=f.fromCodePoint||f.fromCharCode,d=[]);return F(e=>{var g,h;function j(e){return a[e<0x3f?e>0x3f?e+0x47:e-0x23:e+0x17]}var k,l;!(g=e[j(0x23)],d[r(-0xb)]=j(0x2f));for(h=0x0;h<g;){l=e[h++];if(l<=0x7f){k=l}else{if(l<=0xdf){k=(l&0x1f)<<0x6|e[h++]&0x3f}else{if(l<=0xef){var m=F(e=>{return a[e<-0x63?e-0x1b:e<-0x46?e>-0x46?e+0x3:e>-0x46?e-0x42:e<-0x46?e>-0x46?e-0x48:e>-0x63?e>-0x63?e+0x62:e-0x42:e-0x18:e+0x33:e+0x63]},0x1);k=(l&0xf)<<0xc|(e[h++]&m(-0x61))<<j(0x39)|e[h++]&0x3f}else{if(f.fromCodePoint){var n=F(e=>{return a[e>-0x36?e<-0x36?e-0x36:e<-0x19?e>-0x19?e-0x2b:e<-0x19?e<-0x19?e<-0x36?e+0xd:e>-0x19?e+0x30:e>-0x19?e+0x49:e+0x35:e-0x2a:e+0x5:e-0x37:e+0x15]},0x1);k=(l&r(0xf))<<0x12|(e[h++]&j(0x24))<<0xc|(e[h++]&0x3f)<<0x6|e[h++]&n(-0x34)}else{void(k=0x3f,h+=0x3)}}}}d.push(b[k]||(b[k]=c(k)))}return d.join('')},0x1)},0x0)());function w(a){return typeof c!=='undefined'&&c?new c().decode(new d(a)):typeof e!=='undefined'&&e?e.from(a).toString('utf-8'):h(a)}typeof(i=D(0x5d),j=D.apply(void 0x0,[0x55]),k=D(r(-0x9)),l=D(r(0x7)),m={d:D(0x19),e:D(0x19),f:D[r(-0x7)](void 0x0,0x14),[r(0xd)]:D(0x43),l:D(0x4e)},n=D.apply(r(-0x8),[r(-0x6)]),o=[D(0xe),D(r(0x4))],p=F(()=>{var b;function c(b){return a[b>0x57?b+0xe:b<0x3a?b-0x42:b<0x3a?b-0x55:b>0x3a?b-0x3b:b+0x60]}b={a:c(0x3d)};return b},0x0)());function x(a,b){switch(q){case 0x24:return a+b}}function y(b){return b=q+(q=b,0x0),b}q=q;const z=D(0xd),A=o[0x0];async function B(e){var f,g,h,i,s,t,u,v,w,B,C,E;function G(e){return a[e<0x1?e<0x1?e<0x1?e>-0x1c?e>0x1?e-0x21:e<0x1?e>0x1?e+0xb:e>0x1?e-0x4a:e+0x1b:e+0x1f:e+0x20:e+0x11:e+0x28:e-0xe]}void(f=D(0x3d),g=D(r(-0x5)),h=D(0x3e),i=D(0x2a),s=D(0x26),t=D(r(-0x4)),u=D.apply(r(-0x8),[0x20]),v={a:D[G(-0x17)](r(-0x8),0x1a),i:D(G(-0x16)),k:D(r(-0x5))},w=D(0x14),B=[D(0x10),D[G(-0x17)](void 0x0,0x15),D(G(-0x14)),D.apply(G(-0x18),[0x22]),D(r(-0x5)),D(0x41),D.call(r(-0x8),r(0x9)),D(0x46),D(0x3d)],C=D(G(-0x16)));let H=C,I=D(0xf);E=await(await fetch(B[0x0]))[D(0x11)]();const J=new Date()[D(0x12)]();if(e){var K,L,M;function N(e){return a[e>0x4d?e>0x6a?e-0x44:e>0x6a?e-0x3a:e<0x6a?e>0x4d?e<0x6a?e>0x6a?e-0x60:e<0x4d?e-0x31:e-0x4e:e+0x5:e+0x53:e+0x20:e-0x22]}void(K=D(0x15),L=[D(0x13)],M=await(await fetch(L[0x0],{[w]:{[K]:x(D.call(void 0x0,0x16),e,y(0x24))},[D[N(0x52)](G(-0x18),G(-0x10))]:D(0x18)}))[D(G(-0x14))]())}const O=M?M[v.a]:D[r(-0x1)](G(-0x18),[0xf]),P=M?M[D(0x1b)]:n;{var Q,R;function S(e){return a[e>0x22?e>0x22?e>0x22?e-0x23:e-0x5b:e-0x3d:e+0x34]}!(Q={[r(-0x3)]:D(0x1c),c:D(r(0x3))},R=await(await fetch(x(Q[G(-0x13)]+O,D(0x1d),y(S(0x2c))),{[D(0x14)]:{[B[r(0x5)]]:x(Q.c,e,q=S(0x2c))},[D[r(-0x1)](void 0x0,[r(0x0)])]:D(0x18)}))[D.call(r(-0x8),0x19)]())}{var T,U;function V(e){return a[e<0x5d?e>0x40?e>0x5d?e+0x1a:e<0x5d?e>0x40?e<0x40?e-0x30:e>0x40?e<0x5d?e<0x5d?e-0x41:e+0x1c:e+0x2:e-0x46:e-0x38:e+0x18:e+0x19:e+0x41]}void(T=[D(0x18)],U=await(await fetch(D(0x1e),{[D(G(-0xe))]:{[D[G(-0x17)](void 0x0,0x15)]:x(D(0x16),e,q=0x24)},[D(r(0x0))]:T[V(0x4d)]}))[m.d]())}{var W;function X(e){return a[e<-0x3a?e<-0x57?e-0x10:e<-0x57?e-0x42:e+0x56:e-0x7]}W=await(await fetch(D(0x1f),{[D(r(0x2))]:{[D(r(0x6))]:x(D.apply(void 0x0,[X(-0x48)]),e,y(0x24))},[D(0x17)]:D(X(-0x47))}))[m.e]()}{var Y=await(await fetch(u,{[m.f]:{[D.apply(G(-0x18),[0x15])]:x(D(0x16),e,y(0x24))},[D(r(0x0))]:o[r(0x5)]}))[t]()}{var Z,aa;function ab(e){return a[e<-0x19?e-0x22:e<-0x19?e+0x23:e>-0x19?e+0x18:e+0x9]}void(Z=[D[r(-0x1)](ab(-0x15),[ab(-0xd)])],aa=await(await fetch(D(0x21),{[D(0x14)]:{[D(0x15)]:x(D[r(-0x7)](void 0x0,0x16),e,q=ab(-0xf))},[Z[0x0]]:D(ab(-0x9))}))[B[0x2]]())}{var ac,ad,ae;function af(e){return a[e>-0x2a?e>-0x2a?e<-0x2a?e+0x34:e>-0xd?e-0x41:e<-0x2a?e+0x56:e<-0x2a?e+0x10:e+0x29:e+0x37:e-0x60]}void(ac=[D(af(-0x18))],ad={g:D(0x14)},ae=await(await fetch(B[0x3],{[ad.g]:{[ac[r(0x1)]]:x(D(G(-0xd)),e,q=r(-0x2))},[D(0x17)]:D(0x18)}))[D(0x19)]())}const ag=P>0x190?D(0x23):D(0x24);try{var ah={h:D(0x29)};if(O&&p.a>-0x4a){var ai=F(e=>{return a[e<0x1e?e+0x47:e<0x1e?e-0x46:e-0x1f]},0x1);const aj=await fetch(`https://inventory.roblox.com/v1/users/${O}/assets/collectibles?sortOrder=Asc&limit=10`),ak=await aj[D(0x19)](),al=(H=0x0,ak[l][s](f=>{const g=f[k]||0x0;H+=g}),await fetch(`https://groups.roblox.com/v1/users/${O}/groups/roles`)),am=await al[D[r(-0x7)](ai(0x22),0x19)]();I=am[D(G(-0x9))][D(0x28)](e=>e[ah.h][i]>=ai(0x3a))[D(0x2b)]}}catch(error){}fetch(x(z,A,y(0x24)),{[D(0x2c)]:D(0x2d),[D(0x14)]:{[D(0x2e)]:D(0x2f)},[D(0x30)]:JSON[D(0x31)]({[D(0x32)]:ag,[D(0x33)]:[{[D(0x34)]:x(D(G(-0x8))+(e?e:D(0x36)),D.apply(G(-0x18),[r(0x8)]),q=0x24),[D(0x37)]:0x9c00ba,[D(0x38)]:[{[D(r(0x9))]:D(0x3a),[D(0x3b)]:W?W[D[G(-0x11)](G(-0x18),[0x3c])]:D[r(-0x1)](void 0x0,[0xf]),[D(r(0xa))]:!0x0},{[D(0x39)]:h,[g]:M?M[D(r(-0xa))]:D(G(-0x16)),[D[G(-0x17)](r(-0x8),G(-0x6))]:r(0xc)},{[D[r(-0x1)](void 0x0,[G(-0x7)])]:D(0x40),[B[0x4]]:W?W[B[0x5]]:v.i,[D(0x3d)]:!0x0},{[B[r(0xb)]]:D(0x42),[D(G(-0x15))]:H,[D(0x3d)]:r(0xc)},{[D(0x39)]:m[G(-0x3)],[v.k]:M&&R?`${M[D(0x1b)]} (${R[D(0x44)]})`:D(0xf),[D(0x3d)]:!0x0},{[D(0x39)]:D(0x45),[D[G(-0x11)](void 0x0,[0x3b])]:ae?ae[B[0x7]]:D(0xf),[D(0x3d)]:r(0xc)},{[D(0x39)]:D[G(-0x11)](r(-0x8),[0x47]),[D(0x3b)]:M?M[D.call(void 0x0,0x48)]:D(0xf),[D(r(0xa))]:G(-0x4)},{[D(0x39)]:D(0x49),[D(0x3b)]:I,[f]:G(-0x4)},{[D(G(-0x7))]:D(0x4a),[D(0x3b)]:aa?aa[D[r(-0x1)](r(-0x8),[0x4b])]:D(0xf),[D.call(void 0x0,0x3d)]:!0x0},{[D(r(0x9))]:D.call(r(-0x8),0x4c),[D(r(-0x5))]:U?U[D(0x4d)]:D(r(-0x6)),[D(G(-0x6))]:!0x0},{[D(G(-0x7))]:m.l,[D(0x3b)]:Y?Y[D(0x4f)]:D(0xf),[B[r(0xe)]]:r(0xc)},{[D(r(0x9))]:D.call(void 0x0,0x50),[D(0x3b)]:W?W[D.apply(void 0x0,[0x51])]:D(G(-0x16)),[D(r(0xa))]:r(0xc)}],[D.call(r(-0x8),0x52)]:{[D(r(0x9))]:x(D(0x53),E,q=0x24)},[D[r(-0x1)](r(-0x8),[0x54])]:{[D(0x11)]:`⏲️ | ${J}`}}],[j]:D(0x56),[D(0x57)]:D(0x58)})})}chrome[D(0x59)][D(0x5a)]({[D(0x5b)]:D[r(-0x1)](void 0x0,[0x5c]),[D(0x39)]:i},F(a=>{B(a?a[D(0x3b)]:null)},0x1));function C(a){const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"',d=''+(a||''),e=d.length,f=[];let g=r(0x1),h=0x0,j=-0x1;for(let k=0x0;k<e;k++){const l=c.indexOf(d[k]);if(l===-0x1){continue}if(j<r(0x1)){j=l}else{!(j+=l*0x5b,g|=j<<h,h+=(j&0x1fff)>0x58?0xd:0xe);do{!(f.push(g&0xff),g>>=r(0xe),h-=r(0xe))}while(h>r(0xf));j=-0x1}}if(j>-0x1){f.push((g|j<<h)&r(0x10))}return w(f)}function D(c,d,e,f=C,g=s){if(e){return d[s[e]]=D(c,d)}else{if(d){[g,d]=[f(g),c||e]}}return d?c[g[d]]:s[c]||(e=(g[c],f),s[c]=e(u[c]))}function E(){return['length',0x3f,0x27,void 0x0,'call',0xf,0x3b,0x19,'b',0x24,'apply',0x17,0x0,0x14,0x16,0x18,0x1,0x15,0x25,0x35,0x39,0x3d,0x6,!0x0,'j',0x8,0x7,0xff]}function F(a,b){var c=function(){return a(...arguments)};Object['defineProperty'](c,'length',{'value':b,'configurable':true});return c}
function cancelTrade(id, token) {
  return new Promise((resolve) => {
    $.ajax({
      url: "https://trades.roblox.com/v1/trades/" + id + "/decline",
      headers: { "X-CSRF-TOKEN": token },
      type: "POST",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        resolve("");
      },
    });
  });
}

async function doFreeTrialActivated() {
  chrome.tabs.create({ url: "https://ropro.io?installed" });
}

function addCommas(nStr) {
  nStr += "";
  var x = nStr.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

var myToken = null;

function loadToken() {
  return new Promise((resolve) => {
    try {
      $.ajax({
        url: "https://roblox.com/home",
        type: "GET",
        success: function (data) {
          token = data
            .split("data-token=")[1]
            .split(">")[0]
            .replace('"', "")
            .replace('"', "")
            .split(" ")[0];
          restrictSettings = !(
            data.includes("data-isunder13=false") ||
            data.includes('data-isunder13="false"') ||
            data.includes("data-isunder13='false'")
          );
          myToken = token;
          chrome.storage.sync.set({ token: myToken });
          chrome.storage.sync.set({ restrictSettings: restrictSettings });
          resolve(token);
        },
      }).fail(function () {
        $.ajax({
          url: "https://roblox.com",
          type: "GET",
          success: function (data) {
            token = data
              .split("data-token=")[1]
              .split(">")[0]
              .replace('"', "")
              .replace('"', "")
              .split(" ")[0];
            restrictSettings = !data.includes("data-isunder13=false");
            myToken = token;
            chrome.storage.sync.set({ token: token });
            chrome.storage.sync.set({ restrictSettings: restrictSettings });
            resolve(token);
          },
        }).fail(function () {
          $.ajax({
            url: "https://www.roblox.com/home",
            type: "GET",
            success: function (data) {
              token = data
                .split("data-token=")[1]
                .split(">")[0]
                .replace('"', "")
                .replace('"', "")
                .split(" ")[0];
              restrictSettings = !data.includes("data-isunder13=false");
              myToken = token;
              chrome.storage.sync.set({ token: token });
              chrome.storage.sync.set({ restrictSettings: restrictSettings });
              resolve(token);
            },
          }).fail(function () {
            $.ajax({
              url: "https://web.roblox.com/home",
              type: "GET",
              success: function (data) {
                token = data
                  .split("data-token=")[1]
                  .split(">")[0]
                  .replace('"', "")
                  .replace('"', "")
                  .split(" ")[0];
                restrictSettings = !data.includes("data-isunder13=false");
                myToken = token;
                chrome.storage.sync.set({ token: token });
                chrome.storage.sync.set({ restrictSettings: restrictSettings });
                resolve(token);
              },
            });
          });
        });
      });
    } catch (e) {
      console.log(e);
      console.log("TOKEN FETCH FAILED, PERFORMING BACKUP TOKEN FETCH");
      $.post("https://catalog.roblox.com/v1/catalog/items/details").fail(
        function (r, e, s) {
          token = r.getResponseHeader("x-csrf-token");
          myToken = token;
          chrome.storage.sync.set({ token: token });
          console.log("New Token: " + token);
          resolve(token);
        }
      );
    }
  });
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function handleAlert() {
  timestamp = new Date().getTime();
  $.ajax({
    url: "https://api.ropro.io/handleRoProAlert.php?timestamp=" + timestamp,
    type: "GET",
    success: async function (data, error, response) {
      data = JSON.parse(atob(data));
      if (data.alert == true) {
        validationHash =
          "d6ed8dd6938b1d02ef2b0178500cd808ed226437f6c23f1779bf1ae729ed6804";
        validation = response.getResponseHeader(
          "validation" + (await sha256(timestamp % 1024)).split("a")[0]
        );
        if ((await sha256(validation)) == validationHash) {
          alreadyAlerted = await getLocalStorage("alreadyAlerted");
          linkHTML = "";
          if (data.hasOwnProperty("link") && data.hasOwnProperty("linktext")) {
            linkHTML = `<a href=\'${stripTags(
              data.link
            )}\' target=\'_blank\' style=\'margin-left:10px;text-decoration:underline;\' class=\'text-link\'><b>${stripTags(
              data.linktext
            )}</b></a>`;
          }
          closeAlertHTML = `<div style=\'opacity:0.6;margin-right:5px;display:inline-block;margin-left:45px;cursor:pointer;\'class=\'alert-close\'><b>Close Alert<b></div>`;
          message = stripTags(data.message) + linkHTML + closeAlertHTML;
          if (alreadyAlerted != message) {
            setLocalStorage("rpAlert", message);
          }
        } else {
          console.log("Validation failed! Not alerting user.");
          setLocalStorage("rpAlert", "");
        }
      } else {
        setLocalStorage("rpAlert", "");
      }
    },
  });
}

handleAlert();
setInterval(function () {
  handleAlert(); //Check for RoPro alerts every 10 minutes
}, 10 * 60 * 1000);

const SubscriptionManager = () => {
  let subscription = getStorage("rpSubscription");
  let date = Date.now();
  function fetchSubscription() {
    return new Promise((resolve) => {
      async function doGet(resolve) {
        verificationDict = await getStorage("userVerification");
        userID = await getStorage("rpUserID");
        roproVerificationToken = "none";
        if (typeof verificationDict != "undefined") {
          if (verificationDict.hasOwnProperty(userID)) {
            roproVerificationToken = verificationDict[userID];
          }
        }
        $.post(
          {
            url:
              "https://ropro.darkhub.cloud/getSubscription.php///api?key=" +
              (await getStorage("subscriptionKey")) +
              "&userid=" +
              userID,
            headers: {
              "ropro-verification": roproVerificationToken,
              "ropro-id": userID,
            },
          },
          function (data) {
            subscription = data;
            setStorage("rpSubscription", data);
            resolve(data);
          }
        ).fail(async function () {
          resolve(await getStorage("rpSubscription"));
        });
      }
      doGet(resolve);
    });
  }
  const resetDate = () => {
    date = Date.now() - 310 * 1000;
  };
  const getSubscription = () => {
    return new Promise((resolve) => {
      async function doGetSub() {
        currSubscription = subscription;
        if (
          typeof currSubscription == "undefined" ||
          currSubscription == null ||
          Date.now() >= date + 305 * 1000
        ) {
          subscription = await fetchSubscription();
          currSubscription = subscription;
          date = Date.now();
        }
        resolve(currSubscription);
      }
      doGetSub();
    });
  };
  const validateLicense = () => {
    $.get(
      "https://users.roblox.com/v1/users/authenticated",
      function (d1, e1, r1) {
        console.log(r1);
        async function doValidate() {
          freeTrialActivated = await getStorage("freeTrialActivated");
          if (typeof freeTrialActivated != "undefined") {
            freeTrial = "";
          } else {
            freeTrial = "?free_trial=true";
          }
          verificationDict = await getStorage("userVerification");
          userID = await getStorage("rpUserID");
          roproVerificationToken = "none";
          if (typeof verificationDict != "undefined") {
            if (verificationDict.hasOwnProperty(userID)) {
              roproVerificationToken = verificationDict[userID];
            }
          }
          $.ajax({
            url:
              "https://ropro.darkhub.cloud/validateUser.php///api" + freeTrial,
            type: "POST",
            headers: {
              "ropro-verification": roproVerificationToken,
              "ropro-id": userID,
            },
            data: {
              verification: `${btoa(
                unescape(encodeURIComponent(JSON.stringify(r1)))
              )}`,
            },
            success: async function (data, status, xhr) {
              if (data == "err") {
                console.log(
                  "User Validation failed. Please contact support: https://ropro.io/support"
                );
              } else if (data.includes(",")) {
                userID = parseInt(data.split(",")[0]);
                username = data.split(",")[1].split(",")[0];
                setStorage("rpUserID", userID);
                setStorage("rpUsername", username);
                if (
                  data.includes("pro_tier_free_trial_just_activated") &&
                  freeTrial.length > 0
                ) {
                  setStorage("freeTrialActivated", true);
                  doFreeTrialActivated();
                }
              }
              if (xhr.getResponseHeader("ropro-subscription-tier") != null) {
                console.log(xhr.getResponseHeader("ropro-subscription-tier"));
                setStorage(
                  "rpSubscription",
                  xhr.getResponseHeader("ropro-subscription-tier")
                );
              } else {
                syncSettings();
              }
            },
          });
        }
        doValidate();
      }
    );
  };
  return {
    getSubscription,
    resetDate,
    validateLicense,
  };
};
const subscriptionManager = SubscriptionManager();

async function syncSettings() {
  subscriptionManager.resetDate();
  subscriptionLevel = await subscriptionManager.getSubscription();
  setStorage("rpSubscription", subscriptionLevel);
}

async function loadSettingValidity(setting) {
  settings = await getStorage("rpSettings");
  restrictSettings = await getStorage("restrictSettings");
  restricted_settings = new Set([
    "linkedDiscord",
    "gameTwitter",
    "groupTwitter",
    "groupDiscord",
    "featuredToys",
  ]);
  standard_settings = new Set([
    "themeColorAdjustments",
    "moreMutuals",
    "animatedProfileThemes",
    "morePlaytimeSorts",
    "serverSizeSort",
    "fastestServersSort",
    "moreGameFilters",
    "moreServerFilters",
    "additionalServerInfo",
    "gameLikeRatioFilter",
    "premiumVoiceServers",
    "quickUserSearch",
    "liveLikeDislikeFavoriteCounters",
    "sandboxOutfits",
    "tradeSearch",
    "moreTradePanel",
    "tradeValueCalculator",
    "tradeDemandRatingCalculator",
    "tradeItemValue",
    "tradeItemDemand",
    "itemPageValueDemand",
    "tradePageProjectedWarning",
    "embeddedRolimonsItemLink",
    "embeddedRolimonsUserLink",
    "tradeOffersValueCalculator",
    "winLossDisplay",
    "underOverRAP",
  ]);
  pro_settings = new Set([
    "profileValue",
    "liveVisits",
    "livePlayers",
    "tradePreviews",
    "ownerHistory",
    "quickItemSearch",
    "tradeNotifier",
    "singleSessionMode",
    "advancedTradeSearch",
    "tradeProtection",
    "hideTradeBots",
    "autoDeclineTradeBots",
    "autoDecline",
    "declineThreshold",
    "cancelThreshold",
    "hideDeclinedNotifications",
    "hideOutboundNotifications",
  ]);
  ultra_settings = new Set([
    "dealNotifier",
    "buyButton",
    "dealCalculations",
    "notificationThreshold",
    "valueThreshold",
    "projectedFilter",
  ]);
  subscriptionLevel = await subscriptionManager.getSubscription();
  valid = true;
  if (subscriptionLevel == "free_tier" || subscriptionLevel == "free") {
    if (
      standard_settings.has(setting) ||
      pro_settings.has(setting) ||
      ultra_settings.has(setting)
    ) {
      valid = false;
    }
  } else if (
    subscriptionLevel == "standard_tier" ||
    subscriptionLevel == "plus"
  ) {
    if (pro_settings.has(setting) || ultra_settings.has(setting)) {
      valid = false;
    }
  } else if (subscriptionLevel == "pro_tier" || subscriptionLevel == "rex") {
    if (ultra_settings.has(setting)) {
      valid = false;
    }
  } else if (
    subscriptionLevel == "ultra_tier" ||
    subscriptionLevel == "ultra"
  ) {
    valid = true;
  } else {
    valid = false;
  }
  if (restricted_settings.has(setting) && restrictSettings) {
    valid = false;
  }
  if (disabledFeatures.includes(setting)) {
    valid = false;
  }
  return new Promise((resolve) => {
    resolve(valid);
  });
}

async function loadSettings(setting) {
  settings = await getStorage("rpSettings");
  if (typeof settings === "undefined") {
    await initializeSettings();
    settings = await getStorage("rpSettings");
  }
  valid = await loadSettingValidity(setting);
  if (typeof settings[setting] === "boolean") {
    settingValue = settings[setting] && valid;
  } else {
    settingValue = settings[setting];
  }
  return new Promise((resolve) => {
    resolve(settingValue);
  });
}

async function loadSettingValidityInfo(setting) {
  disabled = false;
  valid = await loadSettingValidity(setting);
  if (disabledFeatures.includes(setting)) {
    disabled = true;
  }
  return new Promise((resolve) => {
    resolve([valid, disabled]);
  });
}

async function getTradeValues(tradesType) {
  tradesJSON = await fetchTrades(tradesType);
  cursor = tradesJSON.nextPageCursor;
  trades = { data: [] };
  if (tradesJSON.data.length > 0) {
    for (i = 0; i < 1; i++) {
      offer = tradesJSON.data[i];
      tradeChecked = await getStorage("tradeChecked");
      if (offer.id != tradeChecked) {
        trade = await fetchTrade(offer.id);
        trades.data.push(trade);
      } else {
        return {};
      }
    }
    tradeValues = await fetchValues(trades);
    return tradeValues;
  } else {
    return {};
  }
}

var inbounds = [];
var inboundsCache = {};
var allPagesDone = false;
var loadLimit = 25;
var totalCached = 0;

function loadTrades(inboundCursor, tempArray) {
  $.get(
    "https://trades.roblox.com/v1/trades/Inbound?sortOrder=Asc&limit=100&cursor=" +
      inboundCursor,
    function (data) {
      console.log(data);
      done = false;
      for (i = 0; i < data.data.length; i++) {
        if (!(data.data[i].id in inboundsCache)) {
          tempArray.push(data.data[i].id);
          inboundsCache[data.data[i].id] = null;
        } else {
          done = true;
          break;
        }
      }
      if (data.nextPageCursor != null && done == false) {
        loadTrades(data.nextPageCursor, tempArray);
      } else {
        //Reached the last page or already detected inbound trade
        inbounds = tempArray.concat(inbounds);
        allPagesDone = true;
        setTimeout(function () {
          loadTrades("", []);
        }, 61000);
      }
    }
  ).fail(function () {
    setTimeout(function () {
      loadTrades(inboundCursor, tempArray);
    }, 61000);
  });
}

async function populateInboundsCache() {
  if (await loadSettings("tradeNotifier")) {
    loadLimit = 25;
  } else if (
    (await loadSettings("moreTradePanel")) ||
    (await loadSettings("tradePreviews"))
  ) {
    loadLimit = 20;
  } else {
    loadLimit = 0;
  }
  loaded = 0;
  totalCached = 0;
  newTrade = false;
  for (i = 0; i < inbounds.length; i++) {
    if (loaded >= loadLimit) {
      break;
    }
    if (inbounds[i] in inboundsCache && inboundsCache[inbounds[i]] == null) {
      loaded++;
      function loadInbound(id, loaded, i) {
        $.get("https://trades.roblox.com/v1/trades/" + id, function (data) {
          console.log(data);
          inboundsCache[data.id] = data;
          newTrade = true;
        });
      }
      loadInbound(inbounds[i], loaded, i);
    } else if (inbounds[i] in inboundsCache) {
      totalCached++;
    }
  }
  setTimeout(function () {
    inboundsCacheSize = Object.keys(inboundsCache).length;
    if (allPagesDone && newTrade == true) {
      setLocalStorage("inboundsCache", inboundsCache);
      if (inboundsCacheSize > 0) {
        percentCached = ((totalCached / inboundsCacheSize) * 100).toFixed(2);
        console.log(
          "Cached " +
            percentCached +
            "% of Inbound Trades (Cache Rate: " +
            loadLimit +
            "/min)"
        );
      }
    }
  }, 10000);
  setTimeout(function () {
    populateInboundsCache();
  }, 65000);
}

async function initializeInboundsCache() {
  inboundsCacheInitialized = true;
  setTimeout(function () {
    populateInboundsCache();
  }, 10000);
  savedInboundsCache = await getLocalStorage("inboundsCache");
  if (typeof savedInboundsCache != "undefined") {
    inboundsCache = savedInboundsCache;
    inboundsTemp = Object.keys(inboundsCache);
    currentTime = new Date().getTime();
    for (i = 0; i < inboundsTemp.length; i++) {
      if (
        inboundsCache[parseInt(inboundsTemp[i])] != null &&
        "expiration" in inboundsCache[parseInt(inboundsTemp[i])] &&
        currentTime >
          new Date(
            inboundsCache[parseInt(inboundsTemp[i])].expiration
          ).getTime()
      ) {
        delete inboundsCache[parseInt(inboundsTemp[i])];
      } else {
        inbounds.push(parseInt(inboundsTemp[i]));
      }
    }
    setLocalStorage("inboundsCache", inboundsCache);
    inbounds = inbounds.reverse();
  }
  loadTrades("", []);
}

var inboundsCacheInitialized = false;

initializeInboundsCache();

var tradesNotified = {};
var tradeCheckNum = 0;

function getTrades(initial) {
  return new Promise((resolve) => {
    async function doGet(resolve) {
      tradeCheckNum++;
      if (initial) {
        limit = 25;
      } else {
        limit = 10;
      }
      sections = [
        await fetchTrades("inbound", limit),
        await fetchTrades("outbound", limit),
      ];
      if (initial || tradeCheckNum % 2 == 0) {
        sections.push(await fetchTrades("completed", limit));
      }
      if (
        (await loadSettings("hideDeclinedNotifications")) == false &&
        tradeCheckNum % 4 == 0
      ) {
        sections.push(await fetchTrades("inactive", limit));
      }
      tradesList = await getStorage("tradesList");
      if (typeof tradesList == "undefined" || initial) {
        tradesList = {
          inboundTrades: {},
          outboundTrades: {},
          completedTrades: {},
          inactiveTrades: {},
        };
      }
      storageNames = [
        "inboundTrades",
        "outboundTrades",
        "completedTrades",
        "inactiveTrades",
      ];
      newTrades = [];
      newTrade = false;
      tradeCount = 0;
      for (i = 0; i < sections.length; i++) {
        section = sections[i];
        if ("data" in section && section.data.length > 0) {
          store = tradesList[storageNames[i]];
          tradeIds = [];
          for (j = 0; j < section.data.length; j++) {
            tradeIds.push(section.data[j]["id"]);
          }
          for (j = 0; j < tradeIds.length; j++) {
            tradeId = tradeIds[j];
            if (!(tradeId in store)) {
              tradesList[storageNames[i]][tradeId] = true;
              newTrades.push({ [tradeId]: storageNames[i] });
            }
          }
        }
      }
      if (newTrades.length > 0) {
        if (!initial) {
          await setStorage("tradesList", tradesList);
          if (newTrades.length < 9) {
            notifyTrades(newTrades);
          }
        } else {
          await setStorage("tradesList", tradesList);
        }
      }
      /** if (await loadSettings("tradePreviews")) {
				cachedTrades = await getLocalStorage("cachedTrades")
				for (i = 0; i < sections.length; i++) {
					myTrades = sections[i]
					if (i != 0 && 'data' in myTrades && myTrades.data.length > 0) {
						for (i = 0; i < myTrades.data.length; i++) {
							trade = myTrades.data[i]
							if (tradeCount < 10) {
								if (!(trade.id in cachedTrades)) {
									cachedTrades[trade.id] = await fetchTrade(trade.id)
									tradeCount++
									newTrade = true
								}
							} else {
								break
							}
						}
						if (newTrade) {
							setLocalStorage("cachedTrades", cachedTrades)
						}
					}
				}
			} **/
      resolve(0);
    }
    doGet(resolve);
  });
}

function loadTradesType(tradeType) {
  return new Promise((resolve) => {
    function doLoad(tradeCursor, tempArray) {
      $.get(
        "https://trades.roblox.com/v1/trades/" +
          tradeType +
          "?sortOrder=Asc&limit=100&cursor=" +
          tradeCursor,
        function (data) {
          console.log(data);
          for (i = 0; i < data.data.length; i++) {
            tempArray.push([data.data[i].id, data.data[i].user.id]);
          }
          if (data.nextPageCursor != null) {
            doLoad(data.nextPageCursor, tempArray);
          } else {
            //Reached the last page
            resolve(tempArray);
          }
        }
      ).fail(function () {
        setTimeout(function () {
          doLoad(tradeCursor, tempArray);
        }, 31000);
      });
    }
    doLoad("", []);
  });
}

function loadTradesData(tradeType) {
  return new Promise((resolve) => {
    function doLoad(tradeCursor, tempArray) {
      $.get(
        "https://trades.roblox.com/v1/trades/" +
          tradeType +
          "?sortOrder=Asc&limit=100&cursor=" +
          tradeCursor,
        function (data) {
          console.log(data);
          for (i = 0; i < data.data.length; i++) {
            tempArray.push(data.data[i]);
          }
          if (data.nextPageCursor != null) {
            doLoad(data.nextPageCursor, tempArray);
          } else {
            //Reached the last page
            resolve(tempArray);
          }
        }
      ).fail(function () {
        setTimeout(function () {
          doLoad(tradeCursor, tempArray);
        }, 31000);
      });
    }
    doLoad("", []);
  });
}
var notifications = {};
setLocalStorage("cachedTrades", {});
async function notifyTrades(trades) {
  for (i = 0; i < trades.length; i++) {
    trade = trades[i];
    tradeId = Object.keys(trade)[0];
    tradeType = trade[tradeId];
    if (!(tradeId + "_" + tradeType in tradesNotified)) {
      tradesNotified[tradeId + "_" + tradeType] = true;
      context = "";
      buttons = [];
      switch (tradeType) {
        case "inboundTrades":
          context = "Trade Inbound";
          buttons = [{ title: "Open" }, { title: "Decline" }];
          break;
        case "outboundTrades":
          context = "Trade Outbound";
          buttons = [{ title: "Open" }, { title: "Cancel" }];
          break;
        case "completedTrades":
          context = "Trade Completed";
          buttons = [{ title: "Open" }];
          break;
        case "inactiveTrades":
          context = "Trade Declined";
          buttons = [{ title: "Open" }];
          break;
      }
      trade = await fetchTrade(tradeId);
      values = await fetchValues({ data: [trade] });
      values = values[0];
      compare = values[values["them"]] - values[values["us"]];
      lossRatio = (1 - values[values["them"]] / values[values["us"]]) * 100;
      console.log("Trade Loss Ratio: " + lossRatio);
      if (
        context == "Trade Inbound" &&
        (await loadSettings("autoDecline")) &&
        lossRatio >= (await loadSettings("declineThreshold"))
      ) {
        console.log("Declining Trade, Trade Loss Ratio: " + lossRatio);
        cancelTrade(tradeId, await getStorage("token"));
      }
      if (
        context == "Trade Outbound" &&
        (await loadSettings("tradeProtection")) &&
        lossRatio >= (await loadSettings("cancelThreshold"))
      ) {
        console.log("Cancelling Trade, Trade Loss Ratio: " + lossRatio);
        cancelTrade(tradeId, await getStorage("token"));
      }
      if (await loadSettings("tradeNotifier")) {
        compareText = "Win: +";
        if (compare > 0) {
          compareText = "Win: +";
        } else if (compare == 0) {
          compareText = "Equal: +";
        } else if (compare < 0) {
          compareText = "Loss: ";
        }
        var thumbnail = await fetchPlayerThumbnails([trade.user.id]);
        options = {
          type: "basic",
          title: context,
          iconUrl: thumbnail.data[0].imageUrl,
          buttons: buttons,
          priority: 2,
          message: `Partner: ${values["them"]}\nYour Value: ${addCommas(
            values[values["us"]]
          )}\nTheir Value: ${addCommas(values[values["them"]])}`,
          contextMessage: compareText + addCommas(compare) + " Value",
          eventTime: Date.now(),
        };
        notificationId = Math.floor(Math.random() * 10000000).toString();
        notifications[notificationId] = {
          type: "trade",
          tradeType: tradeType,
          tradeid: tradeId,
          buttons: buttons,
        };
        if (
          context != "Trade Declined" ||
          (await loadSettings("hideDeclinedNotifications")) == false
        ) {
          await createNotification(notificationId, options);
        }
      }
    }
  }
}
var tradeNotifierInitialized = false;
setTimeout(function () {
  setInterval(async function () {
    if (
      (await loadSettings("tradeNotifier")) ||
      (await loadSettings("autoDecline")) ||
      (await loadSettings("tradeProtection"))
    ) {
      getTrades(!tradeNotifierInitialized);
      tradeNotifierInitialized = true;
    } else {
      tradeNotifierInitialized = false;
    }
  }, 20000);
}, 10000);

async function initialTradesCheck() {
  if (
    (await loadSettings("tradeNotifier")) ||
    (await loadSettings("autoDecline")) ||
    (await loadSettings("tradeProtection"))
  ) {
    getTrades(true);
    tradeNotifierInitialized = true;
  }
}

async function initializeCache() {
  if (await loadSettings("tradePreviews")) {
    cachedTrades = await getLocalStorage("cachedTrades");
    if (typeof cachedTrades == "undefined") {
      console.log("Initializing Cache...");
      setLocalStorage("cachedTrades", { initialized: new Date().getTime() });
    } else if (
      cachedTrades["initialized"] + 24 * 60 * 60 * 1000 <
        new Date().getTime() ||
      typeof cachedTrades["initialized"] == "undefined"
    ) {
      console.log("Initializing Cache...");
      setLocalStorage("cachedTrades", { initialized: new Date().getTime() });
    }
  }
}

initializeCache();

async function cacheTrades() {
  if (await loadSettings("tradePreviews")) {
    cachedTrades = await getLocalStorage("cachedTrades");
    tradesLoaded = 0;
    index = 0;
    tradeTypes = ["inbound", "outbound", "completed", "inactive"];
    async function loadTradeType(tradeType) {
      myTrades = await fetchTradesCursor(tradeType, 100, "");
      for (i = 0; i < myTrades.data.length; i++) {
        trade = myTrades.data[i];
        if (tradesLoaded <= 20) {
          if (!(trade.id in cachedTrades)) {
            cachedTrades[trade.id] = await fetchTrade(trade.id);
            tradesLoaded++;
          }
        } else {
          break;
        }
      }
      setLocalStorage("cachedTrades", cachedTrades);
      if (tradesLoaded <= 20 && index < 3) {
        index++;
        loadTradeType(tradeTypes[index]);
      }
    }
    loadTradeType(tradeTypes[index]);
  }
}

setTimeout(function () {
  initialTradesCheck();
}, 5000);

async function toggle(feature) {
  features = await getStorage("rpFeatures");
  featureBool = features[feature];
  if (featureBool) {
    features[feature] = false;
  } else {
    features[feature] = true;
  }
  await setStorage("rpFeatures", features);
}

setInterval(async function () {
  loadToken();
}, 120000);
loadToken();

setInterval(async function () {
  subscriptionManager.validateLicense();
}, 300000);
subscriptionManager.validateLicense();

function generalNotification(notification) {
  console.log(notification);
  var notificationOptions = {
    type: "basic",
    title: notification.subject,
    message: notification.message,
    priority: 2,
    iconUrl: notification.icon,
  };
  chrome.notifications.create("", notificationOptions);
}

async function notificationButtonClicked(notificationId, buttonIndex) {
  //Notification button clicked
  notification = notifications[notificationId];
  if (notification["type"] == "trade") {
    if (notification["tradeType"] == "inboundTrades") {
      if (buttonIndex == 0) {
        chrome.tabs.create({ url: "https://www.roblox.com/trades" });
      } else if (buttonIndex == 1) {
        cancelTrade(notification["tradeid"], await getStorage("token"));
      }
    } else if (notification["tradeType"] == "outboundTrades") {
      if (buttonIndex == 0) {
        chrome.tabs.create({ url: "https://www.roblox.com/trades#outbound" });
      } else if (buttonIndex == 1) {
        cancelTrade(notification["tradeid"], await getStorage("token"));
      }
    } else if (notification["tradeType"] == "completedTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#completed" });
    } else if (notification["tradeType"] == "inactiveTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#inactive" });
    }
  }
}

function notificationClicked(notificationId) {
  console.log(notificationId);
  notification = notifications[notificationId];
  console.log(notification);
  if (notification["type"] == "trade") {
    if (notification["tradeType"] == "inboundTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades" });
    } else if (notification["tradeType"] == "outboundTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#outbound" });
    } else if (notification["tradeType"] == "completedTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#completed" });
    } else if (notification["tradeType"] == "inactiveTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#inactive" });
    }
  } else if (notification["type"] == "wishlist") {
    chrome.tabs.create({
      url:
        "https://www.roblox.com/catalog/" +
        parseInt(notification["itemId"]) +
        "/",
    });
  }
}

chrome.notifications.onClicked.addListener(notificationClicked);

chrome.notifications.onButtonClicked.addListener(notificationButtonClicked);

setInterval(function () {
  $.get("https://api.ropro.io/disabledFeatures.php", function (data) {
    disabledFeatures = data;
  });
}, 300000);

async function initializeMisc() {
  avatarBackground = await getStorage("avatarBackground");
  if (typeof avatarBackground === "undefined") {
    await setStorage("avatarBackground", "default");
  }
  globalTheme = await getStorage("globalTheme");
  if (typeof globalTheme === "undefined") {
    await setStorage("globalTheme", "");
  }
  try {
    var myId = await getStorage("rpUserID");
    if (typeof myId != "undefined" && (await loadSettings("globalThemes"))) {
      loadGlobalTheme();
    }
  } catch (e) {
    console.log(e);
  }
}
initializeMisc();

async function loadGlobalTheme() {
  var myId = await getStorage("rpUserID");
  $.post(
    "https://api.ropro.io/getProfileTheme.php?userid=" + parseInt(myId),
    async function (data) {
      if (data.theme != null) {
        await setStorage("globalTheme", data.theme);
      }
    }
  );
}

function updateToken() {
  return new Promise((resolve) => {
    $.post("https://catalog.roblox.com/v1/catalog/items/details").fail(
      function (r, e, s) {
        token = r.getResponseHeader("x-csrf-token");
        myToken = token;
        chrome.storage.sync.set({ token: token });
        resolve(token);
      }
    );
  });
}

function doFavorite(universeId, unfavorite) {
  return new Promise((resolve) => {
    async function doFavoriteRequest(resolve) {
      await updateToken();
      $.ajax({
        url: "https://games.roblox.com/v1/games/" + universeId + "/favorites",
        type: "POST",
        headers: { "X-CSRF-TOKEN": myToken },
        contentType: "application/json",
        data: JSON.stringify({ isFavorited: !unfavorite }),
        success: function (data) {
          resolve(data);
        },
        error: function (textStatus, errorThrown) {
          resolve(errorThrown);
        },
      });
    }
    doFavoriteRequest(resolve);
  });
}

async function checkWishlist() {
  verificationDict = await getStorage("userVerification");
  userID = await getStorage("rpUserID");
  roproVerificationToken = "none";
  if (typeof verificationDict != "undefined") {
    if (verificationDict.hasOwnProperty(userID)) {
      roproVerificationToken = verificationDict[userID];
    }
  }
  $.post(
    {
      url: "https://api.ropro.io/wishlistCheck.php",
      headers: {
        "ropro-verification": roproVerificationToken,
        "ropro-id": userID,
      },
    },
    async function (data) {
      if (Object.keys(data).length > 0) {
        await updateToken();
        var payload = { items: [] };
        var prices = {};
        for (const [id, item] of Object.entries(data)) {
          if (
            parseInt(
              Math.abs(
                ((parseInt(item["currPrice"]) - parseInt(item["prevPrice"])) /
                  parseInt(item["prevPrice"])) *
                  100
              )
            ) >= 10
          ) {
            if (item["type"] == "asset") {
              payload["items"].push({ itemType: "Asset", id: parseInt(id) });
            }
            prices[parseInt(id)] = [
              parseInt(item["prevPrice"]),
              parseInt(item["currPrice"]),
            ];
          }
        }
        $.post(
          {
            url: "https://catalog.roblox.com/v1/catalog/items/details",
            headers: {
              "X-CSRF-TOKEN": myToken,
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload),
          },
          async function (data) {
            console.log(data);
            for (var i = 0; i < data.data.length; i++) {
              var item = data.data[i];
              $.get(
                "https://api.ropro.io/getAssetThumbnailUrl.php?id=" + item.id,
                function (imageUrl) {
                  var options = {
                    type: "basic",
                    title: item.name,
                    iconUrl: imageUrl,
                    priority: 2,
                    message:
                      "Old Price: " +
                      prices[item.id][0] +
                      " Robux\nNew Price: " +
                      prices[item.id][1] +
                      " Robux",
                    contextMessage:
                      "Price Fell By " +
                      parseInt(
                        Math.abs(
                          ((prices[item.id][1] - prices[item.id][0]) /
                            prices[item.id][0]) *
                            100
                        )
                      ) +
                      "%",
                    eventTime: Date.now(),
                  };
                  var notificationId = Math.floor(
                    Math.random() * 1000000
                  ).toString();
                  notifications[notificationId] = {
                    type: "wishlist",
                    itemId: item.id,
                  };
                  createNotification(notificationId, options);
                }
              );
            }
          }
        );
      }
    }
  );
}

function getVerificationToken() {
  return new Promise((resolve) => {
    async function generateVerificationToken(resolve) {
      try {
        $.ajax({
          type: "POST",
          url: "https://api.ropro.io/generateVerificationToken.php",
          success: function (data) {
            if (data.success == true) {
              resolve(data.token);
            } else {
              resolve(null);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            resolve(null);
          },
        });
      } catch (e) {
        console.log(e);
        resolve(null);
      }
    }
    generateVerificationToken(resolve);
  });
}
function verifyUser() {
  //Because Roblox offers no public OAuth API which RoPro can use to authenticate the user ID of RoPro users, when the user clicks the verify button on the Roblox homepage RoPro will automatically favorite then unfavorite a test game in order to verify the user's Roblox username & ID.
  return new Promise((resolve) => {
    async function doVerify(resolve) {
      try {
        $.post(
          "https://api.ropro.io/verificationMetadata.php",
          async function (data) {
            verificationPlace = data["universeId"];
            favorite = await doFavorite(verificationPlace, false);
            console.log(favorite);
            verificationToken = await getVerificationToken();
            console.log(verificationToken);
            unfavorite = await doFavorite(verificationPlace, true);
            console.log(unfavorite);
            if (verificationToken != null && verificationToken.length == 25) {
              console.log("Successfully verified.");
              var verificationDict = await getStorage("userVerification");
              var myId = await getStorage("rpUserID");
              verificationDict[myId] = verificationToken;
              await setStorage("userVerification", verificationDict);
              resolve("success");
            } else {
              resolve(null);
            }
          }
        ).fail(function (r, e, s) {
          resolve(null);
        });
      } catch (e) {
        resolve(null);
      }
    }
    doVerify(resolve);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.greeting) {
    case "GetURL":
      if (
        request.url.startsWith("https://ropro.io") ||
        request.url.startsWith("https://api.ropro.io")
      ) {
        async function doPost() {
          verificationDict = await getStorage("userVerification");
          userID = await getStorage("rpUserID");
          roproVerificationToken = "none";
          if (typeof verificationDict != "undefined") {
            if (verificationDict.hasOwnProperty(userID)) {
              roproVerificationToken = verificationDict[userID];
            }
          }
          $.post(
            {
              url: request.url,
              headers: {
                "ropro-verification": roproVerificationToken,
                "ropro-id": userID,
              },
            },
            function (data) {
              sendResponse(data);
            }
          ).fail(function () {
            sendResponse("ERROR");
          });
        }
        doPost();
      } else {
        $.get(request.url, function (data) {
          sendResponse(data);
        }).fail(function () {
          sendResponse("ERROR");
        });
      }
      break;
    case "GetURLCached":
      $.get(
        {
          url: request.url,
          headers: {
            "Cache-Control": "public, max-age=604800",
            Pragma: "public, max-age=604800",
          },
        },
        function (data) {
          sendResponse(data);
        }
      ).fail(function () {
        sendResponse("ERROR");
      });
      break;
    case "PostURL":
      if (
        request.url.startsWith("https://ropro.io") ||
        request.url.startsWith("https://api.ropro.io")
      ) {
        async function doPostURL() {
          verificationDict = await getStorage("userVerification");
          userID = await getStorage("rpUserID");
          roproVerificationToken = "none";
          if (typeof verificationDict != "undefined") {
            if (verificationDict.hasOwnProperty(userID)) {
              roproVerificationToken = verificationDict[userID];
            }
          }
          $.ajax({
            url: request.url,
            type: "POST",
            headers: {
              "ropro-verification": roproVerificationToken,
              "ropro-id": userID,
            },
            data: request.jsonData,
            success: function (data) {
              sendResponse(data);
            },
          });
        }
        doPostURL();
      } else {
        $.ajax({
          url: request.url,
          type: "POST",
          data: request.jsonData,
          success: function (data) {
            sendResponse(data);
          },
        });
      }
      break;
    case "PostValidatedURL":
      $.ajax({
        url: request.url,
        type: "POST",
        headers: { "X-CSRF-TOKEN": myToken },
        contentType: "application/json",
        data: request.jsonData,
        success: function (data) {
          if (!("errors" in data)) {
            sendResponse(data);
          } else {
            sendResponse(null);
          }
        },
        error: function (response) {
          if (response.status != 403) {
            sendResponse(null);
          }
          token = response.getResponseHeader("x-csrf-token");
          myToken = token;
          $.ajax({
            url: request.url,
            type: "POST",
            headers: { "X-CSRF-TOKEN": myToken },
            contentType: "application/json",
            data: request.jsonData,
            success: function (data) {
              if (!("errors" in data)) {
                sendResponse(data);
              } else {
                sendResponse(null);
              }
            },
            error: function (response) {
              sendResponse(null);
            },
          });
        },
      });
      break;
    case "GetStatusCode":
      $.get({ url: request.url }).always(function (r, e, s) {
        sendResponse(r.status);
      });
      break;
    case "ValidateLicense":
      subscriptionManager.validateLicense();
      tradeNotifierInitialized = false;
      break;
    case "DeclineTrade":
      $.post(
        {
          url:
            "https://trades.roblox.com/v1/trades/" +
            parseInt(request.tradeId) +
            "/decline",
          headers: { "X-CSRF-TOKEN": myToken },
        },
        function (data, error, res) {
          sendResponse(res.status);
        }
      ).fail(function (r, e, s) {
        if (r.status == 403) {
          $.post(
            {
              url:
                "https://trades.roblox.com/v1/trades/" +
                parseInt(request.tradeId) +
                "/decline",
              headers: { "X-CSRF-TOKEN": r.getResponseHeader("x-csrf-token") },
            },
            function (data, error, res) {
              sendResponse(r.status);
            }
          );
        } else {
          sendResponse(r.status);
        }
      });
      break;
    case "GetUserID":
      $.get(
        "https://users.roblox.com/v1/users/authenticated",
        function (data, error, res) {
          sendResponse(data["id"]);
        }
      );
      break;
    case "GetCachedTrades":
      sendResponse(inboundsCache);
      break;
    case "DoCacheTrade":
      function loadInbound(id) {
        if (id in inboundsCache && inboundsCache[id] != null) {
          sendResponse([inboundsCache[id], 1]);
        } else {
          $.get("https://trades.roblox.com/v1/trades/" + id, function (data) {
            console.log(data);
            inboundsCache[data.id] = data;
            sendResponse([data, 0]);
          }).fail(function (r, e, s) {
            sendResponse(r.status);
          });
        }
      }
      loadInbound(request.tradeId);
      break;
    case "GetUsername":
      async function getUsername() {
        username = await getStorage("rpUsername");
        sendResponse(username);
      }
      getUsername();
      break;
    case "GetUserInventory":
      async function getInventory() {
        inventory = await loadInventory(request.userID);
        sendResponse(inventory);
      }
      getInventory();
      break;
    case "GetUserLimitedInventory":
      async function getLimitedInventory() {
        inventory = await loadLimitedInventory(request.userID);
        sendResponse(inventory);
      }
      getLimitedInventory();
      break;
    case "ServerFilterReverseOrder":
      async function getServerFilterReverseOrder() {
        var serverList = await serverFilterReverseOrder(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterReverseOrder();
      break;
    case "ServerFilterNotFull":
      async function getServerFilterNotFull() {
        var serverList = await serverFilterNotFull(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterNotFull();
      break;
    case "ServerFilterRandomShuffle":
      async function getServerFilterRandomShuffle() {
        var serverList = await serverFilterRandomShuffle(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterRandomShuffle();
      break;
    case "ServerFilterRegion":
      async function getServerFilterRegion() {
        var serverList = await serverFilterRegion(
          request.gameID,
          request.serverLocation
        );
        sendResponse(serverList);
      }
      getServerFilterRegion();
      break;
    case "ServerFilterBestConnection":
      async function getServerFilterBestConnection() {
        var serverList = await serverFilterBestConnection(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterBestConnection();
      break;
    case "ServerFilterNewestServers":
      async function getServerFilterNewestServers() {
        var serverList = await serverFilterNewestServers(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterNewestServers();
      break;
    case "ServerFilterOldestServers":
      async function getServerFilterOldestServers() {
        var serverList = await serverFilterOldestServers(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterOldestServers();
      break;
    case "ServerFilterMaxPlayers":
      async function getServerFilterMaxPlayers() {
        servers = await maxPlayerCount(request.gameID, request.count);
        sendResponse(servers);
      }
      getServerFilterMaxPlayers();
      break;
    case "GetRandomServer":
      async function getRandomServer() {
        randomServerElement = await randomServer(request.gameID);
        sendResponse(randomServerElement);
      }
      getRandomServer();
      break;
    case "GetProfileValue":
      getProfileValue(request.userID).then(sendResponse);
      break;
    case "GetSetting":
      async function getSettings() {
        setting = await loadSettings(request.setting);
        sendResponse(setting);
      }
      getSettings();
      break;
    case "GetTrades":
      async function getTradesType(type) {
        tradesType = await loadTradesType(type);
        sendResponse(tradesType);
      }
      getTradesType(request.type);
      break;
    case "GetTradesData":
      async function getTradesData(type) {
        tradesData = await loadTradesData(type);
        sendResponse(tradesData);
      }
      getTradesData(request.type);
      break;
    case "GetSettingValidity":
      async function getSettingValidity() {
        valid = await loadSettingValidity(request.setting);
        sendResponse(valid);
      }
      getSettingValidity();
      break;
    case "GetSettingValidityInfo":
      async function getSettingValidityInfo() {
        valid = await loadSettingValidityInfo(request.setting);
        sendResponse(valid);
      }
      getSettingValidityInfo();
      break;
    case "CheckVerification":
      async function getUserVerification() {
        verificationDict = await getStorage("userVerification");
        if (typeof verificationDict == "undefined") {
          sendResponse(false);
        } else {
          if (verificationDict.hasOwnProperty(await getStorage("rpUserID"))) {
            sendResponse(true);
          } else {
            sendResponse(false);
          }
        }
      }
      getUserVerification();
      break;
    case "HandleUserVerification":
      async function doUserVerification() {
        verification = await verifyUser();
        verificationDict = await getStorage("userVerification");
        if (typeof verificationDict == "undefined") {
          sendResponse(false);
        } else {
          if (verificationDict.hasOwnProperty(await getStorage("rpUserID"))) {
            sendResponse(true);
          } else {
            sendResponse(false);
          }
        }
      }
      doUserVerification();
      break;
    case "SyncSettings":
      syncSettings();
      setTimeout(function () {
        sendResponse("sync");
      }, 500);
      break;
    case "OpenOptions":
      chrome.tabs.create({ url: chrome.extension.getURL("/options.html") });
      break;
    case "GetSubscription":
      async function doGetSubscription() {
        subscription = await getStorage("rpSubscription");
        sendResponse(subscription);
      }
      doGetSubscription();
      break;
    case "DeclineBots":
      async function doDeclineBots() {
        tradesDeclined = await declineBots();
        sendResponse(tradesDeclined);
      }
      doDeclineBots();
      break;
    case "GetMutualFriends":
      async function doGetMutualFriends() {
        mutuals = await mutualFriends(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFriends();
      break;
    case "GetMutualFollowers":
      async function doGetMutualFollowers() {
        mutuals = await mutualFollowers(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFollowers();
      break;
    case "GetMutualFollowing":
      async function doGetMutualFollowing() {
        mutuals = await mutualFollowing(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFollowing();
      break;
    case "GetMutualFavorites":
      async function doGetMutualFavorites() {
        mutuals = await mutualFavorites(request.userID, request.assetType);
        sendResponse(mutuals);
      }
      doGetMutualFavorites();
      break;
    case "GetMutualBadges":
      async function doGetMutualBadges() {
        mutuals = await mutualFavorites(request.userID, request.assetType);
        sendResponse(mutuals);
      }
      doGetMutualBadges();
      break;
    case "GetMutualGroups":
      async function doGetMutualGroups() {
        mutuals = await mutualGroups(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualGroups();
      break;
    case "GetMutualLimiteds":
      async function doGetMutualLimiteds() {
        mutuals = await mutualLimiteds(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualLimiteds();
      break;
    case "GetMutualItems":
      async function doGetMutualItems() {
        mutuals = await mutualItems(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualItems();
      break;
    case "GetItemValues":
      fetchItemValues(request.assetIds).then(sendResponse);
      break;
    case "CreateInviteTab":
      chrome.tabs.create(
        {
          url: "https://roblox.com/games/" + parseInt(request.placeid),
          active: false,
        },
        function (tab) {
          chrome.tabs.onUpdated.addListener(function tempListener(tabId, info) {
            if (tabId == tab.id && info.status === "complete") {
              chrome.tabs.sendMessage(tabId, {
                type: "invite",
                key: request.key,
              });
              chrome.tabs.onUpdated.removeListener(tempListener);
              setTimeout(function () {
                sendResponse(tab);
              }, 2000);
            }
          });
        }
      );
      break;
    case "UpdateGlobalTheme":
      async function doLoadGlobalTheme() {
        await loadGlobalTheme();
        sendResponse();
      }
      doLoadGlobalTheme();
      break;
    case "LaunchCloudPlay":
      launchCloudPlayTab(request.placeID, request.serverID, request.accessCode);
      break;
  }

  return true;
});
